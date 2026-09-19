import express from 'express';
import { featureNotImplemented } from '../controllers/placeholderController.js';

const router = express.Router();

router.get('/', featureNotImplemented('Event management'));

export default router;
