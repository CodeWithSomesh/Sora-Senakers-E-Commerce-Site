import { Request, Response } from "express";
import SecurityLog from "../models/securityLog";
import FailedLogin from "../models/failedLogin";
import AdminAction from "../models/adminAction";
import AnalyticsEvent from "../models/analyticsEvent";

/**
 * SECURITY ANALYTICS CONTROLLER
 *
 * Implements security-focused analytics for academic demonstration
 * Showcases essential security monitoring concepts for e-commerce platforms
 */

/**
 * 1. TRACK FAILED LOGIN ATTEMPT
 * Security Benefit: Detects brute-force attacks and credential stuffing
 */
export const trackFailedLogin = async (req: Request, res: Response) => {
  try {
    const { username, email, reason } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || "unknown";
    const userAgent = req.headers['user-agent'] || "unknown";

    // Check if this user has recent failed attempts (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAttempts = await FailedLogin.countDocuments({
      username,
      timestamp: { $gte: twentyFourHoursAgo }
    });

    // Flag if 3 or more failed attempts
    const shouldFlag = recentAttempts >= 2; // This will be the 3rd attempt

    // Create failed login record
    const failedLogin = await FailedLogin.create({
      username,
      email,
      ipAddress,
      userAgent,
      attemptCount: recentAttempts + 1,
      timestamp: new Date(),
      reason: reason || "invalid_credentials",
      flagged: shouldFlag,
    });

    // Also log in security log for comprehensive tracking
    await SecurityLog.create({
      eventType: "failed_login",
      username,
      ipAddress,
      userAgent,
      severity: shouldFlag ? "high" : "medium",
      details: {
        email,
        attemptCount: recentAttempts + 1,
        reason,
      },
      timestamp: new Date(),
    });

    return res.status(201).json({
      message: "Failed login recorded",
      flagged: shouldFlag,
      attemptCount: recentAttempts + 1,
    });
  } catch (error) {
    console.error("Track failed login error:", error);
    return res.status(500).json({ message: "Failed to track failed login" });
  }
};

/**
 * 2. TRACK ADMIN ACTION
 * Security Benefit: Creates audit trail for privileged operations
 */
export const trackAdminAction = async (req: Request, res: Response) => {
  try {
    const { adminId, adminUsername, actionType, targetType, targetId, targetName, changes } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || "unknown";
    const userAgent = req.headers['user-agent'] || "unknown";

    // Create admin action record
    const adminAction = await AdminAction.create({
      adminId,
      adminUsername,
      actionType,
      targetType,
      targetId,
      targetName,
      changes,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      status: "success",
    });

    // Also log in security log
    await SecurityLog.create({
      eventType: "admin_action",
      userId: adminId,
      username: adminUsername,
      ipAddress,
      userAgent,
      severity: "low",
      details: {
        actionType,
        targetType,
        targetId,
        targetName,
      },
      timestamp: new Date(),
    });

    return res.status(201).json({
      message: "Admin action logged",
      actionId: adminAction._id,
    });
  } catch (error) {
    console.error("Track admin action error:", error);
    return res.status(500).json({ message: "Failed to track admin action" });
  }
};

/**
 * 3. DETECT SUSPICIOUS ACTIVITY
 * Security Benefit: Identifies potential fraud and security threats
 */
export const detectSuspiciousActivity = async (req: Request, res: Response) => {
  try {
    const { type, userId, username, details } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || "unknown";
    const userAgent = req.headers['user-agent'] || "unknown";

    let severity = "medium";
    let eventType = "suspicious_activity";

    // Determine severity based on type
    if (type === "high_value_purchase") {
      severity = "high";
      eventType = "high_value_purchase";
    } else if (type === "rapid_checkout") {
      severity = "high";
      eventType = "rapid_checkout";
    } else if (type === "multiple_accounts") {
      severity = "critical";
      eventType = "multiple_accounts";
    }

    // Create security log entry
    await SecurityLog.create({
      eventType,
      userId,
      username,
      ipAddress,
      userAgent,
      severity,
      details,
      timestamp: new Date(),
      resolved: false,
    });

    return res.status(201).json({
      message: "Suspicious activity logged",
      severity,
    });
  } catch (error) {
    console.error("Detect suspicious activity error:", error);
    return res.status(500).json({ message: "Failed to log suspicious activity" });
  }
};

