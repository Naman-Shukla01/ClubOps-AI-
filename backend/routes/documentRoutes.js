import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import Document from '../models/Document.js';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Risk from '../models/Risk.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { parseDocumentText } from '../services/documentParserService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

function normalizeDocument(document) {
  const doc = document?.toObject ? document.toObject() : document;
  return {
    id: doc._id?.toString?.() || doc.id,
    title: doc.title || 'Untitled document',
    description: doc.description || '',
    type: doc.type || 'PDF',
    content: doc.content || '',
    aiAnalysis: doc.aiAnalysis || null,
    event: doc.event || null,
    uploadedBy: doc.uploadedBy || null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findUserByName(name) {
  if (!name) return null;
  return User.findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') }).select('_id name');
}

async function saveTasks(tasks, document, eventId) {
  if (!tasks || !tasks.length) return [];
  
  const existingTasks = await Task.find({ event: eventId }).select('_id title');
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
      event: eventId,
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

async function saveRisks(risks, document, eventId) {
  if (!risks || !risks.length) return [];
  
  const existingRisks = await Risk.find({ event: eventId }).select('_id title');
  const existingTitles = new Map(existingRisks.map((risk) => [risk.title.trim().toLowerCase(), risk]));
  const savedRisks = [];

  for (const risk of risks) {
    const normalizedTitle = risk.title.trim().toLowerCase();
    const existingRisk = existingTitles.get(normalizedTitle);

    if (existingRisk) {
      savedRisks.push({ ...risk, riskId: existingRisk._id, persisted: true });
      continue;
    }

    const createdRisk = await Risk.create({
      event: eventId,
      title: risk.title,
      description: risk.description,
      severity: risk.severity,
      type: 'other',
      sourceType: 'document',
      sourceId: document._id
    });

    existingTitles.set(normalizedTitle, createdRisk);
    savedRisks.push({ ...risk, riskId: createdRisk._id, persisted: true });
  }

  return savedRisks;
}

router.get('/', async (req, res, next) => {
  try {
    const documents = await Document.find().populate('event', 'name').populate('uploadedBy', 'name email role').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: documents.map(normalizeDocument),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const { event, title, description, type } = req.body || {};

    if (!event || !mongoose.isValidObjectId(String(event))) {
      throw new AppError('event is required and must be a valid ObjectId', 400);
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) {
      throw new AppError('Event not found', 404);
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }

    let extractedText = req.body.content || '';
    let parsedData = null;
    let fileType = type || 'PDF';

    if (req.file) {
      const mimetype = req.file.mimetype;
      if (mimetype === 'application/pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        extractedText = pdfData.text;
        fileType = 'PDF';
      } else if (mimetype === 'text/plain') {
        extractedText = req.file.buffer.toString('utf-8');
        fileType = 'TXT';
      }
      // Depending on other requirements, we can add docx parsing here
    }

    const doc = await Document.create({
      event: eventDoc._id,
      title: title.trim(),
      description: description || '',
      type: fileType,
      content: extractedText.substring(0, 1000), // Only save a preview of content to DB
      uploadedBy: req.user.id,
    });
    
    let createdTasks = [];
    let createdRisks = [];
    if (extractedText) {
       parsedData = await parseDocumentText(extractedText);
       if (parsedData) {
         if (parsedData.tasks) {
           createdTasks = await saveTasks(parsedData.tasks, doc, eventDoc._id);
         }
         if (parsedData.risks) {
           createdRisks = await saveRisks(parsedData.risks, doc, eventDoc._id);
         }
         doc.aiAnalysis = {
           summary: parsedData.summary || '',
           tasks: parsedData.tasks || [],
           risks: parsedData.risks || []
         };
         await doc.save();
       }
    }

    res.status(201).json({ 
      success: true, 
      data: normalizeDocument(doc),
      aiAnalysis: parsedData,
      createdTasks,
      createdRisks
    });
  } catch (error) {
    next(error);
  }
});

export default router;
