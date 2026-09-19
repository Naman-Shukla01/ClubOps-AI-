import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    role: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    capacity: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: ['active', 'busy', 'idle'], default: 'active' }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
