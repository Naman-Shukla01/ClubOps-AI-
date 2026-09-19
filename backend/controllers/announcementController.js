import mongoose from 'mongoose';
import Event from '../models/Event.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { generateAnnouncement } from '../services/announcementService.js';

const VALID_TYPES = ['milestone', 'schedule_change', 'general'];
const VALID_CHANNELS = ['whatsapp', 'telegram'];
const MAX_TITLE_LENGTH = 200;
const MAX_DETAILS_LENGTH = 8000;

export async function createAnnouncement(req, res, next) {
  try {
    const { eventId, type, title, details, channel } = req.body || {};

    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      throw new AppError('eventId must be a valid MongoDB ObjectId', 400);
    }

    if (!VALID_TYPES.includes(type)) {
      throw new AppError('type must be milestone, schedule_change, or general', 400);
    }

    if (!VALID_CHANNELS.includes(channel)) {
      throw new AppError('channel must be whatsapp or telegram', 400);
    }

    if (typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required and cannot be empty', 400);
    }

    if (typeof details !== 'string' || !details.trim()) {
      throw new AppError('details is required and cannot be empty', 400);
    }

    if (title.length > MAX_TITLE_LENGTH) {
      throw new AppError(`title cannot exceed ${MAX_TITLE_LENGTH} characters`, 413);
    }

    if (details.length > MAX_DETAILS_LENGTH) {
      throw new AppError(`details cannot exceed ${MAX_DETAILS_LENGTH} characters`, 413);
    }

    const event = await Event.findById(eventId).select('name createdBy');
    if (!event) {
      throw new AppError('Event not found', 404);
    }

    if (req.user.role !== 'ADMIN' && String(event.createdBy) !== String(req.user.id)) {
      throw new AppError('You are not authorized to access this event', 403);
    }

    const announcement = await generateAnnouncement({
      eventName: event.name,
      type,
      title: title.trim(),
      details: details.trim(),
      channel
    });

    res.status(200).json({
      success: true,
      announcement
    });
  } catch (error) {
    next(error);
  }
}
