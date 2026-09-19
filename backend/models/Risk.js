import mongoose from 'mongoose';

const riskSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    type: {
      type: String,
      enum: ['deadline', 'resource', 'volunteer', 'dependency', 'communication', 'logistics', 'other'],
      default: 'other'
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    sourceType: { type: String, trim: true, default: 'task' },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'mitigated', 'dismissed'],
      default: 'open',
      index: true
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    fingerprint: {
      type: String,
      index: true,
      default: () => `risk-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
    },
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
