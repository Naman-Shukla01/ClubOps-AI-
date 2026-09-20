import express from 'express';
import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { requireClubLead } from '../middleware/clubPermissionMiddleware.js';

const router = express.Router();

function normalizeAnnouncement(announcement) {
  const doc = announcement?.toObject ? announcement.toObject() : announcement;
  const creator = doc.createdBy && typeof doc.createdBy === 'object' ? doc.createdBy : null;

  return {
    id: doc._id?.toString?.() || doc.id,
    title: doc.title,
    content: doc.content || '',
    channels: Array.isArray(doc.channels) ? doc.channels : [],
    status: doc.status || 'sent',
    clubId: doc.club?._id?.toString?.() || doc.club?.toString?.() || doc.club || null,
    createdBy: creator?.name || 'Unknown',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { clubId } = req.query;
    if (clubId && !mongoose.isValidObjectId(clubId)) {
      throw new AppError('clubId is invalid', 400);
    }
    const query = clubId ? { club: clubId } : {};
    const announcements = await Announcement.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: announcements.map(normalizeAnnouncement) });
  } catch (error) {
    next(error);
  }
});

const handleUpdateAnnouncement = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Announcement not found', 404);
    const updates = {};
    for (const field of ['title', 'content', 'channels', 'status']) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) updates[field] = req.body[field];
    }
    if (updates.title !== undefined && (!String(updates.title).trim())) throw new AppError('title is required', 400);
    if (updates.title !== undefined) updates.title = String(updates.title).trim();
    if (updates.channels !== undefined && !Array.isArray(updates.channels)) throw new AppError('channels must be an array', 400);
    if (updates.status !== undefined && !['draft', 'scheduled', 'sent'].includes(updates.status)) throw new AppError('status is invalid', 400);
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('createdBy', 'name email');
    if (!announcement) throw new AppError('Announcement not found', 404);
    res.status(200).json({ success: true, data: normalizeAnnouncement(announcement) });
  } catch (error) { next(error); }
};

router.patch('/:id', requireClubLead, handleUpdateAnnouncement);
router.put('/:id', requireClubLead, handleUpdateAnnouncement);

router.delete('/:id', requireClubLead, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError('Announcement not found', 404);
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) throw new AppError('Announcement not found', 404);
    res.status(200).json({ success: true, data: { id: req.params.id, deleted: true } });
  } catch (error) { next(error); }
});

router.post('/', requireClubLead, async (req, res, next) => {
  try {
    const { title, content, channels, status, clubId } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content || '',
      channels: Array.isArray(channels) ? channels.filter(Boolean) : [],
      status: ['draft', 'scheduled', 'sent'].includes(status) ? status : 'sent',
      club: clubId && mongoose.isValidObjectId(clubId) ? clubId : null,
      createdBy: req.user.id,
    });

    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: normalizeAnnouncement(populated) });
  } catch (error) {
    next(error);
  }
});

export default router;
