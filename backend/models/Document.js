<<<<<<< HEAD
// models/Document.js
const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  channel: { 
    type: String, 
    enum: ['WhatsApp', 'Telegram', 'General'], 
    default: 'WhatsApp' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
=======
import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    type: { type: String, required: true, trim: true },
    content: { type: String, trim: true, default: '' },
    referenceMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Document', documentSchema);
>>>>>>> main
