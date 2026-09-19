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
async function resolveUser(nameOrEmail) {
  if (!nameOrEmail || typeof nameOrEmail !== 'string') return null;
  const cleanName = nameOrEmail.trim();
  if (!cleanName) return null;

  let user = await User.findOne({
    $or: [
      { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
      { email: { $regex: new RegExp(`^${cleanName}$`, 'i') } },
      { name: { $regex: new RegExp(cleanName, 'i') } }
    ]
  });

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
      role: 'volunteer'
    });
  }

  return user;
}

/**
 * Resolve or get default Event
 */
async function resolveEvent(eventId, eventName) {
  if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
    const event = await Event.findById(eventId);
    if (event) return event;
  }

  if (eventName) {
    const event = await Event.findOne({
      name: { $regex: new RegExp(eventName, 'i') }
    });
    if (event) return event;
  }

  // Fallback to the latest active/planning event
  let defaultEvent = await Event.findOne({
    status: { $in: ['planning', 'upcoming', 'ongoing'] }
  }).sort({ createdAt: -1 });

  if (!defaultEvent) {
    defaultEvent = await Event.findOne().sort({ createdAt: -1 });
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
    action: 'GENERAL_CHAT',
    targetEntity: 'None',
    conversationalResponse: `I received your command: "${text}". I can help assign tasks, update deadlines, track risks, and generate analytics.`
  };
}

const ACTION_SCHEMA = {
  type: 'object',
  properties: {
    action: {
      type: 'string',
      enum: [
        'CREATE_TASK',
        'UPDATE_TASK',
        'ASSIGN_TASK',
        'COMPLETE_TASK',
        'DELETE_TASK',
        'CREATE_EVENT',
        'UPDATE_EVENT',
        'CREATE_MEETING',
        'CREATE_RISK',
        'QUERY_INFO',
        'GENERAL_CHAT'
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
      description: 'A friendly, professional confirmation message explaining the database action performed.'
    }
  },
  required: ['action', 'targetEntity', 'conversationalResponse']
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

Rules:
1. When a user says "Assign [Name] to [Task] and move deadline to [Date]", map action to "ASSIGN_TASK", set assigneeName, targetTaskSearch, and deadline.
2. When creating a task, extract title, priority (default medium), deadline, status (default todo).
3. If deadline is mentioned as relative ("tomorrow", "in 2 days", "next Monday"), calculate appropriate ISO date.
4. Output must strictly conform to the JSON schema.`;

  try {
    const aiResult = await generateStructuredResponse({
      prompt: `User request: "${prompt}"`,
      systemInstruction,
      responseJsonSchema: ACTION_SCHEMA,
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash'
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
export async function executeChatAction({ prompt, eventId, userId }) {
  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new AppError('Prompt message is required', 400);
  }

  // 1. Gather context from DB
  const [activeEvent, sampleTasks, sampleUsers] = await Promise.all([
    resolveEvent(eventId),
    Task.find().sort({ updatedAt: -1 }).limit(10).select('title status priority'),
    User.find().limit(10).select('name email role')
  ]);

  const contextInfo = {
    eventName: activeEvent?.name,
    taskTitles: sampleTasks.map((t) => t.title).join(', '),
    userNames: sampleUsers.map((u) => u.name).join(', ')
  };

  // 2. Parse intent via Gemini
  const parsed = await parseUserIntent(prompt, contextInfo);
  const action = parsed.action;
  let affectedRecord = null;
  let executedActionSummary = {
    type: action,
    entity: parsed.targetEntity,
    status: 'executed',
    details: parsed
  };

  // 3. Execute Mongoose Actions
  switch (action) {
    case 'ASSIGN_TASK':
    case 'UPDATE_TASK': {
      const details = parsed.taskDetails || {};
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

      // If task doesn't exist, create it on the fly!
      if (!task) {
        task = await Task.create({
          event: activeEvent._id,
          title: details.title || searchTerm.trim(),
          status: details.status || 'todo',
          priority: details.priority || 'medium',
          source: 'ai'
        });
      }

      if (details.assigneeName) {
        const user = await resolveUser(details.assigneeName);
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
      const details = parsed.taskDetails || {};
      let ownerId = null;

      if (details.assigneeName) {
        const user = await resolveUser(details.assigneeName);
        ownerId = user?._id;
      }

      const newTask = await Task.create({
        event: activeEvent._id,
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
      const details = parsed.taskDetails || {};
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
      const details = parsed.taskDetails || {};
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
      const details = parsed.eventDetails || {};
      const defaultUser = (await User.findOne()) || (await resolveUser('Club Lead'));

      const newEvent = await Event.create({
        name: details.name || 'New Event',
        description: details.description || '',
        startDate: details.startDate ? new Date(details.startDate) : new Date(),
        endDate: details.endDate ? new Date(details.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        location: details.location || 'Main Auditorium',
        status: details.status || 'planning',
        createdBy: defaultUser._id
      });

      affectedRecord = newEvent;
      break;
    }

    case 'CREATE_RISK': {
      const details = parsed.riskDetails || {};
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

    case 'QUERY_INFO':
    case 'GENERAL_CHAT':
    default: {
      executedActionSummary.status = 'info';
      break;
    }
  }

  return {
    success: true,
    reply: parsed.conversationalResponse || 'Action executed successfully.',
    action: executedActionSummary,
    affectedRecord,
    timestamp: new Date().toISOString()
  };
}
