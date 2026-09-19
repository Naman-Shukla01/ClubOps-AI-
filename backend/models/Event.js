import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    startDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    location: { type: String, trim: true, default: '' },
    requirements: {
      documents: { type: [String], default: [] },
      permits: { type: [String], default: [] }
    },
    status: {
      type: String,
      enum: ['planning', 'upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'planning',
      index: true
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

eventSchema.index({ startDate: 1, status: 1 });

export default mongoose.model('Event', eventSchema);
