import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', index: true },
    meeting: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deadline: { type: Date, index: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in_progress', 'blocked', 'completed'], default: 'todo', index: true },
    dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    source: { type: String, enum: ['manual', 'meeting', 'ai'], default: 'manual' }
  },
  { timestamps: true }
);

taskSchema.index({ event: 1, deadline: 1, status: 1 });

export default mongoose.model('Task', taskSchema);
