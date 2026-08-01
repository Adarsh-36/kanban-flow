import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETED'],
      default: 'TODO',
    },
    position: { type: Number, required: true, default: 0 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

// Compound Index for fast column retrieval and ordering
taskSchema.index({ boardId: 1, status: 1, position: 1 });

export default mongoose.model('Task', taskSchema);