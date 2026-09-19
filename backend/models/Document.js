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