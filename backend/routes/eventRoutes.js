import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

function normalizeEvent(event) {
  const eventDoc = event?.toObject ? event.toObject() : event;
  return {
    id: eventDoc._id?.toString?.() || eventDoc.id,
    name: eventDoc.name || 'Untitled Event',
    description: eventDoc.description || '',
    startDate: eventDoc.startDate ? new Date(eventDoc.startDate).toISOString() : null,
    endDate: eventDoc.endDate ? new Date(eventDoc.endDate).toISOString() : null,
    location: eventDoc.location || '',
    status: eventDoc.status || 'planning',
    requirements: eventDoc.requirements || { documents: [], permits: [] },
    createdBy: eventDoc.createdBy || null,
    createdAt: eventDoc.createdAt,
    updatedAt: eventDoc.updatedAt,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find().sort({ startDate: 1 });
    res.status(200).json({
      success: true,
      data: events.map(normalizeEvent),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, location, status } = req.body || {};

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
      location: location || '',
      status: status || 'planning',
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, data: normalizeEvent(event) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('event id is invalid', 400);
    const allowed = ['name', 'description', 'startDate', 'endDate', 'location', 'status', 'requirements'];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (updates.name !== undefined && (!String(updates.name).trim())) throw new AppError('name cannot be empty', 400);
    if (updates.startDate) updates.startDate = new Date(updates.startDate);
    if (updates.endDate) updates.endDate = new Date(updates.endDate);
    const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!event) throw new AppError('Event not found', 404);
    res.json({ success: true, data: normalizeEvent(event) });
  } catch (error) { next(error); }
});

router.delete('/:id', requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('event id is invalid', 400);
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) throw new AppError('Event not found', 404);
    res.json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error) { next(error); }
});

export default router;
