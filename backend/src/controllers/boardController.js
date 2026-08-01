import mongoose from 'mongoose';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js'; // Added ActivityLog import
import CustomError from '../utils/customError.js';

/**
 * @desc    Get aggregated real-time analytics for a specific board
 * @route   GET /api/boards/:id/analytics
 * @access  Private
 */
export const getBoardAnalytics = async (req, res, next) => {
  try {
    const { id: boardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      throw new CustomError('Invalid Board ID format', 400);
    }

    const objectIdBoard = new mongoose.Types.ObjectId(boardId);

    // Single Aggregation Pipeline using $facet for high performance
    const [analyticsResult] = await Task.aggregate([
      // Stage 1: Filter tasks strictly for the requested board
      {
        $match: {
          boardId: objectIdBoard,
        },
      },

      // Stage 2: Process multiple parallel metrics pipelines using $facet
      {
        $facet: {
          // Sub-pipeline A: Count tasks grouped by status (e.g., TODO, IN_PROGRESS, COMPLETED)
          statusBreakdown: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
            {
              $project: {
                _id: 0,
                status: '$_id',
                count: 1,
              },
            },
          ],

          // Sub-pipeline B: Calculate overdue tasks count (dueDate < NOW and status != COMPLETED)
          overdueMetrics: [
            {
              $match: {
                status: { $ne: 'COMPLETED' },
                dueDate: { $lt: new Date() },
              },
            },
            {
              $count: 'overdueCount',
            },
          ],

          // Sub-pipeline C: Calculate workload per team member
          workloadPerUser: [
            {
              $match: {
                assignedTo: { $exists: true, $ne: null },
              },
            },
            {
              $group: {
                _id: '$assignedTo',
                totalAssigned: { $sum: 1 },
                pendingTasks: {
                  $sum: {
                    $cond: [{ $ne: ['$status', 'COMPLETED'] }, 1, 0],
                  },
                },
                completedTasks: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0],
                  },
                },
              },
            },
            // Lookup user details from the 'users' collection to include name and email
            {
              $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'assignee',
              },
            },
            {
              $unwind: '$assignee',
            },
            {
              $project: {
                _id: 0,
                userId: '$_id',
                userName: '$assignee.name',
                userEmail: '$assignee.email',
                totalAssigned: 1,
                pendingTasks: 1,
                completedTasks: 1,
              },
            },
          ],

          // Sub-pipeline D: Overall summary stats (Total tasks, completion velocity %)
          overallSummary: [
            {
              $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                completedTasks: {
                  $sum: {
                    $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                totalTasks: 1,
                completedTasks: 1,
                completionPercentage: {
                  $cond: [
                    { $gt: ['$totalTasks', 0] },
                    {
                      $multiply: [
                        { $divide: ['$completedTasks', '$totalTasks'] },
                        100,
                      ],
                    },
                    0,
                  ],
                },
              },
            },
          ],
        },
      },
    ]);

    // Format and sanitize output payload
    const formattedData = {
      summary: analyticsResult.overallSummary[0] || {
        totalTasks: 0,
        completedTasks: 0,
        completionPercentage: 0,
      },
      statusBreakdown: analyticsResult.statusBreakdown,
      overdueCount: analyticsResult.overdueMetrics[0]?.overdueCount || 0,
      workloadPerUser: analyticsResult.workloadPerUser,
    };

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get activity logs for a specific board
 * @route   GET /api/boards/:id/activity
 * @access  Private
 */
export const getBoardActivityLogs = async (req, res, next) => {
  try {
    const { id: boardId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      throw new CustomError('Invalid Board ID format', 400);
    }

    const logs = await ActivityLog.find({ boardId })
      .populate('performedBy', 'name email')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 })
      .limit(50); // Keep response snappy

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};