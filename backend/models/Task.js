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
