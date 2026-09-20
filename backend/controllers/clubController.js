import mongoose from 'mongoose';
import Club from '../models/Club.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { AppError } from '../middleware/errorMiddleware.js';

function normalizeClub(club) {
  const doc = club?.toObject ? club.toObject() : club;
  return {
    id: doc._id?.toString?.() || doc.id,
    name: doc.name,
    icon: doc.icon,
    color: doc.color,
    description: doc.description,
    skills: doc.skills,
    head: doc.head,
    members: Array.isArray(doc.members) ? doc.members.length : 0,
    maxMembers: doc.maxMembers,
    events: 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const getClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find().populate('head', 'name email');
    res.status(200).json({ success: true, data: clubs.map(normalizeClub) });
  } catch (error) {
    next(error);
  }
};

export const createClub = async (req, res, next) => {
  try {
    const { name, icon, color, description, skills, maxMembers } = req.body;
    
    if (!name) {
      throw new AppError('Club name is required', 400);
    }
    
    const club = await Club.create({
      name,
      icon,
      color,
      description,
      skills,
      maxMembers,
      head: req.user.id,
      members: [req.user.id],
    });

    // Promote the creator to EVENT_MANAGER so they can create events/tasks
    await User.findByIdAndUpdate(req.user.id, { role: 'EVENT_MANAGER' });
    
    const populated = await Club.findById(club._id).populate('head', 'name email');
    res.status(201).json({ 
      success: true, 
      data: normalizeClub(populated),
      userRole: 'EVENT_MANAGER',
    });
  } catch (error) {
    next(error);
  }
};

export const getClubById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError('Club not found', 404);
    }
    const club = await Club.findById(req.params.id).populate('head', 'name email');
    if (!club) throw new AppError('Club not found', 404);
    res.status(200).json({ success: true, data: normalizeClub(club) });
  } catch (error) {
    next(error);
  }
};

export const joinClub = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError('Club not found', 404);
    }
    const club = await Club.findById(req.params.id);
    if (!club) throw new AppError('Club not found', 404);
    
    if (club.members.includes(req.user.id)) {
      throw new AppError('Already a member', 400);
    }
    
    club.members.push(req.user.id);
    await club.save();
    
    res.status(200).json({ success: true, ok: true, message: 'Joined club successfully' });
  } catch (error) {
    next(error);
  }
};

export const leaveClub = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      throw new AppError('Club not found', 404);
    }
    const club = await Club.findById(req.params.id);
    if (!club) throw new AppError('Club not found', 404);
    
    club.members = club.members.filter(m => m.toString() !== req.user.id);
    await club.save();
    
    res.status(200).json({ success: true, ok: true, message: 'Left club successfully' });
  } catch (error) {
    next(error);
  }
};

export const getClubEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(200).json({ success: true, data: [] });
    }
    const events = await Event.find({ club: id }).sort({ startDate: 1 });
    res.status(200).json({ success: true, data: events });
  } catch (error) {
    next(error);
  }
};

export const createClubEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, title, description, startDate, endDate, deadline, location, status } = req.body || {};
    const eventName = (name || title || '').trim();
    if (!eventName) {
      throw new AppError('Event name is required', 400);
    }
    const event = await Event.create({
      name: eventName,
      description: description || '',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      deadline: deadline ? new Date(deadline) : null,
      location: location || '',
      status: status || 'upcoming',
      club: mongoose.isValidObjectId(id) ? id : null,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

export const getClubMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(200).json({ success: true, data: [] });
    }
    const club = await Club.findById(id).populate('members', 'name email role status skills capacity');
    if (!club) throw new AppError('Club not found', 404);
    res.status(200).json({ success: true, data: club.members || [] });
  } catch (error) {
    next(error);
  }
};
