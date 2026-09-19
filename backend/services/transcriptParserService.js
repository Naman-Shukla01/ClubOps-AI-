import { GeminiServiceError, generateStructuredResponse } from './geminiService.js';

const nullableStringSchema = {
  anyOf: [{ type: 'string' }, { type: 'null' }]
};

const transcriptResponseSchema = {
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
    decisions: { type: 'array', items: { type: 'string' } },
    actionItems: { type: 'array', items: { type: 'string' } },
    importantDates: { type: 'array', items: { type: 'string' } }
  },
  required: ['summary', 'tasks', 'decisions', 'actionItems', 'importantDates']
};

function normalizeDeadline(deadline) {
  if (!deadline) {
    return null;
  }

  const parsedDeadline = new Date(deadline);
  return Number.isNaN(parsedDeadline.getTime()) ? null : parsedDeadline.toISOString();
}

function normalizeTranscriptResult(result) {
  if (
    !result
    || typeof result !== 'object'
    || typeof result.summary !== 'string'
    || !Array.isArray(result.tasks)
    || !Array.isArray(result.decisions)
    || !Array.isArray(result.actionItems)
    || !Array.isArray(result.importantDates)
  ) {
    throw new Error('AI service returned an invalid transcript structure');
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
    decisions: Array.isArray(result.decisions) ? result.decisions.filter((item) => typeof item === 'string') : [],
    actionItems: Array.isArray(result.actionItems) ? result.actionItems.filter((item) => typeof item === 'string') : [],
    importantDates: Array.isArray(result.importantDates)
      ? result.importantDates.filter((item) => typeof item === 'string')
      : []
  };
}

export async function parseMeetingTranscript(text, meetingDate) {
  const dateContext = meetingDate
    ? `The meeting date is ${new Date(meetingDate).toISOString()}. Resolve relative dates only when this context makes them unambiguous.`
    : 'No meeting date is available. Return null for relative or otherwise ambiguous deadlines.';

  const result = await generateStructuredResponse({
    systemInstruction: [
      'You extract structured meeting information from messy conversational notes.',
      'Return only JSON matching the supplied schema. Never return prose, markdown, or extra keys.',
      'Extract a task only when an actual commitment or action is stated.',
      'Do not invent people, dates, decisions, or details. Use null for unknown owner or deadline.',
      'Convert relative dates such as Friday only when the meeting date context makes the date confident.',
      dateContext
    ].join(' '),
    prompt: text,
    responseJsonSchema: transcriptResponseSchema
  });

  try {
    return normalizeTranscriptResult(result);
  } catch {
    throw new GeminiServiceError('AI service returned an invalid transcript structure');
  }
}
