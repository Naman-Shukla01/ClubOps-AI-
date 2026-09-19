// models/Meeting.js
const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rawTranscript: { type: String, required: true },
  summary: { type: String },
  extractedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Meeting', MeetingSchema);