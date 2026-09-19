import express from 'express';
import { featureNotImplemented } from '../controllers/placeholderController.js';

const router = express.Router();

router.get('/', featureNotImplemented('Document management'));

export default router;
