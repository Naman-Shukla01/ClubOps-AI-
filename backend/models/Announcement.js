import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true, default: '' },
    channels: { type: [String], default: [] },
    status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'sent', index: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);
