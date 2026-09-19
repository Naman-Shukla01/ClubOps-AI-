import express from 'express';
import { processMeetingTranscript } from '../controllers/meetingController.js';
import { featureNotImplemented } from '../controllers/placeholderController.js';

const router = express.Router();

router.get('/', featureNotImplemented('Meeting management'));
router.post('/process', processMeetingTranscript);

export default router;
