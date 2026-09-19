<<<<<<< HEAD
// models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  assignedTo: {
    type: String,
    default: 'Unassigned'
  },
  deadline: {
    type: String,
    default: 'TBD'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'Critical', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  meetingSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', TaskSchema);
=======
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in_progress', 'blocked', 'completed'], default: 'todo', index: true },
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    source: { type: String, enum: ['manual', 'meeting', 'ai'], default: 'manual' }
  },
  { timestamps: true }
);

taskSchema.index({ event: 1, deadline: 1, status: 1 });

export default mongoose.model('Task', taskSchema);
>>>>>>> main
