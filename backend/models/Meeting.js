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
