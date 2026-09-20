import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Club from '../models/Club.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { requireClubLead } from '../middleware/clubPermissionMiddleware.js';


const router = express.Router();

const validStatus = ['todo', 'in_progress', 'blocked', 'completed'];
const validPriority = ['low', 'medium', 'high', 'critical'];

function normalizeStatus(status) {
  return validStatus.includes(status) ? status : 'todo';
}

function normalizePriority(priority) {
  return validPriority.includes(priority) ? priority : 'medium';
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeTask(task) {
  const taskDoc = task?.toObject ? task.toObject() : task;
  const owner = taskDoc.owner && typeof taskDoc.owner === 'object' ? taskDoc.owner : null;
  const assignee = owner?.name || 'Unassigned';
  const deadline = taskDoc.deadline ? new Date(taskDoc.deadline).toISOString() : null;

  return {
    id: taskDoc._id?.toString?.() || taskDoc.id,
    title: taskDoc.title || 'Untitled task',
    description: taskDoc.description || '',
    status: normalizeStatus(taskDoc.status),
    priority: normalizePriority(taskDoc.priority),
    assignee,
    dueDate: deadline ? new Date(taskDoc.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    owner: owner ? { id: owner._id || owner.id, name: owner.name, email: owner.email || '' } : null,
    event: taskDoc.event || null,
    club: taskDoc.club || null,
    tags: taskDoc.source ? [taskDoc.source] : [],
    createdAt: taskDoc.createdAt,
    updatedAt: taskDoc.updatedAt,
  };
}

async function resolveOwner(ownerValue) {
  if (!ownerValue) return null;

  if (mongoose.isValidObjectId(String(ownerValue))) {
    return ownerValue;
  }

  const cleanName = String(ownerValue).trim();
  if (!cleanName) return null;

  const existingUser = await User.findOne({ name: new RegExp(`^${escapeRegex(cleanName)}$`, 'i') }).lean();
  if (existingUser) return existingUser._id;

  const generatedEmail = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'volunteer'}@clubops.ai`;
  const user = await User.create({
    name: cleanName,
    email: generatedEmail,
    role: 'volunteer',
  });

  return user._id;
}

async function resolveEvent(eventValue) {
  if (eventValue && mongoose.isValidObjectId(String(eventValue))) {
    const event = await Event.findById(eventValue);
    if (event) return event;
  }

  let event = await Event.findOne().sort({ createdAt: -1 });
  if (!event) {
    const defaultUser = (await User.findOne()) || await User.create({
      name: 'Club Lead',
      email: 'lead@clubops.ai',
      role: 'lead',
    });

    event = await Event.create({
      name: 'Club Operations Event',
      description: 'Default event',
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'planning',
      createdBy: defaultUser._id,
    });
  }

  return event;
}

router.get('/', async (req, res, next) => {
  try {
    const { clubId } = req.query;
    let query = {};

    if (clubId && mongoose.isValidObjectId(clubId)) {
      // Find all events that belong to this club first
      const clubEvents = await Event.find({ club: clubId }).select('_id');
      const eventIds = clubEvents.map(e => e._id);
      
      if (eventIds.length > 0) {
        // Tasks that have this clubId set, OR that belong to events of this club
        query = { $or: [{ club: clubId }, { event: { $in: eventIds } }] };
      } else {
        // Try direct club field match as fallback
        query = { club: clubId };
      }
    }

    // Volunteers only see their own tasks
    if (req.user.role === ROLES.VOLUNTEER && !clubId) {
      query.owner = req.user.id;
    }

    const tasks = await Task.find(query)
      .populate('owner', 'name email role')
      .populate('event', 'name')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: tasks.map(normalizeTask),
    });
  } catch (error) {
    next(error);
  }
});

// Only club leads can create tasks
router.post('/', requireClubLead, async (req, res, next) => {
  try {
    const { title, description, owner, deadline, priority, status, event, source, clubId } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }

    const taskEvent = await resolveEvent(event);
    const task = await Task.create({
      event: taskEvent._id,
      club: (clubId && mongoose.isValidObjectId(clubId)) ? clubId : null,
      title: title.trim(),
      description: description || '',
      owner: await resolveOwner(owner),
      deadline: deadline ? new Date(deadline) : null,
      priority: normalizePriority(priority),
      status: normalizeStatus(status),
      source: source || 'manual',
    });

    const populated = await Task.findById(task._id).populate('owner', 'name email role').populate('event', 'name');
    res.status(201).json({ success: true, data: normalizeTask(populated) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('task id is invalid', 400);
    }

    const task = await Task.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const taskClubId = task.club || (task.event ? (await Event.findById(task.event).select('club'))?.club : null);
    const requestedClubId = req.body?.clubId || taskClubId;
    if (!requestedClubId || !mongoose.isValidObjectId(String(requestedClubId))) {
      throw new AppError('Task must belong to a valid club', 400);
    }
    const club = await Club.findById(requestedClubId).select('head');
    if (!club) throw new AppError('Club not found', 404);
    const isClubManager = req.user.role === ROLES.ADMIN || String(club.head) === String(req.user.id);
    const isTaskOwner = String(task.owner) === String(req.user.id);
    if (!isClubManager && !isTaskOwner) {
      throw new AppError('Only the club lead can update this task', 403);
    }

    const isManager = isClubManager;
    if (!isManager && String(task.owner) !== req.user.id) {
      throw new AppError('You may only update tasks assigned to you', 403);
    }

    const nextData = req.body || {};
    if (!isManager && ['owner', 'event'].some((field) => Object.prototype.hasOwnProperty.call(nextData, field))) {
      throw new AppError('Volunteers cannot reassign tasks or move them between events', 403);
    }
    if (nextData.title && typeof nextData.title === 'string') task.title = nextData.title.trim();
    if (Object.prototype.hasOwnProperty.call(nextData, 'description')) task.description = nextData.description || '';
    if (Object.prototype.hasOwnProperty.call(nextData, 'owner')) task.owner = await resolveOwner(nextData.owner);
    if (Object.prototype.hasOwnProperty.call(nextData, 'deadline')) task.deadline = nextData.deadline ? new Date(nextData.deadline) : null;
    if (Object.prototype.hasOwnProperty.call(nextData, 'priority')) task.priority = normalizePriority(nextData.priority);
    if (Object.prototype.hasOwnProperty.call(nextData, 'status')) task.status = normalizeStatus(nextData.status);
    if (nextData.event) {
      const event = await resolveEvent(nextData.event);
      task.event = event._id;
    }

    await task.save();
    const populated = await Task.findById(task._id).populate('owner', 'name email role').populate('event', 'name');
    res.status(200).json({ success: true, data: normalizeTask(populated) });
  } catch (error) {
    next(error);
  }
});

// Only club leads can delete tasks
router.delete('/:id', requireClubLead, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('task id is invalid', 400);
    }

    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    res.status(200).json({ success: true, data: { id, deleted: true } });
  } catch (error) {
    next(error);
  }
});

export default router;
