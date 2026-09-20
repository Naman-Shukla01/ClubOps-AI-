import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Meeting from '../models/Meeting.js';
import Risk from '../models/Risk.js';
import { generateStructuredResponse } from './geminiService.js';
import { AppError } from '../middleware/errorMiddleware.js';

/**
 * Helper to parse relative date terms like "tomorrow", "next friday", etc.
 */
function parseNaturalDate(dateString) {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  const lower = dateString.toLowerCase().trim();
  const now = new Date();

  if (lower === 'today') {
    now.setHours(23, 59, 59, 999);
    return now;
  }
  if (lower === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    return tomorrow;
  }
  if (lower.startsWith('in ') && lower.includes('day')) {
    const days = parseInt(lower.replace(/\D/g, ''), 10) || 1;
    const target = new Date(now);
    target.setDate(now.getDate() + days);
    return target;
  }

  return new Date(Date.now() + 24 * 60 * 60 * 1000); // default 24h
}

/**
 * Resolve or create a User by name/email
 */
async function resolveUser(nameOrEmail, clubId) {
  if (!nameOrEmail || typeof nameOrEmail !== 'string') return null;
  const cleanName = nameOrEmail.trim();
  if (!cleanName) return null;

  const query = {
    $or: [
      { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
      { email: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
      { name: { $regex: new RegExp(cleanName, 'i') } }
    ]
  };

  if (clubId && mongoose.isValidObjectId(clubId)) {
    query.club = clubId;
  }

  let user = await User.findOne(query);

  if (!user) {
    const sanitizedEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@clubops.ai`;
    let uniqueEmail = sanitizedEmail;
    let count = 1;
    while (await User.findOne({ email: uniqueEmail })) {
      uniqueEmail = `${sanitizedEmail.split('@')[0]}${count++}@clubops.ai`;
    }

    user = await User.create({
      name: cleanName,
      email: uniqueEmail,
      role: 'volunteer',
      club: (clubId && mongoose.isValidObjectId(clubId)) ? clubId : undefined,
    });
  }

  return user;
}

/**
 * Resolve or get default Event
 */
async function resolveEvent(eventId, eventName, clubId) {
  if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
    const event = await Event.findById(eventId);
    if (event) return event;
  }

  const query = {};
  if (clubId && mongoose.isValidObjectId(clubId)) {
    query.club = clubId;
  }

  if (eventName) {
    query.name = { $regex: new RegExp(eventName, 'i') };
    const event = await Event.findOne(query);
    if (event) return event;
  }

  // Fallback to the latest active/planning event
  let defaultEvent = await Event.findOne({
    ...query,
    status: { $in: ['planning', 'upcoming', 'ongoing'] }
  }).sort({ createdAt: -1 });

  if (!defaultEvent) {
    defaultEvent = await Event.findOne(query).sort({ createdAt: -1 });
  }

  if (!defaultEvent) {
    const defaultAdmin = (await User.findOne()) || (await User.create({
      name: 'Club Lead',
      email: 'lead@clubops.ai',
      role: 'lead'
    }));

    defaultEvent = await Event.create({
      name: 'Club Operations 2026',
      description: 'Default main club operations and hackathon event',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'planning',
      club: (clubId && mongoose.isValidObjectId(clubId)) ? clubId : null,
      createdBy: defaultAdmin._id
    });
  }

  return defaultEvent;
}

/**
 * Fallback heuristic parser when Gemini API is offline or unconfigured
 */
function parseIntentHeuristically(prompt) {
  const text = prompt.trim();
  const lower = text.toLowerCase();

  // Pattern: Assign <User> to <Task> and move deadline to <Date>
  const assignMatch = lower.match(/assign\s+([a-zA-Z\s]+?)\s+to\s+([a-zA-Z0-9\s]+?)(?:\s+(?:and|with)\s+(?:move\s+)?deadline\s+(?:to\s+)?(.+))?$/i);
  if (assignMatch) {
    return {
      action: 'ASSIGN_TASK',
      targetEntity: 'Task',
      taskDetails: {
        assigneeName: assignMatch[1].trim(),
        targetTaskSearch: assignMatch[2].trim(),
        deadline: assignMatch[3] ? assignMatch[3].trim() : null
      },
      conversationalResponse: `Assigned ${assignMatch[1].trim()} to ${assignMatch[2].trim()}${assignMatch[3] ? ` with deadline ${assignMatch[3].trim()}` : ''}.`
    };
  }

  // Pattern: Complete / Mark task <Task> as completed/done
  const completeMatch = lower.match(/(?:mark|set|complete)\s+(?:task\s+)?([a-zA-Z0-9\s]+?)\s+(?:as\s+)?(completed|done|finished)/i);
  if (completeMatch) {
    return {
      action: 'COMPLETE_TASK',
      targetEntity: 'Task',
      taskDetails: {
        targetTaskSearch: completeMatch[1].trim(),
        status: 'completed'
      },
      conversationalResponse: `Marked task "${completeMatch[1].trim()}" as completed.`
    };
  }

  // Pattern: Create task <Task> (with priority <P>) (due <D>)
  const createMatch = lower.match(/create\s+(?:a\s+)?task\s+(?:for\s+|named\s+|called\s+)?([a-zA-Z0-9\s]+?)(?:\s+with\s+([a-zA-Z]+)\s+priority)?(?:\s+(?:due|by|on)\s+(.+))?$/i);
  if (createMatch) {
    const priority = ['low', 'medium', 'high', 'critical'].includes(createMatch[2]?.toLowerCase())
      ? createMatch[2].toLowerCase()
      : 'medium';
    return {
      action: 'CREATE_TASK',
      targetEntity: 'Task',
      taskDetails: {
        title: createMatch[1].trim(),
        priority,
        deadline: createMatch[3] ? createMatch[3].trim() : null,
        status: 'todo'
      },
      conversationalResponse: `Created task "${createMatch[1].trim()}" with ${priority} priority.`
    };
  }

  // Generic fallback query
  return {
    reasoning: "AI Service is temporarily unavailable. Using offline basic parser.",
    actions: [{
      action: 'GENERAL_CHAT',
      targetEntity: 'None',
      conversationalResponse: `The AI is currently experiencing high demand and is unavailable. I am running in basic offline mode and did not understand your command. Try simple commands like 'Create a task for Alex' or try again in a few moments.`
    }]
  };
}

const SINGLE_ACTION_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: [
        'CREATE_TASK', 'UPDATE_TASK', 'ASSIGN_TASK', 'COMPLETE_TASK', 'DELETE_TASK',
        'CREATE_EVENT', 'UPDATE_EVENT', 'CREATE_MEETING', 'CREATE_RISK', 'QUERY_INFO', 'GENERAL_CHAT'
      ],
      description: 'The database action to perform'
    },
    targetEntity: {
      type: 'string',
      enum: ['Task', 'Event', 'Meeting', 'Risk', 'User', 'None']
    },
    taskDetails: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        targetTaskSearch: { type: 'string', description: 'Keywords or title to search for an existing task to update' },
        description: { type: 'string' },
        assigneeName: { type: 'string' },
        deadline: { type: 'string', description: 'ISO date string or natural date like tomorrow' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        status: { type: 'string', enum: ['todo', 'in_progress', 'blocked', 'completed'] }
      }
    },
    eventDetails: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        targetEventSearch: { type: 'string' },
        description: { type: 'string' },
        startDate: { type: 'string' },
        endDate: { type: 'string' },
        location: { type: 'string' },
        status: { type: 'string', enum: ['planning', 'upcoming', 'ongoing', 'completed', 'cancelled'] }
      }
    },
    meetingDetails: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        date: { type: 'string' },
        summary: { type: 'string' }
      }
    },
    riskDetails: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        type: { type: 'string', enum: ['deadline', 'resource', 'volunteer', 'dependency', 'communication', 'logistics', 'other'] }
      }
    },
    conversationalResponse: {
      type: 'string',
      description: 'A friendly, professional confirmation message explaining this specific database action.'
    }
  },
  required: ['action', 'targetEntity', 'conversationalResponse']
};

const ACTION_SCHEMA = {
  type: 'object',
  properties: {
    reasoning: {
      type: 'string',
      description: 'The step-by-step reasoning explaining how you are interpreting the user prompt and what actions you will take.'
    },
    overallResponse: {
      type: 'string',
      description: 'A friendly, combined summary response of all actions performed for the user.'
    },
    actions: {
      type: 'array',
      items: SINGLE_ACTION_SCHEMA,
      description: 'A list of distinct actions to execute based on the user prompt.'
    }
  },
  required: ['reasoning', 'overallResponse', 'actions']
};

/**
 * Parses user prompt using Gemini 2.5 Structured Output
 */
async function parseUserIntent(prompt, contextInfo = {}) {
  const systemInstruction = `You are ClubOps AI Copilot, an intelligent operations assistant for college clubs and hackathons.
Your role is to understand user natural language commands and convert them into structured database actions on Mongoose models (Tasks, Events, Meetings, Risks).

Current System Context:
- Current Timestamp: ${new Date().toISOString()}
- Active Event Context: ${contextInfo.eventName || 'General Club Operations'}
- Known Volunteers/Users: ${contextInfo.userNames || 'Sarah, Alex, Rahul, Priyansh, Diya, Naman, Drishti'}
- Known Recent Tasks: ${contextInfo.taskTitles || 'Stage setup, Audio visual check, Sponsorship outreach, Catering logistics'}
- Recent Meetings/Transcripts:
${contextInfo.recentMeetings || 'None available'}

Rules:
1. Break down complex requests into multiple discrete actions if necessary.
2. Output your reasoning first, explaining your interpretation of the user's request.
3. Map actions to valid action enums (e.g., ASSIGN_TASK, CREATE_TASK).
4. CRITICAL: DO NOT hallucinate tasks, assignees, or deadlines based on the "Current System Context" if they are not explicitly requested by the user or present in the provided text. The System Context is ONLY for resolving names and entities, NOT for inventing work. If the user provides a text/transcript with no actionable tasks, output a GENERAL_CHAT action explaining that no tasks were found.
5. EXTREMELY CRITICAL: You MUST explicitly extract priority levels (low, medium, high, critical) and severity levels (low, medium, high, critical) into the 'priority' and 'severity' fields when mentioned by the user. Do not omit these fields if a priority or severity is specified.
6. Output an overall response summarizing everything, and return the array of actions to execute.`;

  try {
    const aiResult = await generateStructuredResponse({
      prompt: `User request: "${prompt}"`,
      systemInstruction,
      responseJsonSchema: ACTION_SCHEMA,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    });
    return aiResult;
  } catch (error) {
    console.warn(`Gemini Intent Parsing fallback engaged: ${error.message}`);
    return parseIntentHeuristically(prompt);
  }
}

/**
 * Main Intent-Driven Action Executor
 */
export async function executeChatAction({ prompt, eventId, userId, clubId }) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new AppError('Prompt message is required', 400);
  }

  // 1. Gather context from DB
  const taskQuery = (clubId && mongoose.isValidObjectId(clubId)) ? { club: clubId } : {};
  const userQuery = (clubId && mongoose.isValidObjectId(clubId)) ? { club: clubId } : {};

  const [activeEvent, sampleTasks, sampleUsers, recentMeetings] = await Promise.all([
    resolveEvent(eventId, null, clubId),
    Task.find(taskQuery).sort({ updatedAt: -1 }).limit(10).select('title status priority'),
    User.find(userQuery).limit(10).select('name email role'),
    Meeting.find(eventId ? { event: eventId } : {}).sort({ updatedAt: -1 }).limit(3).select('title summary rawTranscript')
  ]);

  const contextInfo = {
    eventName: activeEvent?.name,
    taskTitles: sampleTasks.map((t) => t.title).join(', '),
    userNames: sampleUsers.map((u) => u.name).join(', '),
    recentMeetings: recentMeetings.map(m => `Meeting: ${m.title}\nSummary: ${m.summary || 'None'}\nTranscript Snippet: ${m.rawTranscript?.substring(0, 1000) || 'None'}`).join('\n\n')
  };

  // 2. Parse intent via Gemini
  const parsed = await parseUserIntent(prompt, contextInfo);
  const actionsToExecute = parsed.actions || [parsed];
  const reasoning = parsed.reasoning || "Executed direct command.";
  const overallResponse = parsed.overallResponse || parsed.conversationalResponse || "Action executed successfully.";

  const executedActions = [];
  const affectedRecords = [];
  let mainActionType = 'GENERAL_CHAT';

  // 3. Execute Mongoose Actions
  for (const actionItem of actionsToExecute) {
    const action = actionItem.action;
    mainActionType = action !== 'GENERAL_CHAT' ? action : mainActionType;
    let affectedRecord = null;
    let executedActionSummary = {
      type: action,
      entity: actionItem.targetEntity,
      status: 'executed',
      details: actionItem
    };

    switch (action) {
      case 'ASSIGN_TASK':
      case 'UPDATE_TASK': {
        const details = actionItem.taskDetails || {};
        const searchTerm = details.targetTaskSearch || details.title || prompt;

        let task = null;
        if (activeEvent) {
          task = await Task.findOne({
            event: activeEvent._id,
            title: { $regex: new RegExp(searchTerm.trim(), 'i') }
          });
        }
        if (!task) {
          task = await Task.findOne({
            title: { $regex: new RegExp(searchTerm.trim(), 'i') }
          });
        }

        if (!task) {
          task = await Task.create({
            event: activeEvent._id,
            club: (clubId && mongoose.isValidObjectId(clubId)) ? clubId : null,
            title: details.title || searchTerm.trim(),
            status: details.status || 'todo',
            priority: details.priority || 'medium',
            source: 'ai'
          });
        }

        if (details.assigneeName) {
          const user = await resolveUser(details.assigneeName, clubId);
          if (user) {
            task.owner = user._id;
          }
        }

        if (details.deadline) {
          task.deadline = parseNaturalDate(details.deadline);
        }

        if (details.priority) {
          task.priority = details.priority;
        }

        if (details.status) {
          task.status = details.status;
        }

        if (details.description) {
          task.description = details.description;
        }

        await task.save();
        affectedRecord = await Task.findById(task._id).populate('owner', 'name email role').populate('event', 'name');
        break;
      }

      case 'CREATE_TASK': {
        const details = actionItem.taskDetails || {};
        let ownerId = null;

        if (details.assigneeName) {
          const user = await resolveUser(details.assigneeName, clubId);
          ownerId = user?._id;
        }

        const newTask = await Task.create({
          event: activeEvent._id,
          club: (clubId && mongoose.isValidObjectId(clubId)) ? clubId : null,
          title: details.title || prompt.slice(0, 50),
          description: details.description || '',
          owner: ownerId,
          deadline: parseNaturalDate(details.deadline),
          priority: details.priority || 'medium',
          status: details.status || 'todo',
          source: 'ai'
        });

        affectedRecord = await Task.findById(newTask._id).populate('owner', 'name email role').populate('event', 'name');
        break;
      }

      case 'COMPLETE_TASK': {
        const details = actionItem.taskDetails || {};
        const searchTerm = details.targetTaskSearch || details.title || prompt;

        let task = await Task.findOne({
          $or: [
            { title: { $regex: new RegExp(searchTerm.trim(), 'i') } },
            ...(activeEvent ? [{ event: activeEvent._id }] : [])
          ]
        }).sort({ updatedAt: -1 });

        if (task) {
          task.status = 'completed';
          await task.save();
          affectedRecord = await Task.findById(task._id).populate('owner', 'name email role').populate('event', 'name');
        }
        break;
      }

      case 'DELETE_TASK': {
        const details = actionItem.taskDetails || {};
        const searchTerm = details.targetTaskSearch || details.title;
        if (searchTerm) {
          const taskToDelete = await Task.findOne({
            title: { $regex: new RegExp(searchTerm.trim(), 'i') }
          });
          if (taskToDelete) {
            await Task.findByIdAndDelete(taskToDelete._id);
            affectedRecord = { _id: taskToDelete._id, title: taskToDelete.title, deleted: true };
          }
        }
        break;
      }

      case 'CREATE_EVENT': {
        const details = actionItem.eventDetails || {};
        const defaultUser = (await User.findOne()) || (await resolveUser('Club Lead', clubId));

        const newEvent = await Event.create({
          name: details.name || 'New Event',
          description: details.description || '',
          startDate: details.startDate ? new Date(details.startDate) : new Date(),
          endDate: details.endDate ? new Date(details.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          location: details.location || 'Main Auditorium',
          status: details.status || 'planning',
          club: (clubId && mongoose.isValidObjectId(clubId)) ? clubId : null,
          createdBy: defaultUser._id
        });

        affectedRecord = newEvent;
        break;
      }

      case 'CREATE_RISK': {
        const details = actionItem.riskDetails || {};
        const newRisk = await Risk.create({
          event: activeEvent._id,
          type: details.type || 'deadline',
          severity: details.severity || 'high',
          title: details.title || 'AI Identified Risk',
          description: details.description || prompt,
          sourceType: 'task',
          fingerprint: `ai-risk-${Date.now()}`
        });

        affectedRecord = newRisk;
        break;
      }

      case 'CREATE_MEETING': {
        const details = actionItem.meetingDetails || {};
        const newMeeting = await Meeting.create({
          event: activeEvent._id,
          title: details.title || 'AI Scheduled Meeting',
          date: details.date ? new Date(details.date) : new Date(Date.now() + 24 * 3600 * 1000),
          summary: details.summary || '',
          status: 'scheduled'
        });
        affectedRecord = newMeeting;
        break;
      }

      case 'QUERY_INFO':
      case 'GENERAL_CHAT':
      default: {
        executedActionSummary.status = 'info';
        break;
      }
    }
    
    executedActions.push(executedActionSummary);
    if (affectedRecord) affectedRecords.push(affectedRecord);
  }

  // Combine multiple replies or use the overall response
  const finalReply = `*${reasoning}*\n\n${overallResponse}`;

  return {
    success: true,
    reply: finalReply,
    action: { type: mainActionType, executedActions },
    affectedRecords,
    timestamp: new Date().toISOString()
  };
}

export async function executeAiSearch({ query, eventId }) {
  // RAG-lite: Fetch recent context to answer the question
  const [tasks, risks, users] = await Promise.all([
    Task.find().sort({ updatedAt: -1 }).limit(20).populate('owner', 'name'),
    Risk.find().sort({ updatedAt: -1 }).limit(10),
    User.find().limit(20).select('name role')
  ]);

  const contextData = `
Recent Tasks:
${tasks.map(t => `- ${t.title} (Status: ${t.status}, Assigned to: ${t.owner?.name || 'Unassigned'})`).join('\n')}

Recent Risks:
${risks.map(r => `- ${r.title} (Severity: ${r.severity}, Type: ${r.type})`).join('\n')}

Users:
${users.map(u => `- ${u.name} (${u.role})`).join('\n')}
  `;

  const systemInstruction = `You are the ClubOps AI Search Assistant. 
Answer the user's question directly and concisely based ONLY on the provided context data.
If the answer is not in the data, just say you don't know based on current records.
Do not format as JSON, just return a conversational string.`;

  try {
    const { generateStructuredResponse } = await import('./geminiService.js');
    const result = await generateStructuredResponse({
      prompt: `Question: "${query}"\n\nContext Data:\n${contextData}`,
      systemInstruction,
      responseJsonSchema: { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'] },
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    });
    return { success: true, answer: result.answer };
  } catch (error) {
    console.error('AI Search failed:', error);
    return { success: false, answer: "Sorry, I couldn't process that search query." };
  }
}
