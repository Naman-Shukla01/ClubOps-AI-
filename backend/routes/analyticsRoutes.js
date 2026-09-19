import express from 'express';
import { getHealthAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

/**
 * Task 2: Event Health & Analytics Aggregator
 * GET /api/analytics/health
 * GET /api/analytics/summary
 */
router.get('/health', getHealthAnalytics);
router.get('/summary', getHealthAnalytics);
router.get('/event/:eventId', getHealthAnalytics);

export default router;
