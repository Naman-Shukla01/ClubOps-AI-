import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    type: { type: String, trim: true, default: 'PDF' },
    fileUrl: { type: String, trim: true, default: '' },
    content: { type: String, default: '' },
    referenceMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    aiAnalysis: {
      summary: { type: String, default: '' },
      keyPoints: [{ type: String }],
      tasks: [{ type: mongoose.Schema.Types.Mixed }],
      risks: [{ type: mongoose.Schema.Types.Mixed }],
      actionItems: [{ type: String }],
      importantDates: [{ type: String }],
      sentiment: { type: String, default: 'neutral' }
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

documentSchema.index({ club: 1, createdAt: -1 });

export default mongoose.models.Document || mongoose.model('Document', documentSchema);
