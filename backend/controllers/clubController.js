import Club from '../models/Club.js';
import User from '../models/User.js';
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
    events: 0, // In a real app we would aggregate the events count
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
      userRole: 'EVENT_MANAGER', // Tell the frontend about the role upgrade
    });
  } catch (error) {
    next(error);
  }
};

export const getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id).populate('head', 'name email');
    if (!club) throw new AppError('Club not found', 404);
    res.status(200).json({ success: true, data: normalizeClub(club) });
  } catch (error) {
    next(error);
  }
};

export const joinClub = async (req, res, next) => {
  try {
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
    const club = await Club.findById(req.params.id);
    if (!club) throw new AppError('Club not found', 404);
    
    club.members = club.members.filter(m => m.toString() !== req.user.id);
    await club.save();
    
    res.status(200).json({ success: true, ok: true, message: 'Left club successfully' });
  } catch (error) {
    next(error);
  }
};
