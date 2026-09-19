<<<<<<< HEAD
// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');

const Risk = require('../models/Risk');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client using your environment variable API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/meetings/process
router.post('/process', async (req, res) => {
    try {
        const { title, rawTranscript } = req.body;

        if (!rawTranscript) {
            return res.status(400).json({ message: 'Transcript text is required' });
        }

        // 1. Craft the strict system prompt telling Gemini to return JSON
        const prompt = `
      Analyze the following club meeting transcript. Extract:
      1. A short summary of the meeting.
      2. A list of tasks. Each task must have: title, assignedTo (person's name or "Unassigned"), deadline (string or "TBD"), and priority ("Low", "Medium","High", or "Critical").
      
      Return ONLY a valid JSON object in this exact format:
      {
        "summary": "...",
        "tasks": [
          {
            "title": "...",
            "assignedTo": "...",
            "deadline": "...",
            "priority": "..."
          }
        ]
      }

      Transcript:
      ${rawTranscript}
    `;

        // 2. Call the Gemini API using gemini-1.5-flash
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse the JSON text returned by Gemini
        const aiResult = JSON.parse(responseText);

        // 3. Save the Meeting Summary to MongoDB[cite: 3]
        const newMeeting = new Meeting({
            title: title || 'Untitled Meeting',
            rawTranscript,
            summary: aiResult.summary
        });
        await newMeeting.save();

        // 4. Save each extracted task individually and link them[cite: 3]
        const savedTaskIds = [];
        for (const t of aiResult.tasks) {
            const newTask = new Task({
                title: t.title,
                assignedTo: t.assignedTo,
                deadline: t.deadline,
                priority: t.priority,
                meetingSource: newMeeting._id
            });
            const savedTask = await newTask.save();
            savedTaskIds.push(savedTask._id);
        }

        // Update meeting with task references
        newMeeting.extractedTasks = savedTaskIds;
        await newMeeting.save();

        // 5. Send success response back to frontend
        res.status(201).json({
            message: 'Meeting processed and tasks extracted successfully!',
            meeting: newMeeting,
            tasks: aiResult.tasks
        });

    } catch (error) {
        console.error('Error processing meeting transcript:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});






// Add this new route inside routes/aiRoutes.js
router.post('/scan-risks', async (req, res) => {
    try {
        // 1. Fetch recent tasks from MongoDB to analyze
        const tasks = await Task.find().sort({ createdAt: -1 }).limit(15);

        if (!tasks || tasks.length === 0) {
            return res.status(400).json({ message: 'No tasks found to scan for risks.' });
        }

        // 2. Craft the prompt for Gemini to evaluate risks, missing permits, or conflicts
        const prompt = `
      Analyze the following list of club event tasks for potential scheduling conflicts, missing safety permits, venue issues, or critical operational gaps:
      ${JSON.stringify(tasks, null, 2)}

      Return ONLY a valid JSON array of identified risks in this exact format:
      [
        {
          "title": "Short title of the risk",
          "description": "Detailed explanation of why this is a risk",
          "severity": "Low" | "Medium" | "High" | "Critical",
          "taskIndex": 0
        }
      ]
      If no risks are found, return an empty array: []
    `;

        // 3. Call Gemini using your configured model
        const model = genAI.getGenerativeModel({
            model: 'gemini-3.6-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const result = await model.generateContent(prompt);
        const aiRisks = JSON.parse(result.response.text());

        // 4. Save each detected risk to MongoDB and link to its related task if applicable
        const savedRisks = [];
        for (const r of aiRisks) {
            const relatedTaskObj = tasks[r.taskIndex] ? tasks[r.taskIndex]._id : null;

            const newRisk = new Risk({
                title: r.title,
                description: r.description,
                severity: r.severity || 'Medium',
                relatedTask: relatedTaskObj
            });

            const savedRisk = await newRisk.save();
            savedRisks.push(savedRisk);
        }

        // 5. Send success response back
        res.status(201).json({
            message: 'Event Risk Radar scan completed successfully!',
            risksFound: savedRisks.length,
            risks: savedRisks
        });

    } catch (error) {
        console.error('Error scanning risks:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;
=======
import express from 'express';
import { createAnnouncement } from '../controllers/announcementController.js';
import { processRiskScan } from '../controllers/riskController.js';
import { featureNotImplemented } from '../controllers/placeholderController.js';

const router = express.Router();

router.post('/risk-scan', processRiskScan);
router.post('/announcement', createAnnouncement);

export default router;
>>>>>>> main
