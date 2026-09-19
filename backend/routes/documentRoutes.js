import express from 'express';
import mongoose from 'mongoose';
import Document from '../models/Document.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorMiddleware.js';

const router = express.Router();

function normalizeDocument(document) {
  const doc = document?.toObject ? document.toObject() : document;
  return {
    id: doc._id?.toString?.() || doc.id,
    title: doc.title || 'Untitled document',
    description: doc.description || '',
    type: doc.type || 'PDF',
    content: doc.content || '',
    event: doc.event || null,
    uploadedBy: doc.uploadedBy || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

async function resolveUploadedBy(value) {
  if (!value) {
    const user = await User.findOne();
    return user?._id || null;
  }

  if (mongoose.isValidObjectId(String(value))) return value;

  const user = await User.findOne({ name: new RegExp(`^${value.trim()}$`, 'i') });
  if (user) return user._id;

  const created = await User.create({
    name: value.trim(),
    email: `${value.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}@clubops.ai`,
    role: 'volunteer',
  });

  return created._id;
}

router.get('/', async (req, res, next) => {
  try {
    const documents = await Document.find().populate('event', 'name').populate('uploadedBy', 'name email role').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: documents.map(normalizeDocument),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { event, title, description, type, content, uploadedBy } = req.body || {};

    if (!event || !mongoose.isValidObjectId(String(event))) {
      throw new AppError('event is required and must be a valid ObjectId', 400);
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      throw new AppError('Event not found', 404);
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }

    const doc = await Document.create({
      event: eventDoc._id,
      title: title.trim(),
      description: description || '',
      type: type || 'PDF',
      content: content || '',
      uploadedBy: await resolveUploadedBy(uploadedBy),
    });

    res.status(201).json({ success: true, data: normalizeDocument(doc) });
  } catch (error) {
    next(error);
  }
});

export default router;
