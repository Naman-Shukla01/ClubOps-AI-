import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import Document from '../models/Document.js';
import Club from '../models/Club.js';
import Event from '../models/Event.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import Risk from '../models/Risk.js';
import { AppError } from '../middleware/errorMiddleware.js';
import { ROLES } from '../middleware/authMiddleware.js';
import { parseDocumentText, queryDocumentText } from '../services/documentParserService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

async function extractPdfTextFromBuffer(buffer) {
  if (!buffer || buffer.length === 0) return '';
  try {
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const result = await parser.getText();
    if (typeof result === 'string' && result.trim()) {
      return result.trim();
    }
    if (result && typeof result.text === 'string' && result.text.trim()) {
      return result.text.trim();
    }
    if (Array.isArray(result?.pages)) {
      const pageText = result.pages.map((p) => p.text || '').join('\n').trim();
      if (pageText) return pageText;
    }
  } catch (err) {
    console.warn('PDFParse failed, attempting clean stream text extraction:', err.message);
  }

  // Fallback: extract string literals inside PDF PostScript (clean text chunks)
  try {
    const str = buffer.toString('latin1');
    const matches = str.match(/\(([^)]{2,})\)/g) || [];
    const extracted = matches
      .map((m) => m.slice(1, -1).trim())
      .filter((s) => !/^[0-9\s\W_]+$/.test(s) && !/^(Chromium|Skia\/PDF|D:\d+|Normal|DeviceRGB|Filter|FlateDecode|Font|ProcSet)/i.test(s) && s.length > 2);
    if (extracted.length > 0) {
      return extracted.join(' ');
    }
  } catch (e) {
    console.warn('Fallback stream text extraction failed:', e.message);
  }

  return '';
}

