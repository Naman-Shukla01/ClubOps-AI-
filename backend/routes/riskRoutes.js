import express from 'express';
import mongoose from 'mongoose';
import Risk from '../models/Risk.js';

const router = express.Router();

function normalizeRisk(risk) {
  const riskDoc = risk?.toObject ? risk.toObject() : risk;
  return {
    id: riskDoc._id?.toString?.() || riskDoc.id,
    event: riskDoc.event || null,
    club: riskDoc.club || null,
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
    const { clubId, eventId } = req.query;
    const filter = { status: { $in: ['open', 'acknowledged'] } };

    if (clubId && mongoose.isValidObjectId(String(clubId))) {
      filter.club = clubId;
    }

    if (eventId && mongoose.isValidObjectId(String(eventId))) {
      filter.event = eventId;
    }

    const risks = await Risk.find(filter).sort({ detectedAt: -1 });
    res.status(200).json({
      success: true,
      data: risks.map(normalizeRisk),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
