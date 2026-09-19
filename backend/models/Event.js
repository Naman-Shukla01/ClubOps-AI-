import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    deadline: { type: Date }, // Manual deadline for tasks/requirements
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
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', index: true },
    volunteers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Volunteers assigned to this event
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

eventSchema.index({ startDate: 1, status: 1 });

export default mongoose.model('Event', eventSchema);
