import mongoose from 'mongoose';

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: '🏛️',
  },
  color: {
    type: String,
    default: '#7c5cfc',
  },
  description: {
    type: String,
    trim: true,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxMembers: {
    type: Number,
    default: 50,
  },
}, { timestamps: true });

const Club = mongoose.models.Club || mongoose.model('Club', clubSchema);
export default Club;