function normalizeDocument(document) {
  const doc = document?.toObject ? document.toObject() : document;
  return {
    id: doc._id?.toString?.() || doc.id,
    title: doc.title || 'Untitled document',
    description: doc.description || '',
    type: doc.type || 'PDF',
    fileUrl: doc.fileUrl || '',
    content: doc.content || '',
    aiAnalysis: doc.aiAnalysis || null,
    club: doc.club || null,
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

async function saveTasks(tasks, document, eventId, clubId) {
  if (!tasks || !tasks.length) return [];
  
  const filter = eventId ? { event: eventId } : clubId ? { club: clubId } : {};
  const existingTasks = await Task.find(filter).select('_id title');
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
      event: eventId || undefined,
      club: clubId || undefined,
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

async function saveRisks(risks, document, eventId, clubId) {
  if (!risks || !risks.length) return [];
  
  const filter = eventId ? { event: eventId } : clubId ? { club: clubId } : {};
  const existingRisks = await Risk.find(filter).select('_id title');
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
      event: eventId || undefined,
      club: clubId || undefined,
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

// GET /api/documents - List documents with optional ?clubId= and ?eventId=
router.get('/', async (req, res, next) => {
  try {
    const { clubId, eventId } = req.query;
    const filter = {};

    if (clubId && mongoose.isValidObjectId(String(clubId))) {
      filter.club = clubId;
    }

    if (eventId && mongoose.isValidObjectId(String(eventId))) {
      filter.event = eventId;
    }

    const documents = await Document.find(filter)
      .populate('event', 'name startDate endDate')
      .populate('club', 'name icon')
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: documents.map(normalizeDocument),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/documents/:id - Single document view
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid document ID', 400);
    }

    const doc = await Document.findById(id)
      .populate('event', 'name startDate endDate')
      .populate('club', 'name icon')
      .populate('uploadedBy', 'name email role');

    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    res.status(200).json({
      success: true,
      data: normalizeDocument(doc),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/documents - Upload document (Club Head / Admin Only)
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const { event, club, title, description, type } = req.body || {};

    let eventDoc = null;
    let resolvedClubId = club && mongoose.isValidObjectId(String(club)) ? club : null;

    if (event && mongoose.isValidObjectId(String(event))) {
      eventDoc = await Event.findById(event);
      if (eventDoc && !resolvedClubId) {
        resolvedClubId = eventDoc.club;
      }
    }

    if (!resolvedClubId && req.user?.club) {
      resolvedClubId = req.user.club;
    }

    let clubDoc = null;
    if (resolvedClubId && mongoose.isValidObjectId(String(resolvedClubId))) {
      clubDoc = await Club.findById(resolvedClubId);
    }

    // Role check: Only club head / admin / event manager can upload
    const userRole = (req.user?.role || req.user?.user?.role || '').toLowerCase();
    const userId = req.user?.id || req.user?._id;
    const isClubHead =
      (clubDoc && String(clubDoc.head) === String(userId)) ||
      userRole === 'admin' ||
      userRole === 'event_manager' ||
      userRole === 'club-head' ||
      userRole === 'lead';

    if (!isClubHead) {
      throw new AppError('Forbidden: Only club leads and admins can upload documents', 403);
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      throw new AppError('title is required', 400);
    }

    let extractedText = req.body.content || '';
    let parsedData = null;
    let fileType = type || 'PDF';

    if (req.file) {
      const mimetype = req.file.mimetype || '';
      const originalName = req.file.originalname || '';

      if (mimetype === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
        extractedText = await extractPdfTextFromBuffer(req.file.buffer);
        fileType = 'PDF';
      } else if (mimetype === 'text/plain' || originalName.toLowerCase().endsWith('.txt')) {
        extractedText = req.file.buffer.toString('utf-8');
        fileType = 'TXT';
      } else {
        extractedText = req.file.buffer.toString('utf-8');
        fileType = 'DOC';
      }
    }

    const doc = await Document.create({
      event: eventDoc ? eventDoc._id : null,
      club: clubDoc ? clubDoc._id : (eventDoc?.club || resolvedClubId || undefined),
      title: title.trim(),
      description: description || '',
      type: fileType,
      content: extractedText,
      uploadedBy: req.user?.id || req.user?._id,
    });
    
    let createdTasks = [];
    let createdRisks = [];
    if (extractedText && extractedText.trim()) {
       parsedData = await parseDocumentText(extractedText, doc.title);
       if (parsedData) {
         if (parsedData.tasks) {
           createdTasks = await saveTasks(parsedData.tasks, doc, eventDoc?._id || null, doc.club);
         }
         if (parsedData.risks) {
           createdRisks = await saveRisks(parsedData.risks, doc, eventDoc?._id || null, doc.club);
         }
         doc.aiAnalysis = {
           summary: parsedData.summary || '',
           keyPoints: parsedData.keyPoints || [],
           tasks: parsedData.tasks || [],
           risks: parsedData.risks || [],
           actionItems: parsedData.actionItems || [],
           importantDates: parsedData.importantDates || [],
           sentiment: parsedData.sentiment || 'neutral'
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

// POST /api/documents/:id/summarize - On-demand AI Summarization (Any joined member)
router.post('/:id/summarize', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid document ID', 400);
    }

    const doc = await Document.findById(id).populate('event').populate('club');
    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    const textToSummarize = doc.content || doc.description || doc.title;
    const aiAnalysis = await parseDocumentText(textToSummarize, doc.title);

    doc.aiAnalysis = {
      summary: aiAnalysis.summary || '',
      keyPoints: aiAnalysis.keyPoints || [],
      tasks: aiAnalysis.tasks || [],
      risks: aiAnalysis.risks || [],
      actionItems: aiAnalysis.actionItems || [],
      importantDates: aiAnalysis.importantDates || [],
      sentiment: aiAnalysis.sentiment || 'neutral'
    };
    await doc.save();

    res.status(200).json({
      success: true,
      data: normalizeDocument(doc),
      aiAnalysis: doc.aiAnalysis
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/documents/:id/ask - Interactive Document Q&A
router.post('/:id/ask', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid document ID', 400);
    }

    if (!question || typeof question !== 'string' || !question.trim()) {
      throw new AppError('question is required', 400);
    }

    const doc = await Document.findById(id);
    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    const text = doc.content || doc.description || `${doc.title}\n${doc.aiAnalysis?.summary || ''}`;
    const result = await queryDocumentText(text, question.trim());

    res.status(200).json({
      success: true,
      answer: result.answer,
      relevantPoints: result.relevantPoints || []
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/documents/:id - Delete Document (Club Head / Uploader / Admin)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new AppError('Invalid document ID', 400);
    }

    const doc = await Document.findById(id).populate('club');
    if (!doc) {
      throw new AppError('Document not found', 404);
    }

    const isUploader = String(doc.uploadedBy) === String(req.user.id);
    const isHead = doc.club && String(doc.club.head) === String(req.user.id);
    const isAdmin = req.user.role === ROLES.ADMIN || req.user.role === ROLES.EVENT_MANAGER;

    if (!isUploader && !isHead && !isAdmin) {
      throw new AppError('Forbidden: Only the document uploader or club head can delete this document', 403);
    }

    await Document.findByIdAndDelete(id);
    await Risk.deleteMany({ sourceType: 'document', sourceId: id });

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
      id
    });
  } catch (error) {
    next(error);
  }
});

export default router;

