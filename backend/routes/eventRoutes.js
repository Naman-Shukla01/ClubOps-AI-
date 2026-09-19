import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorMiddleware.js';

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

async function resolveCreator(value) {
  if (value && mongoose.isValidObjectId(String(value))) return value;

  const user = await User.findOne();
  if (value) {
    const existing = await User.findOne({ name: new RegExp(`^${String(value).trim()}$`, 'i') });
    if (existing) return existing._id;
  }

  if (user) return user._id;

  const created = await User.create({
    name: 'Club Lead',
    email: 'lead@clubops.ai',
    role: 'lead',
  });

  return created._id;
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

router.post('/', async (req, res, next) => {
  try {
    const { name, description, startDate, endDate, location, status, createdBy } = req.body || {};

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
      createdBy: await resolveCreator(createdBy),
    });

    res.status(201).json({ success: true, data: normalizeEvent(event) });
  } catch (error) {
    next(error);
  }
});

export default router;
