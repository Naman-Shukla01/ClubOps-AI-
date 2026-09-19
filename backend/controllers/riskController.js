import { AppError } from '../middleware/errorMiddleware.js';
import { scanEventRisks } from '../services/riskRadarService.js';

const VALID_SOURCE_TYPES = ['task', 'document', 'meeting'];

export async function processRiskScan(req, res, next) {
  try {
    const { eventId, sourceType, sourceId } = req.body || {};

    if (!eventId) {
      throw new AppError('eventId is required', 400);
    }

    if (sourceType && !VALID_SOURCE_TYPES.includes(sourceType)) {
      throw new AppError('sourceType must be task, document, or meeting', 400);
    }

    if (sourceType && !sourceId) {
      throw new AppError('sourceId is required when sourceType is provided', 400);
    }

    const risks = await scanEventRisks({ eventId, sourceType, sourceId });

    res.status(200).json({
      success: true,
      eventId,
      risks
    });
  } catch (error) {
    next(error);
  }
}
