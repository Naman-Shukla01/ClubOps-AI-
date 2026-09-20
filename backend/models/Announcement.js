import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, trim: true, default: '' },
    channels: { type: [String], default: ['WhatsApp'] },
    status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    createdBy: { type: String, default: 'Admin' }
  },
  { timestamps: true }
);

export default mongoose.model('Announcement', announcementSchema);
