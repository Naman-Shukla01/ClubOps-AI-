import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import Club from '../models/Club.js';

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
    const { clubId, q } = req.query;
    let query = { role: { $in: ['VOLUNTEER', 'volunteer'] } };

    if (clubId && mongoose.isValidObjectId(clubId)) {
      const club = await Club.findById(clubId).select('members');
      if (!club) throw new AppError('Club not found', 404);
      query._id = { $in: club.members || [] };
    }

    if (q && typeof q === 'string' && q.trim()) {
      const pattern = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query = { ...query, $or: [{ name: pattern }, { email: pattern }] };
    }

    const volunteers = await User.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, data: volunteers.map(normalizeVolunteer) });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireRole(ROLES.ADMIN, ROLES.EVENT_MANAGER), async (req, res, next) => {
  try {
    const { name, email, skills, capacity, status } = req.body || {};
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
    });

    res.status(201).json({ success: true, data: normalizeVolunteer(volunteer) });
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

    const [volunteer, task] = await Promise.all([User.findOne({ _id: id, role: 'volunteer' }), Task.findById(taskId)]);
    if (!volunteer) throw new AppError('Volunteer not found', 404);
    if (!task) throw new AppError('Task not found', 404);

    task.owner = volunteer._id;
    await task.save();
    res.status(200).json({ success: true, data: { taskId: task.id, volunteer: normalizeVolunteer(volunteer) } });
  } catch (error) {
    next(error);
  }
});

export default router;
