import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    type: { type: String, trim: true, default: 'document' },
    content: { type: String, trim: true, default: '' },
    referenceMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    aiAnalysis: {
      summary: { type: String, default: '' },
      tasks: [{ type: mongoose.Schema.Types.Mixed }]
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
