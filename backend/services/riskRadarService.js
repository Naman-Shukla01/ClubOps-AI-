import mongoose from 'mongoose';
import Document from '../models/Document.js';
import Event from '../models/Event.js';
import Risk from '../models/Risk.js';
import Task from '../models/Task.js';
import { generateStructuredResponse } from './geminiService.js';

const VALID_RISK_TYPES = ['deadline', 'resource', 'volunteer', 'dependency', 'communication', 'logistics', 'other'];
const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'];
const semanticRiskSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    risks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: { type: 'string', enum: VALID_RISK_TYPES },
          severity: { type: 'string', enum: VALID_SEVERITIES },
          title: { type: 'string' },
          description: { type: 'string' },
          evidence: { type: 'string' }
        },
        required: ['type', 'severity', 'title', 'description', 'evidence']
      }
    }
  },
  required: ['risks']
};

function addRisk(risks, risk) {
  risks.push({ ...risk, fingerprint: risk.fingerprint || `${risk.type}:${risk.sourceType}:${risk.sourceId}:${risk.title}` });
}

function isIncomplete(task) {
  return task.status !== 'completed';
}

function isImportant(task) {
  return ['high', 'critical'].includes(task.priority);
}

function daysUntil(date, now) {
  return (new Date(date).getTime() - now.getTime()) / 86400000;
}

function requirementMatchesDocument(requirement, document) {
  const searchableValues = [
    document.title,
    document.type,
    document.description,
    document.referenceMetadata?.name,
    document.referenceMetadata?.category,
    document.referenceMetadata?.permit
  ].filter(Boolean).map((value) => String(value).toLowerCase());

  return searchableValues.some((value) => value.includes(String(requirement).toLowerCase()));
}

export function evaluateDeterministicRisks({ event, tasks, documents, now = new Date() }) {
  const risks = [];
  const eventStart = new Date(event.startDate);
  const requirements = event.requirements || {};

  for (const task of tasks) {
    const source = { sourceType: 'task', sourceId: task._id };
    const taskDeadline = task.deadline ? new Date(task.deadline) : null;

    if (isImportant(task) && !task.owner) {
      addRisk(risks, {
        ...source,
        type: 'volunteer',
        severity: task.priority === 'critical' ? 'critical' : 'high',
        title: `Important task has no owner: ${task.title}`,
        description: `The ${task.priority}-priority task has no assigned owner.`,
        metadata: { taskId: task._id, rule: 'missing-owner' }
      });
    }

    if (taskDeadline && isIncomplete(task) && taskDeadline < now) {
      addRisk(risks, {
        ...source,
        type: 'deadline',
        severity: isImportant(task) ? 'high' : 'medium',
        title: `Overdue task: ${task.title}`,
        description: `The task deadline was ${taskDeadline.toISOString()} and the task is still incomplete.`,
        metadata: { taskId: task._id, deadline: taskDeadline.toISOString(), rule: 'overdue-task' }
      });
    }

    if (taskDeadline && taskDeadline > eventStart) {
      addRisk(risks, {
        ...source,
        type: 'deadline',
        severity: 'high',
        title: `Task deadline is after event start: ${task.title}`,
        description: `The task is due ${taskDeadline.toISOString()}, after the event starts ${eventStart.toISOString()}.`,
        metadata: { taskId: task._id, eventStart: eventStart.toISOString(), rule: 'event-deadline-conflict' }
      });
    }

    for (const dependency of task.dependencies || []) {
      if (!dependency || !dependency._id) {
        addRisk(risks, {
          ...source,
          type: 'dependency',
          severity: 'high',
          title: `Dependency is missing for: ${task.title}`,
          description: 'The task references a dependency that could not be loaded.',
          metadata: { taskId: task._id, rule: 'missing-dependency' }
        });
        continue;
      }

      if (isIncomplete(dependency) && taskDeadline && daysUntil(taskDeadline, now) <= 7) {
        addRisk(risks, {
          ...source,
          type: 'dependency',
          severity: 'high',
          title: `Incomplete dependency for: ${task.title}`,
          description: `Dependency "${dependency.title}" is ${dependency.status} while this task is due within seven days.`,
          metadata: { taskId: task._id, dependencyId: dependency._id, rule: 'dependency-gap' }
        });
      }

      if (dependency.deadline && taskDeadline && new Date(dependency.deadline) >= taskDeadline && isIncomplete(dependency)) {
        addRisk(risks, {
          ...source,
          type: 'deadline',
          severity: 'high',
          title: `Dependency deadline conflicts with: ${task.title}`,
          description: `Dependency "${dependency.title}" is not scheduled to finish before this task deadline.`,
          metadata: { taskId: task._id, dependencyId: dependency._id, rule: 'dependency-deadline-conflict' }
        });
      }
    }
  }

  for (const requirement of Array.isArray(requirements.documents) ? requirements.documents : []) {
    if (!documents.some((document) => requirementMatchesDocument(requirement, document))) {
      addRisk(risks, {
        sourceType: 'event',
        sourceId: event._id,
        type: 'logistics',
        severity: 'high',
        title: `Missing required document: ${requirement}`,
        description: `The event configuration requires a document matching "${requirement}", but none was found.`,
        metadata: { requirement, rule: 'missing-document' }
      });
    }
  }

  for (const requirement of Array.isArray(requirements.permits) ? requirements.permits : []) {
    if (!documents.some((document) => requirementMatchesDocument(requirement, document))) {
      addRisk(risks, {
        sourceType: 'event',
        sourceId: event._id,
        type: 'logistics',
        severity: 'high',
        title: `Missing required permit: ${requirement}`,
        description: `The event configuration requires a permit matching "${requirement}", but none was found.`,
        metadata: { requirement, rule: 'missing-permit' }
      });
    }
  }

  return risks;
}

