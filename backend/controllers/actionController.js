import { executeChatAction } from '../services/actionExecutorService.js';
import { AppError } from '../middleware/errorMiddleware.js';

const MUTATING_KEYWORDS = ['create', 'add', 'assign', 'mark', 'complete', 'delete', 'remove', 'update', 'set', 'change', 'log risk', 'make'];

function looksLikeMutation(text) {
  const lower = text.toLowerCase();
  return MUTATING_KEYWORDS.some(k => lower.includes(k));
}

/**
 * Handle AI conversational chat commands that trigger database updates
 * POST /api/ai/chat or POST /api/actions/chat
 */
export async function handleAiChat(req, res, next) {
  try {
    const { prompt, message, command, eventId } = req.body || {};
    const textPrompt = prompt || message || command;

    if (!textPrompt || typeof textPrompt !== 'string' || !textPrompt.trim()) {
      throw new AppError('Message prompt is required in request body (e.g. { "prompt": "Assign Sarah to stage setup" })', 400);
    }

    const isVolunteer = req.user?.role === 'VOLUNTEER';

    // Volunteers cannot trigger mutating AI actions
    if (isVolunteer && looksLikeMutation(textPrompt)) {
      throw new AppError('Only club leads and event managers can create tasks, assign people, or make changes', 403);
    }

    const result = await executeChatAction({
      prompt: textPrompt.trim(),
      eventId,
      userId: req.user.id
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleAiSearch(req, res, next) {
  try {
    const { q, eventId } = req.query;
    if (!q || typeof q !== 'string' || !q.trim()) {
      throw new AppError('Search query (q) is required', 400);
    }

    const { executeAiSearch } = await import('../services/actionExecutorService.js');
    const result = await executeAiSearch({ query: q.trim(), eventId });
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

