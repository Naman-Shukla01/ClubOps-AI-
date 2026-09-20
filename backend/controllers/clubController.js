import mongoose from 'mongoose';
import Club from '../models/Club.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import { AppError } from '../middleware/errorMiddleware.js';

function normalizeClub(club, userId = null) {
  const doc = club?.toObject ? club.toObject() : club;
  const rawMembers = Array.isArray(doc.members) ? doc.members : [];
  const memberIds = rawMembers.map(m => m._id?.toString?.() || m.toString?.() || String(m));
  
  return {
    id: doc._id?.toString?.() || doc.id,
    name: doc.name,
    icon: doc.icon || '🏛️',
    color: doc.color || '#7c5cfc',
    description: doc.description || '',
    skills: doc.skills || [],
    head: doc.head,
    members: rawMembers.length,
    memberIds,
    isMember: userId ? memberIds.includes(String(userId)) : false,
    maxMembers: doc.maxMembers || 50,
    events: doc.eventsCount || 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function normalizeEvent(event) {
  const doc = event?.toObject ? event.toObject() : event;
  return {
    id: doc._id?.toString?.() || doc.id,
    name: doc.name,
    description: doc.description || '',
    startDate: doc.startDate,
    endDate: doc.endDate,
    deadline: doc.deadline || null,
    location: doc.location || '',
    status: doc.status || 'upcoming',
    club: doc.club?._id?.toString?.() || doc.club?.toString?.() || doc.club || null,
    createdBy: doc.createdBy?._id?.toString?.() || doc.createdBy?.toString?.() || doc.createdBy || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export const getClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find().populate('head', 'name email');
    const clubIds = clubs.map(c => c._id);
    
    // Dynamically aggregate real event counts per club from Event collection
    const eventCounts = await Event.aggregate([
      { $match: { club: { $in: clubIds } } },
      { $group: { _id: '$club', count: { $sum: 1 } } }
    ]);
    const eventCountMap = new Map(eventCounts.map(ec => [ec._id.toString(), ec.count]));

    const userId = req.user?.id;
    const data = clubs.map(c => {
      const doc = c.toObject();
      doc.eventsCount = eventCountMap.get(doc._id.toString()) || 0;
      return normalizeClub(doc, userId);
    });

    res.status(200).json({ success: true, data });
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

    // Promote creator to EVENT_MANAGER
    await User.findByIdAndUpdate(req.user.id, { role: 'EVENT_MANAGER' });
    
    const populated = await Club.findById(club._id).populate('head', 'name email');
    res.status(201).json({ 
      success: true, 
      data: normalizeClub(populated, req.user.id),
      userRole: 'EVENT_MANAGER',
    });
  } catch (error) {
    next(error);
  }
};

function canManageClub(req, club) {
  return req.user?.role === 'ADMIN' || String(club.head) === String(req.user?.id);
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) return skills.map((skill) => String(skill).trim()).filter(Boolean);
  if (typeof skills === 'string') return skills.split(',').map((skill) => skill.trim()).filter(Boolean);
  return undefined;
}

export const updateClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Club not found', 404);
    }

    const club = await Club.findById(id);
    if (!club) throw new AppError('Club not found', 404);

    if (!canManageClub(req, club)) {
      throw new AppError('Only this club head or an admin can update this club', 403);
    }

    const { name, icon, color, description, skills, maxMembers } = req.body || {};

    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'name')) {
      if (!name || typeof name !== 'string' || !name.trim()) {
        throw new AppError('Club name is required', 400);
      }
      club.name = name.trim();
    }

    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'icon')) club.icon = icon || '🏛️';
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'color')) club.color = color || '#7c5cfc';
    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'description')) club.description = description || '';

    const nextSkills = normalizeSkills(skills);
    if (nextSkills !== undefined) club.skills = nextSkills;

    if (Object.prototype.hasOwnProperty.call(req.body || {}, 'maxMembers')) {
      const parsedMaxMembers = Number(maxMembers);
      club.maxMembers = Number.isFinite(parsedMaxMembers) && parsedMaxMembers >= 1 ? parsedMaxMembers : club.maxMembers;
    }

    await club.save();

    const [populated, eventCount] = await Promise.all([
      Club.findById(club._id).populate('head', 'name email'),
      Event.countDocuments({ club: club._id }),
    ]);
    const doc = populated.toObject();
    doc.eventsCount = eventCount;

    res.status(200).json({ success: true, data: normalizeClub(doc, req.user?.id) });
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
    
    const eventCount = await Event.countDocuments({ club: club._id });
    const doc = club.toObject();
    doc.eventsCount = eventCount;

    res.status(200).json({ success: true, data: normalizeClub(doc, req.user?.id) });
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
    
    const userIdStr = String(req.user.id);
    const existingMemberIds = club.members.map(m => m.toString());

    if (existingMemberIds.includes(userIdStr)) {
      return res.status(200).json({ success: true, ok: true, message: 'Already a member' });
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
    
    club.members = club.members.filter(m => m.toString() !== String(req.user.id));
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
    res.status(200).json({ success: true, data: events.map(normalizeEvent) });
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
    res.status(201).json({ success: true, data: normalizeEvent(event) });
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
