import mongoose from 'mongoose';
import Meeting from '../models/Meeting.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { parseMeetingTranscript } from '../services/transcriptParserService.js';
import { scanEventRisks } from '../services/riskRadarService.js';
import { ROLES } from '../middleware/authMiddleware.js';

const MAX_TRANSCRIPT_LENGTH = 50000;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findUserByName(name) {
  if (!name) {
    return null;
  }

  return User.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') }).select('_id name');
}

async function saveTasks(tasks, meeting) {
  const existingTasks = await Task.find({ meeting: meeting._id }).select('_id title');
  const existingTitles = new Map(existingTasks.map((task) => [task.title.trim().toLowerCase(), task]));
  const savedTasks = [];

  for (const task of tasks) {
    const normalizedTitle = task.title.trim().toLowerCase();
    const existingTask = existingTitles.get(normalizedTitle);

    if (existingTask) {
      savedTasks.push({ ...task, taskId: existingTask._id, persisted: true });
      continue;
    }

    const owner = await findUserByName(task.owner);
    const createdTask = await Task.create({
      event: meeting.event,
      meeting: meeting._id,
      title: task.title,
      description: task.description,
      owner: owner?._id,
      deadline: task.deadline,
      priority: task.priority,
      source: 'ai'
    });

    existingTitles.set(normalizedTitle, createdTask);
    savedTasks.push({ ...task, taskId: createdTask._id, persisted: true });
  }

  return savedTasks;
}

export async function processMeetingTranscript(req, res, next) {
  try {
    const { meetingId, text } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      throw new AppError('text is required and cannot be empty', 400);
    }

    if (text.length > MAX_TRANSCRIPT_LENGTH) {
      throw new AppError(`text cannot exceed ${MAX_TRANSCRIPT_LENGTH} characters`, 413);
    }

    if (meetingId && !mongoose.isValidObjectId(meetingId)) {
      throw new AppError('meetingId must be a valid MongoDB ObjectId', 400);
    }

    const meeting = meetingId ? await Meeting.findById(meetingId) : null;
    if (meetingId && !meeting) {
      throw new AppError('Meeting not found', 404);
    }
    if (meeting && req.user.role === ROLES.VOLUNTEER) {
      throw new AppError('Volunteers cannot process meeting transcripts', 403);
    }

    const parsedTranscript = await parseMeetingTranscript(text.trim(), meeting?.date);
    let persistedTasks = parsedTranscript.tasks;
    let responseMeeting = {
      meetingId: null,
      summary: parsedTranscript.summary,
      decisions: parsedTranscript.decisions,
      actionItems: parsedTranscript.actionItems,
      importantDates: parsedTranscript.importantDates
    };

    if (meeting) {
      meeting.rawTranscript = text.trim();
      meeting.summary = parsedTranscript.summary;
      meeting.decisions = parsedTranscript.decisions;
      meeting.actionItems = parsedTranscript.actionItems;
      meeting.importantDates = parsedTranscript.importantDates;
      await meeting.save();

      persistedTasks = await saveTasks(parsedTranscript.tasks, meeting);
      void scanEventRisks({
        eventId: meeting.event,
        sourceType: 'meeting',
        sourceId: meeting._id
      }).catch((error) => {
        console.error(`Risk scan after meeting processing failed: ${error.message}`);
      });
      responseMeeting = meeting.toObject();
    }

    res.status(200).json({
      success: true,
      meeting: responseMeeting,
      tasks: persistedTasks
    });
  } catch (error) {
    next(error);
  }
}
