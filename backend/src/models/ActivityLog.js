import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['TASK_CREATED', 'TASK_MOVED', 'TASK_UPDATED', 'TASK_DELETED'],
      required: true,
    },
    details: { type: Object }, // e.g., { fromStatus: 'TODO', toStatus: 'IN_PROGRESS' }
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', activityLogSchema);