import { GeminiServiceError, generateStructuredResponse } from './geminiService.js';

const nullableStringSchema = {
  anyOf: [{ type: 'string' }, { type: 'null' }]
};

const documentResponseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    summary: { type: 'string' },
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          owner: nullableStringSchema,
          deadline: nullableStringSchema,
          priority: { type: 'string', enum: ['low', 'medium', 'high'] }
        },
        required: ['title', 'description', 'owner', 'deadline', 'priority']
      }
    },
    actionItems: { type: 'array', items: { type: 'string' } },
    importantDates: { type: 'array', items: { type: 'string' } },
    entities: { type: 'array', items: { type: 'string' }, description: 'Important people, places, or organizations mentioned.' },
    sentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'], description: 'Overall tone of the document.' },
    risks: { 
      type: 'array', 
      items: { 
        type: 'object',
        properties: {
          title: { type: 'string' },
          severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          description: { type: 'string' }
        },
        required: ['title', 'severity', 'description']
      }
    }
  },
  required: ['summary', 'tasks', 'actionItems', 'importantDates', 'entities', 'sentiment', 'risks']
};

function normalizeDeadline(deadline) {
  if (!deadline) {
    return null;
  }

  const parsedDeadline = new Date(deadline);
  return Number.isNaN(parsedDeadline.getTime()) ? null : parsedDeadline.toISOString();
}

function normalizeDocumentResult(result) {
  if (
    !result
    || typeof result !== 'object'
    || typeof result.summary !== 'string'
    || !Array.isArray(result.tasks)
    || !Array.isArray(result.actionItems)
    || !Array.isArray(result.importantDates)
  ) {
    throw new Error('AI service returned an invalid document structure');
  }

  return {
    summary: typeof result.summary === 'string' ? result.summary.trim() : '',
    tasks: result.tasks
      .filter((task) => (
        task
        && typeof task.title === 'string'
        && task.title.trim()
        && typeof task.description === 'string'
        && (task.owner === null || typeof task.owner === 'string')
        && (task.deadline === null || typeof task.deadline === 'string')
        && ['low', 'medium', 'high'].includes(task.priority)
      ))
      .map((task) => ({
        title: task.title.trim(),
        description: typeof task.description === 'string' ? task.description.trim() : '',
        owner: typeof task.owner === 'string' && task.owner.trim() ? task.owner.trim() : null,
        deadline: normalizeDeadline(task.deadline),
        priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium'
      })),
    actionItems: Array.isArray(result.actionItems) ? result.actionItems.filter((item) => typeof item === 'string') : [],
    importantDates: Array.isArray(result.importantDates)
      ? result.importantDates.filter((item) => typeof item === 'string')
      : [],
    entities: Array.isArray(result.entities) ? result.entities.filter((item) => typeof item === 'string') : [],
    sentiment: ['positive', 'neutral', 'negative'].includes(result.sentiment) ? result.sentiment : 'neutral',
    risks: Array.isArray(result.risks) ? result.risks.map(r => ({
      title: r.title || 'Identified Risk',
      severity: ['low', 'medium', 'high', 'critical'].includes(r.severity) ? r.severity : 'medium',
      description: r.description || ''
    })) : []
  };
}

export async function parseDocumentText(text) {
  const result = await generateStructuredResponse({
    systemInstruction: [
      'You extract structured information from club documents, guidelines, or event requirements.',
      'Return only JSON matching the supplied schema. Never return prose, markdown, or extra keys.',
      'Extract a task only when an actual commitment, requirement, or action is stated.',
      'Do not invent people, dates, or details. Use null for unknown owner or deadline.'
    ].join(' '),
    prompt: text,
    responseJsonSchema: documentResponseSchema
  });

  try {
    return normalizeDocumentResult(result);
  } catch {
    throw new GeminiServiceError('AI service returned an invalid document structure');
  }
}
