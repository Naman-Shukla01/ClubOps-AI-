import express from 'express';
import { createAnnouncement } from '../controllers/announcementController.js';
import { processRiskScan } from '../controllers/riskController.js';
import { featureNotImplemented } from '../controllers/placeholderController.js';

const router = express.Router();

router.post('/risk-scan', processRiskScan);
router.post('/announcement', createAnnouncement);

export default router;
