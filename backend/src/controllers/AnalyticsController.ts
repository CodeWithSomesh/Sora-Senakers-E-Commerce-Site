import { Request, Response } from "express";
import AnalyticsEvent from "../models/analyticsEvent";
import AnalyticsDaily from "../models/analyticsDaily";

/**
 * Track an analytics event
 */
export const trackEvent = async (req: Request, res: Response) => {
  try {
    const { eventType, userId, data } = req.body;

    if (!eventType) {
      return res.status(400).json({
        message: "eventType is required"
      });
    }

    // Validate event type
    const validEventTypes = [
      "login",
      "logout",
      "signup",
      "view_product",
      "add_to_cart",
      "purchase",
      "page_view"
    ];

    if (!validEventTypes.includes(eventType)) {
      return res.status(400).json({
        message: `Invalid event type. Must be one of: ${validEventTypes.join(", ")}`
      });
    }

    // Create analytics event
    const event = await AnalyticsEvent.create({
      eventType,
      userId: userId || null,
      timestamp: new Date(),
      data: data || {},
    });

    return res.status(201).json({
      message: "Event tracked successfully",
      eventId: event._id,
    });
  } catch (error) {
    console.error("Track event error:", error);
    return res.status(500).json({
      message: "Failed to track event"
    });
  }
};

/**
 * Get dashboard data
 */
export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // 1. Get active users (last 30 minutes)
    const activeUsersResult = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: thirtyMinutesAgo },
          userId: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$userId"
        }
      },
      {
        $count: "activeUsers"
      }
    ]);

    const activeUsers = activeUsersResult.length > 0 ? activeUsersResult[0].activeUsers : 0;

    // 2. Get today's stats
    const todayEvents = await AnalyticsEvent.find({
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    });

    const todayUsers = new Set(
      todayEvents
        .filter(e => e.userId)
        .map(e => e.userId)
    ).size;

    const todaySessions = todayEvents.filter(e => e.eventType === "login").length;

    const purchaseEvents = todayEvents.filter(e => e.eventType === "purchase");
    const todayRevenue = purchaseEvents.reduce((sum, e) => {
      return sum + (e.data?.totalAmount || 0);
    }, 0);

    const todayOrders = purchaseEvents.length;

    // 3. Get recent events (last 20)
    const recentEvents = await AnalyticsEvent
      .find()
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    // 4. Get top products
    const topProductsResult = await AnalyticsEvent.aggregate([
      {
        $match: {
          eventType: { $in: ["view_product", "purchase"] },
          timestamp: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      {
        $group: {
          _id: "$data.productId",
          productName: { $first: "$data.productName" },
          views: {
            $sum: {
              $cond: [{ $eq: ["$eventType", "view_product"] }, 1, 0]
            }
          },
          purchases: {
            $sum: {
              $cond: [{ $eq: ["$eventType", "purchase"] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          productId: "$_id",
          productName: 1,
          views: 1,
          purchases: 1,
          _id: 0
        }
      }
    ]);

    // 5. Get event counts by type (for chart)
    const eventCountsResult = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startOfToday, $lte: endOfToday }
        }
      },
      {
        $group: {
          _id: "$eventType",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          eventType: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    return res.status(200).json({
      activeUsers,
      todayStats: {
        totalUsers: todayUsers,
        totalSessions: todaySessions,
        totalRevenue: todayRevenue,
        totalOrders: todayOrders,
      },
      recentEvents: recentEvents.map(event => ({
        id: event._id,
        eventType: event.eventType,
        userId: event.userId,
        timestamp: event.timestamp,
        data: event.data,
      })),
      topProducts: topProductsResult,
      eventCounts: eventCountsResult,
    });
  } catch (error) {
    console.error("Get dashboard data error:", error);
    return res.status(500).json({
      message: "Failed to get dashboard data"
    });
  }
};

/**
 * Get analytics for a specific date range
 */
export const getAnalyticsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate and endDate are required"
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const events = await AnalyticsEvent.find({
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: -1 });

    return res.status(200).json({
      events,
      count: events.length,
    });
  } catch (error) {
    console.error("Get analytics by date range error:", error);
    return res.status(500).json({
      message: "Failed to get analytics by date range"
    });
  }
};

/**
 * Clean up old analytics events (older than 30 days)
 */
export const cleanupOldEvents = async (req: Request, res: Response) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await AnalyticsEvent.deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });

    return res.status(200).json({
      message: "Old events cleaned up successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Cleanup old events error:", error);
    return res.status(500).json({
      message: "Failed to cleanup old events"
    });
  }
};
