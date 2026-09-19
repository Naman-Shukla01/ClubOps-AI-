// routes/documentRoutes.js
const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/documents/generate-broadcast
router.post('/generate-broadcast', async (req, res) => {
    try {
        const { title, updateDetails, channel } = req.body;

        if (!updateDetails) {
            return res.status(400).json({ message: 'Update details or milestone text is required.' });
        }

        const targetChannel = channel || 'WhatsApp';
        const prompt = `
      Convert the following project milestone or schedule change into a professional, engaging, and punchy announcement draft tailored for a ${targetChannel} broadcast channel. 
      Use appropriate emojis, clear formatting, and a call-to-action if relevant.

      Update Details:
      ${updateDetails}

      Return ONLY a valid JSON object in this exact format:
      {
        "title": "A catchy title for the announcement",
        "content": "The full formatted broadcast message with emojis"
      }
    `;

        const model = genAI.getGenerativeModel({
            model: 'gemini-3.6-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });

        const result = await model.generateContent(prompt);
        const aiResult = JSON.parse(result.response.text());

        const newDocument = new Document({
            title: title || aiResult.title,
            content: aiResult.content,
            channel: targetChannel
        });

        const savedDoc = await newDocument.save();

        res.status(201).json({
            message: 'Broadcast announcement generated successfully!',
            document: savedDoc
        });

    } catch (error) {
        console.error('Error generating broadcast announcement:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

module.exports = router;