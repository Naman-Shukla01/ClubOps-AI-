import express from 'express';
import { createAnnouncement } from '../controllers/announcementController.js';
import { processRiskScan } from '../controllers/riskController.js';
import { handleAiChat } from '../controllers/actionController.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * AI Conversational Action Executor
 * POST /api/ai/chat - Execute actions via plain English
 * GET  /api/ai/chat - Usage helper & documentation
 */
router.post('/chat', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), handleAiChat);
router.get('/chat', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AI Conversational Action Executor endpoint is active. Use HTTP POST with a JSON body to send commands.',
    method: 'POST',
    url: '/api/ai/chat',
    samplePayload: {
      prompt: 'Assign Sarah to stage setup and move deadline to tomorrow',
      eventId: 'optional_event_id'
    },
    supportedActions: [
      'Assign tasks (e.g. "Assign Alex to catering and set deadline to Friday")',
      'Create tasks (e.g. "Create a task for Audio check with high priority")',
      'Complete tasks (e.g. "Mark stage setup as completed")',
      'Create events (e.g. "Create a new event Hackathon 2026 starting tomorrow")',
      'Create risks (e.g. "Log a high severity risk: Sponsor payment delayed")'
    ]
  });
});

router.post('/risk-scan', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), processRiskScan);
router.post('/announcement', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), createAnnouncement);

export default router;
