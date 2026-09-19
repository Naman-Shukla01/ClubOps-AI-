<<<<<<< HEAD
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
=======
import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true, index: true },
    rawTranscript: { type: String, trim: true, default: '' },
    summary: { type: String, trim: true, default: '' },
    decisions: { type: [String], default: [] },
    actionItems: { type: [mongoose.Schema.Types.Mixed], default: [] },
    importantDates: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model('Meeting', meetingSchema);
>>>>>>> main
