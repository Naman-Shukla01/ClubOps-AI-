// models/Risk.js
const mongoose = require('mongoose');

const RiskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Open', 'Mitigated', 'Resolved'], 
    default: 'Open' 
  },
  relatedTask: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Task' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Risk', RiskSchema);