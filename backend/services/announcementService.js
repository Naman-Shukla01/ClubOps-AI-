import { GeminiServiceError, generateStructuredResponse } from './geminiService.js';

const ANNOUNCEMENT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    announcement: {
      type: 'object',
      additionalProperties: false,
      properties: {
        title: { type: 'string' },
        message: { type: 'string' },
        channel: { type: 'string', enum: ['whatsapp', 'telegram'] }
      },
      required: ['title', 'message', 'channel']
    }
  },
  required: ['announcement']
};

export async function generateAnnouncement({ eventName, type, title, details, channel }) {
  const result = await generateStructuredResponse({
    systemInstruction: [
      'You write concise announcement drafts for college club events.',
      'Return only JSON matching the supplied schema. Never return markdown fences, commentary, or extra keys.',
      'Use only facts explicitly present in the event name, title, and details.',
      'Never invent dates, times, locations, people, sponsors, achievements, numbers, or required actions.',
      'For schedule changes, clearly state the change, previous information when supplied, new information, and any action required when supplied.',
      'Use limited emoji only when appropriate for WhatsApp. Telegram may use slightly richer formatting, but remain professional and concise.',
      `The requested channel is ${channel}.`
    ].join(' '),
    prompt: JSON.stringify({ eventName, type, title, details }),
    responseJsonSchema: ANNOUNCEMENT_SCHEMA
  });

  const announcement = result?.announcement;
  if (
    !announcement
    || typeof announcement.title !== 'string'
    || typeof announcement.message !== 'string'
    || !['whatsapp', 'telegram'].includes(announcement.channel)
    || announcement.channel !== channel
    || !announcement.title.trim()
    || !announcement.message.trim()
  ) {
    throw new GeminiServiceError('AI service returned an invalid announcement structure');
  }

  return {
    title: announcement.title.trim(),
    message: announcement.message.trim(),
    channel: announcement.channel
  };
}
