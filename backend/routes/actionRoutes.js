import express from 'express';
import { handleAiChat } from '../controllers/actionController.js';
import { getHealthAnalytics } from '../controllers/analyticsController.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * Task 1: Intent-Driven Action Executor
 * POST /api/actions/chat or /api/ai/chat
 * GET  /api/actions/chat - Usage helper
 */
router.post('/chat', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), handleAiChat);
router.post('/execute', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), handleAiChat);
router.get('/chat', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Action Executor endpoint is active. Use HTTP POST to send commands.',
    samplePayload: {
      prompt: 'Assign Sarah to stage setup and move deadline to tomorrow'
    }
  });
});

/**
 * Task 2: Event Health & Analytics Aggregator
 * GET /api/actions/analytics/health or /api/analytics/health
 */
router.get('/health', getHealthAnalytics);
router.get('/analytics', getHealthAnalytics);

export default router;
