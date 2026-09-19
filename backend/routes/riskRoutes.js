import express from 'express';
import Risk from '../models/Risk.js';

const router = express.Router();

function normalizeRisk(risk) {
  const riskDoc = risk?.toObject ? risk.toObject() : risk;
  return {
    id: riskDoc._id?.toString?.() || riskDoc.id,
    event: riskDoc.event || null,
    type: riskDoc.type,
    severity: riskDoc.severity,
    title: riskDoc.title,
    description: riskDoc.description || '',
    sourceType: riskDoc.sourceType,
    sourceId: riskDoc.sourceId || null,
    status: riskDoc.status || 'open',
    metadata: riskDoc.metadata || {},
    detectedAt: riskDoc.detectedAt || riskDoc.createdAt || null,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const risks = await Risk.find({ status: { $in: ['open', 'acknowledged'] } }).sort({ detectedAt: -1 });
    res.status(200).json({
      success: true,
      data: risks.map(normalizeRisk),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
