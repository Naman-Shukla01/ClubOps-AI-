import express from 'express';
import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

function normalizeAnnouncement(ann) {
  const doc = ann?.toObject ? ann.toObject() : ann;
  return {
    id: doc._id?.toString?.() || doc.id,
    title: doc.title,
    content: doc.content || '',
    channels: Array.isArray(doc.channels) ? doc.channels : [],
    status: doc.status || 'draft',
    clubId: doc.club?.toString?.() || doc.club,
    createdBy: doc.createdBy || 'Admin',
    createdAt: doc.createdAt,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { clubId } = req.query;
    if (!clubId || !mongoose.isValidObjectId(clubId)) {
      throw new AppError('clubId is required and must be a valid ObjectId', 400);
    }
    const announcements = await Announcement.find({ club: clubId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements.map(normalizeAnnouncement) });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { title, content, channels, status, clubId, createdBy } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }
    if (!clubId || !mongoose.isValidObjectId(clubId)) {
      throw new AppError('clubId is required and must be a valid ObjectId', 400);
    }

    const ann = await Announcement.create({
      title: title.trim(),
      content: content?.trim() || '',
      channels: Array.isArray(channels) ? channels.filter(Boolean) : [],
      status: ['draft', 'scheduled', 'sent'].includes(status) ? status : 'draft',
      club: clubId,
      createdBy: createdBy || 'Admin'
    });

    res.status(201).json({ success: true, data: normalizeAnnouncement(ann) });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid announcement ID', 400);
    
    const { title, content, channels, status } = req.body || {};
    const updates = {};
    if (title) updates.title = title.trim();
    if (content !== undefined) updates.content = content.trim();
    if (Array.isArray(channels)) updates.channels = channels.filter(Boolean);
    if (status) updates.status = status;

    const ann = await Announcement.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!ann) throw new AppError('Announcement not found', 404);
    res.status(200).json({ success: true, data: normalizeAnnouncement(ann) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid announcement ID', 400);
    
    const ann = await Announcement.findByIdAndDelete(id);
    if (!ann) throw new AppError('Announcement not found', 404);
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
});

export default router;
