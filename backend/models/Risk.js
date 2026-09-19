<<<<<<< HEAD
// models/Risk.js
const mongoose = require('mongoose');

const RiskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Open', 'Mitigated', 'Resolved'], 
    default: 'Open' 
  },
  relatedTask: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Risk', RiskSchema);
=======
import mongoose from 'mongoose';

const riskSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    type: { type: String, enum: ['deadline', 'resource', 'volunteer', 'dependency', 'communication', 'logistics', 'other'], required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    sourceType: { type: String, required: true, trim: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, enum: ['open', 'acknowledged', 'mitigated', 'dismissed'], default: 'open', index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    fingerprint: { type: String, required: true, index: true },
    detectedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

riskSchema.index({ event: 1, severity: 1, status: 1 });
riskSchema.index(
  { event: 1, sourceType: 1, sourceId: 1, type: 1, fingerprint: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['open', 'acknowledged'] } }
  }
);

export default mongoose.model('Risk', riskSchema);
>>>>>>> main
