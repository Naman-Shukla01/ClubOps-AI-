import express from 'express';
import { createAnnouncement } from '../controllers/announcementController.js';
import { processRiskScan } from '../controllers/riskController.js';
import { handleAiChat } from '../controllers/actionController.js';

const router = express.Router();

/**
 * AI Conversational Action Executor
 * POST /api/ai/chat - Execute actions via plain English (any authenticated user)
 */
router.post('/chat', handleAiChat);
router.get('/chat', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Chat endpoint is active. POST with { prompt, eventId } to interact.',
    samplePayload: { prompt: 'Create a task for Audio check with high priority', eventId: 'optional' },
  });
});

router.post('/risk-scan', processRiskScan);
router.post('/announcement', createAnnouncement);

// AI Search
import { handleAiSearch } from '../controllers/actionController.js';
router.get('/search', handleAiSearch);

export default router;
