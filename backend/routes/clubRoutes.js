import express from 'express';
import { getClubs, createClub, getClubById, joinClub, leaveClub } from '../controllers/clubController.js';

const router = express.Router();

router.get('/', getClubs);
router.post('/', createClub);
router.get('/:id', getClubById);
router.post('/:id/join', joinClub);
router.post('/:id/leave', leaveClub);

// Events tied to a club can just reuse the existing event routes or be added here later if needed.
// For now, we mock the /:id/events and /:id/members routes to return empty arrays 
// to satisfy the frontend until full relational data is needed.
router.get('/:id/events', (req, res) => res.json({ success: true, data: [] }));
router.get('/:id/members', (req, res) => res.json({ success: true, data: [] }));

export default router;
