import { getEventHealthAnalytics } from '../services/analyticsService.js';

/**
 * Get overall event completion percentages, active risk counts, and volunteer workloads
 * GET /api/analytics/health or GET /api/analytics/summary
 */
export async function getHealthAnalytics(req, res, next) {
  try {
    const eventId = req.query.eventId || req.params.eventId || null;
    const analytics = await getEventHealthAnalytics(eventId);

    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
}
