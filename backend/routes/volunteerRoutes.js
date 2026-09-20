import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';

const router = express.Router();

function normalizeVolunteer(user) {
  const userDoc = user?.toObject ? user.toObject() : user;
  return {
    id: userDoc._id?.toString?.() || userDoc.id,
    name: userDoc.name,
    email: userDoc.email || '',
    role: userDoc.role,
    skills: Array.isArray(userDoc.skills) ? userDoc.skills : [],
    capacity: Number.isFinite(userDoc.capacity) ? userDoc.capacity : 0,
    status: userDoc.status || 'active',
    club: userDoc.club ? { id: userDoc.club._id?.toString(), name: userDoc.club.name } : null,
  };
}

function emailBase(name) {
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'volunteer'}@clubops.ai`;
}

async function uniqueEmail(name) {
  const base = emailBase(name);
  let email = base;
  let suffix = 1;
  while (await User.exists({ email })) {
    email = `${base.split('@')[0]}${suffix++}@clubops.ai`;
  }
  return email;
}

router.get('/', async (req, res, next) => {
  try {
    const { clubId } = req.query;
    const filter = { role: { $in: ['volunteer', 'VOLUNTEER'] } };
    if (clubId && mongoose.isValidObjectId(clubId)) {
      filter.club = clubId;
    }
    const volunteers = await User.find(filter).populate('club', 'name').sort({ name: 1 });
    res.status(200).json({ success: true, data: volunteers.map(normalizeVolunteer) });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { name, email, skills, capacity, status, clubId } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      throw new AppError('name is required', 400);
    }

    const volunteer = await User.create({
      name: name.trim(),
      email: email?.trim().toLowerCase() || await uniqueEmail(name.trim()),
      role: 'volunteer',
      skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
      capacity: Number.isFinite(Number(capacity)) ? Number(capacity) : 0,
      status: ['active', 'busy', 'idle'].includes(status) ? status : 'active',
      club: (clubId && mongoose.isValidObjectId(clubId)) ? clubId : undefined,
    });

    const populated = await volunteer.populate('club', 'name');
    res.status(201).json({ success: true, data: normalizeVolunteer(populated) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/assign-task', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { taskId } = req.body || {};
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(taskId)) {
      throw new AppError('volunteer id and taskId must be valid ObjectIds', 400);
    }

    const [volunteer, task] = await Promise.all([User.findOne({ _id: id, role: 'volunteer' }).populate('club', 'name'), Task.findById(taskId)]);
    if (!volunteer) throw new AppError('Volunteer not found', 404);
    if (!task) throw new AppError('Task not found', 404);

    task.owner = volunteer._id;
    await task.save();
    res.status(200).json({ success: true, data: { taskId: task.id, volunteer: normalizeVolunteer(volunteer) } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid volunteer ID', 400);
    
    const { name, email, skills, capacity, status, clubId } = req.body || {};
    const updates = {};
    if (name) updates.name = name.trim();
    if (email) updates.email = email.trim().toLowerCase();
    if (Array.isArray(skills)) updates.skills = skills.filter(Boolean);
    if (capacity !== undefined) updates.capacity = Number(capacity);
    if (status) updates.status = status;
    if (clubId && mongoose.isValidObjectId(clubId)) updates.club = clubId;

    const volunteer = await User.findOneAndUpdate(
      { _id: id, role: { $in: ['volunteer', 'VOLUNTEER'] } },
      updates,
      { new: true }
    ).populate('club', 'name');

    if (!volunteer) throw new AppError('Volunteer not found', 404);
    res.status(200).json({ success: true, data: normalizeVolunteer(volunteer) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new AppError('Invalid volunteer ID', 400);
    
    const volunteer = await User.findOneAndDelete({ _id: id, role: { $in: ['volunteer', 'VOLUNTEER'] } });
    if (!volunteer) throw new AppError('Volunteer not found', 404);
    
    // Unassign tasks from this volunteer
    await Task.updateMany({ owner: id }, { $unset: { owner: 1 } });
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
});

export default router;