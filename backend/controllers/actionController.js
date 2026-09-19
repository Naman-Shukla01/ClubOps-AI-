import { executeChatAction } from '../services/actionExecutorService.js';
import { AppError } from '../middleware/errorMiddleware.js';

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
