// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const Task = require('../models/Task');
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
      2. A list of tasks. Each task must have: title, assignedTo (person's name or "Unassigned"), deadline (string or "TBD"), and priority ("Low", "Medium", or "Critical").
      
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

module.exports = router;