/**
 * 4. GET SECURITY DASHBOARD DATA
 * Returns comprehensive security metrics for admin dashboard
 */
export const getSecurityDashboard = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    // 1. Failed Login Attempts (last 24 hours)
    const failedLogins = await FailedLogin.find({
      timestamp: { $gte: twentyFourHoursAgo }
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    const failedLoginCount = await FailedLogin.countDocuments({
      timestamp: { $gte: twentyFourHoursAgo }
    });

    const flaggedLogins = await FailedLogin.countDocuments({
      timestamp: { $gte: twentyFourHoursAgo },
      flagged: true
    });

    // 2. Admin Actions (today)
    const adminActions = await AdminAction.find({
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const adminActionCount = await AdminAction.countDocuments({
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    });

    // 3. Suspicious Activities (unresolved)
    const suspiciousActivities = await SecurityLog.find({
      severity: { $in: ["high", "critical"] },
      resolved: false,
      timestamp: { $gte: twentyFourHoursAgo }
    })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

    const flaggedTransactions = await SecurityLog.countDocuments({
      eventType: { $in: ["high_value_purchase", "rapid_checkout"] },
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    });

    // 4. IP-based Analytics
    const multipleAccountsFromIP = await SecurityLog.aggregate([
      {
        $match: {
          eventType: "successful_login",
          timestamp: { $gte: twentyFourHoursAgo }
        }
      },
      {
        $group: {
          _id: "$ipAddress",
          userCount: { $addToSet: "$userId" },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          $expr: { $gte: [{ $size: "$userCount" }, 3] } // 3 or more different users from same IP
        }
      },
      {
        $project: {
          ipAddress: "$_id",
          userCount: { $size: "$userCount" },
          loginCount: "$count",
          _id: 0
        }
      }
    ]);

    // 5. Security Event Distribution (for chart)
    const securityEventCounts = await SecurityLog.aggregate([
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

    // 6. Success vs Failed Login Comparison
    const successfulLogins = await AnalyticsEvent.countDocuments({
      eventType: "login",
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    });

    const failedLoginsToday = await FailedLogin.countDocuments({
      timestamp: { $gte: startOfToday, $lte: endOfToday }
    });

    return res.status(200).json({
      metrics: {
        failedLoginCount,
        flaggedLogins,
        flaggedTransactions,
        adminActionCount,
        suspiciousActivityCount: suspiciousActivities.length,
        blockedIPs: multipleAccountsFromIP.length,
      },
      failedLogins: failedLogins.map(login => ({
        id: login._id,
        username: login.username,
        email: login.email,
        ipAddress: login.ipAddress,
        timestamp: login.timestamp,
        attemptCount: login.attemptCount,
        flagged: login.flagged,
        reason: login.reason,
      })),
      adminActions: adminActions.map(action => ({
        id: action._id,
        adminUsername: action.adminUsername,
        actionType: action.actionType,
        targetType: action.targetType,
        targetName: action.targetName,
        timestamp: action.timestamp,
        status: action.status,
      })),
      suspiciousActivities: suspiciousActivities.map(activity => ({
        id: activity._id,
        eventType: activity.eventType,
        username: activity.username,
        ipAddress: activity.ipAddress,
        severity: activity.severity,
        details: activity.details,
        timestamp: activity.timestamp,
      })),
      multipleAccountsFromIP,
      securityEventCounts,
      loginComparison: {
        successful: successfulLogins,
        failed: failedLoginsToday,
      },
    });
  } catch (error) {
    console.error("Get security dashboard error:", error);
    return res.status(500).json({ message: "Failed to get security dashboard data" });
  }
};

/**
 * 5. RESOLVE SECURITY ALERT
 * Allows admins to mark security issues as resolved
 */
export const resolveSecurityAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;

    const alert = await SecurityLog.findByIdAndUpdate(
      alertId,
      { resolved: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Security alert not found" });
    }

    return res.status(200).json({
      message: "Security alert resolved",
      alert,
    });
  } catch (error) {
    console.error("Resolve security alert error:", error);
    return res.status(500).json({ message: "Failed to resolve security alert" });
  }
};
