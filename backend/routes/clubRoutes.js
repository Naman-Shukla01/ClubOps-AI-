import express from 'express';
import { 
  getClubs, 
  createClub, 
  getClubById, 
  joinClub, 
  leaveClub,
  getClubEvents,
  createClubEvent,
  getClubMembers
} from '../controllers/clubController.js';

const router = express.Router();

router.get('/', getClubs);
router.post('/', createClub);
router.get('/:id', getClubById);
router.post('/:id/join', joinClub);
router.post('/:id/leave', leaveClub);

router.get('/:id/events', getClubEvents);
router.post('/:id/events', createClubEvent);
router.get('/:id/members', getClubMembers);

export default router;
