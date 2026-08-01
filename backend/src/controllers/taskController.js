import mongoose from 'mongoose';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import CustomError from '../utils/customError.js';

/**
 * @desc    Create a new task & log activity atomically
 * @route   POST /api/tasks
 * @access  Private
 */
export const createTask = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { title, description, boardId, status, dueDate, assignedTo } = req.body;
    const userId = req.user._id;

    if (!title || !boardId) {
      throw new CustomError('Title and Board ID are required', 400);
    }

    // Determine highest current position in the target column to place new task at the end
    const targetStatus = status || 'TODO';
    const lastTask = await Task.findOne({ boardId, status: targetStatus })
      .sort({ position: -1 })
      .session(session);

    const position = lastTask ? lastTask.position + 1 : 0;

    const [newTask] = await Task.create(
      [
        {
          title,
          description,
          boardId,
          status: targetStatus,
          position,
          dueDate: dueDate || null,
          assignedTo: assignedTo || null,
        },
      ],
      { session }
    );

    // Log the creation activity
    await ActivityLog.create(
      [
        {
          boardId,
          taskId: newTask._id,
          performedBy: userId,
          action: 'TASK_CREATED',
          details: { status: newTask.status },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * @desc    Move task position or column atomically & log activity
 * @route   PATCH /api/tasks/:id/move
 * @access  Private
 */
export const moveTask = async (req, res, next) => {
  // Start a MongoDB Client Session for ACID Transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id: taskId } = req.params;
    const { destinationStatus, newPosition } = req.body;
    const userId = req.user._id; // Assumes authMiddleware sets req.user

    if (!destinationStatus || newPosition === undefined) {
      throw new CustomError('Destination status and new position are required', 400);
    }

    // 1. Fetch current task state inside session
    const task = await Task.findById(taskId).session(session);
    if (!task) {
      throw new CustomError('Task not found', 404);
    }

    const sourceStatus = task.status;
    const oldPosition = task.position;
    const boardId = task.boardId;

    // 2. Adjust positions of other tasks in the target/source columns
    if (sourceStatus === destinationStatus) {
      // Moving within the SAME column
      if (oldPosition < newPosition) {
        // Shift intermediate items UP (decrement position)
        await Task.updateMany(
          {
            boardId,
            status: sourceStatus,
            position: { $gt: oldPosition, $lte: newPosition },
          },
          { $inc: { position: -1 } },
          { session }
        );
      } else if (oldPosition > newPosition) {
        // Shift intermediate items DOWN (increment position)
        await Task.updateMany(
          {
            boardId,
            status: sourceStatus,
            position: { $gte: newPosition, $lt: oldPosition },
          },
          { $inc: { position: 1 } },
          { session }
        );
      }
    } else {
      // Moving to a DIFFERENT column
      // A. Shift remaining items down in the OLD column
      await Task.updateMany(
        {
          boardId,
          status: sourceStatus,
          position: { $gt: oldPosition },
        },
        { $inc: { position: -1 } },
        { session }
      );

      // B. Make space in the NEW column
      await Task.updateMany(
        {
          boardId,
          status: destinationStatus,
          position: { $gte: newPosition },
        },
        { $inc: { position: 1 } },
        { session }
      );
    }

    // 3. Update the target task itself
    task.status = destinationStatus;
    task.position = newPosition;
    await task.save({ session });

    // 4. Create ActivityLog entry (only log if column actually changed)
    if (sourceStatus !== destinationStatus) {
      await ActivityLog.create(
        [
          {
            boardId,
            taskId,
            performedBy: userId,
            action: 'TASK_MOVED',
            details: {
              fromStatus: sourceStatus,
              toStatus: destinationStatus,
            },
          },
        ],
        { session }
      );
    }

    // Commit all operations atomically
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Task moved successfully',
      data: task,
    });
  } catch (error) {
    // Revert all database updates if any error occurs
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};