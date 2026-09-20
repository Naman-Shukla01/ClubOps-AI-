import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { requireClubLead } from '../middleware/clubPermissionMiddleware.js';

const router = express.Router();


function normalizeEvent(event) {
  const eventDoc = event?.toObject ? event.toObject() : event;
  return {
    id: eventDoc._id?.toString?.() || eventDoc.id,
    name: eventDoc.name || 'Untitled Event',
    description: eventDoc.description || '',
    startDate: eventDoc.startDate ? new Date(eventDoc.startDate).toISOString() : null,
    endDate: eventDoc.endDate ? new Date(eventDoc.endDate).toISOString() : null,
    deadline: eventDoc.deadline ? new Date(eventDoc.deadline).toISOString() : null,
    location: eventDoc.location || '',
    status: eventDoc.status || 'planning',
    requirements: eventDoc.requirements || { documents: [], permits: [] },
    club: eventDoc.club || null,
    volunteers: eventDoc.volunteers || [],
    createdBy: eventDoc.createdBy || null,
    createdAt: eventDoc.createdAt,
    updatedAt: eventDoc.updatedAt,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { clubId } = req.query;
    const query = (clubId && mongoose.isValidObjectId(clubId)) ? { club: clubId } : {};
    const events = await Event.find(query)
      .populate('volunteers', 'name email')
      .sort({ startDate: 1 });
    res.status(200).json({
      success: true,
      data: events.map(normalizeEvent),
    });
  } catch (error) {
    next(error);
  }
});

// Only the club lead (head) can create events
router.post('/', requireClubLead, async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, deadline, location, status, clubId } = req.body || {};

    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new AppError('name is required', 400);
    }

    if (!startDate || !endDate) {
      throw new AppError('startDate and endDate are required', 400);
    }

    const event = await Event.create({
      name: name.trim(),
      description: description || '',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      deadline: deadline ? new Date(deadline) : null,
      location: location || '',
      status: status || 'planning',
      club: (clubId && mongoose.isValidObjectId(clubId)) ? clubId : null,
      createdBy: req.user.id,
    });

    const populated = await Event.findById(event._id).populate('volunteers', 'name email');
    res.status(201).json({ success: true, data: normalizeEvent(populated) });
  } catch (error) {
    next(error);
  }
});

// Only the club lead can edit events
router.patch('/:id', requireClubLead, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('event id is invalid', 400);
    const allowed = ['name', 'description', 'startDate', 'endDate', 'deadline', 'location', 'status', 'requirements'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (updates.name !== undefined && (!String(updates.name).trim())) throw new AppError('name cannot be empty', 400);
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    if (updates.deadline) updates.deadline = new Date(updates.deadline);
    
    if (req.body.volunteers && Array.isArray(req.body.volunteers)) {
      updates.volunteers = req.body.volunteers;
    }

    const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('volunteers', 'name email');
    if (!event) throw new AppError('Event not found', 404);
    res.json({ success: true, data: normalizeEvent(event) });
  } catch (error) { next(error); }
});

// Only the club lead can delete events
router.delete('/:id', requireClubLead, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('event id is invalid', 400);
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) throw new AppError('Event not found', 404);
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error) { next(error); }
});

export default router;
