import express from 'express';
import mongoose from 'mongoose';
import Meeting from '../models/Meeting.js';
import Event from '../models/Event.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { processMeetingTranscript } from '../controllers/meetingController.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

function normalizeMeeting(meeting) {
  const meetingDoc = meeting?.toObject ? meeting.toObject() : meeting;
  return {
    id: meetingDoc._id?.toString?.() || meetingDoc.id,
    title: meetingDoc.title || 'Untitled Meeting',
    date: meetingDoc.date ? new Date(meetingDoc.date).toISOString() : null,
    duration: 60,
    participants: Array.isArray(meetingDoc.participants) ? meetingDoc.participants : [],
    summary: meetingDoc.summary || '',
    decisions: Array.isArray(meetingDoc.decisions) ? meetingDoc.decisions : [],
    actionItems: Array.isArray(meetingDoc.actionItems) ? meetingDoc.actionItems : [],
    importantDates: Array.isArray(meetingDoc.importantDates) ? meetingDoc.importantDates : [],
    rawTranscript: meetingDoc.rawTranscript || '',
  };
}

router.get('/', async (req, res, next) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({
      success: true,
      data: meetings.map(normalizeMeeting),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { event, title, date } = req.body || {};

    if (!event || !mongoose.isValidObjectId(String(event))) {
      throw new AppError('event is required and must be a valid ObjectId', 400);
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }

    if (!date || Number.isNaN(new Date(date).getTime())) {
      throw new AppError('date is required and must be valid', 400);
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      throw new AppError('Event not found', 404);
    }

    const meeting = await Meeting.create({
      event: eventDoc._id,
      title: title.trim(),
      date: new Date(date),
    });

    res.status(201).json({ success: true, data: normalizeMeeting(meeting) });
  } catch (error) {
    next(error);
  }
});

router.post('/process', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), processMeetingTranscript);

export default router;
