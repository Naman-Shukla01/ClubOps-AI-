import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Risk from '../models/Risk.js';
import Event from '../models/Event.js';
import User from '../models/User.js';

/**
 * Calculate Event Health & Analytics using Mongoose Aggregation pipelines
 */
export async function getEventHealthAnalytics(eventId = null) {
  let eventFilter = {};
  let targetEvent = null;

  if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
    const objectId = new mongoose.Types.ObjectId(eventId);
    eventFilter = { event: objectId };
    targetEvent = await Event.findById(objectId).lean();
  } else {
    targetEvent = await Event.findOne({
      status: { $in: ['planning', 'upcoming', 'ongoing'] }
    }).sort({ createdAt: -1 }).lean();

    if (targetEvent) {
      eventFilter = { event: targetEvent._id };
    }
  }

  const now = new Date();

  // 1. Task Metrics Pipeline
  const taskAggregation = await Task.aggregate([
    { $match: eventFilter },
    {
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        priorityCounts: [
          {
            $group: {
              _id: '$priority',
              count: { $sum: 1 }
            }
          }
        ],
        overdueCount: [
          {
            $match: {
              deadline: { $lt: now },
              status: { $ne: 'completed' }
            }
          },
          {
            $count: 'count'
          }
        ],
        unassignedCount: [
          {
            $match: {
              $or: [{ owner: null }, { owner: { $exists: false } }]
            }
          },
          {
            $count: 'count'
          }
        ],
        totalCount: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ]);

  const taskData = taskAggregation[0] || {};
  const totalTasks = taskData.totalCount?.[0]?.count || 0;
  const overdueTasks = taskData.overdueCount?.[0]?.count || 0;
  const unassignedTasks = taskData.unassignedCount?.[0]?.count || 0;

  const statusMap = { todo: 0, in_progress: 0, blocked: 0, completed: 0 };
  (taskData.statusCounts || []).forEach((item) => {
    if (item._id && statusMap.hasOwnProperty(item._id)) {
      statusMap[item._id] = item.count;
    }
  });

  const priorityMap = { low: 0, medium: 0, high: 0, critical: 0 };
  (taskData.priorityCounts || []).forEach((item) => {
    if (item._id && priorityMap.hasOwnProperty(item._id)) {
      priorityMap[item._id] = item.count;
    }
  });

  const completedTasks = statusMap.completed || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. Risk Metrics Pipeline
  const riskAggregation = await Risk.aggregate([
    {
      $match: {
        ...eventFilter,
        status: { $in: ['open', 'acknowledged'] }
      }
    },
    {
      $facet: {
        severityCounts: [
          {
            $group: {
              _id: '$severity',
              count: { $sum: 1 }
            }
          }
        ],
        typeCounts: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 }
            }
          }
        ],
        totalActiveRisks: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ]);

  const riskData = riskAggregation[0] || {};
  const activeRiskCount = riskData.totalActiveRisks?.[0]?.count || 0;

  const risksBySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
  (riskData.severityCounts || []).forEach((item) => {
    if (item._id && risksBySeverity.hasOwnProperty(item._id)) {
      risksBySeverity[item._id] = item.count;
    }
  });

  const risksByType = {};
  (riskData.typeCounts || []).forEach((item) => {
    if (item._id) {
      risksByType[item._id] = item.count;
    }
  });

  // 3. Volunteer Workload Pipeline
  const volunteerWorkloadAggregation = await Task.aggregate([
    {
      $match: {
        ...eventFilter,
        owner: { $ne: null, $exists: true }
      }
    },
    {
      $group: {
        _id: '$owner',
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        inProgressTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        blockedTasks: {
          $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] }
        },
        overdueTasks: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lt: ['$deadline', now] },
                  { $ne: ['$status', 'completed'] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    {
      $unwind: {
        path: '$userInfo',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        volunteerName: { $ifNull: ['$userInfo.name', 'Unknown Volunteer'] },
        email: { $ifNull: ['$userInfo.email', ''] },
        role: { $ifNull: ['$userInfo.role', 'volunteer'] },
        totalTasks: 1,
        completedTasks: 1,
        inProgressTasks: 1,
        blockedTasks: 1,
        overdueTasks: 1,
        activeTasks: { $subtract: ['$totalTasks', '$completedTasks'] }
      }
    },
    {
      $sort: { activeTasks: -1, totalTasks: -1 }
    }
  ]);

  const volunteerWorkloads = volunteerWorkloadAggregation.map((v) => {
    let workloadRating = 'optimal';
    if (v.activeTasks >= 5 || v.overdueTasks >= 2) {
      workloadRating = 'overloaded';
    } else if (v.activeTasks >= 3) {
      workloadRating = 'heavy';
    } else if (v.activeTasks <= 1) {
      workloadRating = 'light';
    }

    return {
      ...v,
      workloadRating
    };
  });

  // 4. Calculate Event Health Index Score (0 - 100)
  let healthScore = 100;
  // Deduct for critical and high risks
  healthScore -= (risksBySeverity.critical || 0) * 15;
  healthScore -= (risksBySeverity.high || 0) * 8;
  healthScore -= (risksBySeverity.medium || 0) * 3;
  // Deduct for overdue and blocked tasks
  healthScore -= overdueTasks * 6;
  healthScore -= (statusMap.blocked || 0) * 5;
  // Clamp between 0 and 100
  healthScore = Math.max(0, Math.min(100, healthScore));

  let healthStatus = 'Excellent';
  if (healthScore < 45) {
    healthStatus = 'Critical Risk';
  } else if (healthScore < 70) {
    healthStatus = 'Needs Attention';
  } else if (healthScore < 85) {
    healthStatus = 'Good';
  }

  return {
    success: true,
    eventId: targetEvent?._id || eventId || null,
    eventName: targetEvent?.name || 'All Events Overview',
    timestamp: now.toISOString(),
    metrics: {
      completionPercentage,
      healthScore,
      healthStatus,
      activeRiskCount,
      totalTasks,
      completedTasks,
      overdueTasks,
      unassignedTasks,
      activeVolunteersCount: volunteerWorkloads.length
    },
    tasksSummary: {
      total: totalTasks,
      byStatus: statusMap,
      byPriority: priorityMap,
      overdue: overdueTasks,
      unassigned: unassignedTasks
    },
    riskRadar: {
      totalActive: activeRiskCount,
      bySeverity: risksBySeverity,
      byType: risksByType
    },
    volunteerWorkloads,
    eventDetails: targetEvent
      ? {
          _id: targetEvent._id,
          name: targetEvent.name,
          startDate: targetEvent.startDate,
          endDate: targetEvent.endDate,
          location: targetEvent.location,
          status: targetEvent.status
        }
      : null
  };
}