function validateSemanticRisks(result) {
  if (!result || !Array.isArray(result.risks)) {
    return [];
  }

  return result.risks.filter((risk) => (
    risk && VALID_RISK_TYPES.includes(risk.type) && VALID_SEVERITIES.includes(risk.severity)
      && typeof risk.title === 'string' && risk.title.trim()
      && typeof risk.description === 'string' && risk.description.trim()
      && typeof risk.evidence === 'string'
  ));
}

async function analyzeDocumentSemantics(document, tasks = []) {
  if (!document || !process.env.GEMINI_API_KEY || !document.content?.trim()) {
    return [];
  }

  const contextTasks = tasks.map(t => `- ${t.title} (${t.status})`).join('\n');

  try {
    const result = await generateStructuredResponse({
      systemInstruction: `Identify only plausible operational risks supported by the document. 
Return only the supplied JSON schema. Do not invent requirements or facts.
CRITICAL: You are provided with a list of currently planned tasks. Cross-reference the document requirements against these tasks.
If the document mandates something (e.g., a permit, catering, security) but there is NO corresponding task for it, flag it as a 'Strategic Gap' risk.
Current Tasks:
${contextTasks || 'No tasks currently exist.'}`,
      prompt: JSON.stringify({ title: document.title, type: document.type, description: document.description, content: document.content }),
      responseJsonSchema: semanticRiskSchema
    });
    return validateSemanticRisks(result).map((risk) => ({
      sourceType: 'document',
      sourceId: document._id,
      type: risk.type,
      severity: risk.severity,
      title: risk.title.trim(),
      description: risk.description.trim(),
      metadata: { evidence: risk.evidence, rule: 'gemini-semantic-analysis' }
    }));
  } catch (error) {
    console.error(`Risk semantic analysis skipped: ${error.message}`);
    return [];
  }
}

async function saveRisks(risks, eventId) {
  const savedRisks = [];

  for (const risk of risks) {
    const identity = {
      event: eventId,
      sourceType: risk.sourceType,
      sourceId: risk.sourceId,
      type: risk.type,
      fingerprint: risk.fingerprint,
      status: { $in: ['open', 'acknowledged'] }
    };
    const existingRisk = await Risk.findOne(identity);

    if (existingRisk) {
      savedRisks.push(existingRisk);
      continue;
    }

    try {
      savedRisks.push(await Risk.create({ event: eventId, ...risk }));
    } catch (error) {
      if (error?.code !== 11000) {
        throw error;
      }

      const concurrentRisk = await Risk.findOne(identity);
      if (!concurrentRisk) {
        throw error;
      }

      savedRisks.push(concurrentRisk);
    }
  }

  return savedRisks;
}

export async function scanEventRisks({ eventId, sourceType, sourceId }) {
  if (!mongoose.isValidObjectId(eventId)) {
    const error = new Error('eventId must be a valid MongoDB ObjectId');
    error.statusCode = 400;
    throw error;
  }

  if (sourceId && !mongoose.isValidObjectId(sourceId)) {
    const error = new Error('sourceId must be a valid MongoDB ObjectId');
    error.statusCode = 400;
    throw error;
  }

  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const [tasks, documents] = await Promise.all([
    Task.find({ event: eventId }).populate('dependencies', 'title deadline status'),
    Document.find({ event: eventId })
  ]);
  const deterministicRisks = evaluateDeterministicRisks({ event, tasks, documents });
  
  let semanticRisks = [];
  if (sourceType === 'document' && sourceId) {
    const doc = documents.find((document) => String(document._id) === String(sourceId));
    if (doc) semanticRisks = await analyzeDocumentSemantics(doc, tasks);
  } else {
    // Scan all documents if no specific sourceId is provided
    const allSemanticRisks = await Promise.all(documents.map(doc => analyzeDocumentSemantics(doc, tasks)));
    semanticRisks = allSemanticRisks.flat();
  }

  const detectedRisks = await saveRisks([...deterministicRisks, ...semanticRisks], eventId);

  return detectedRisks;
}
