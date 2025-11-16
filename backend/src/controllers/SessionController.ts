import { Request, Response } from "express";
import Session from "../models/session";

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

/**
 * Create or update a session for a user
 */
export const createOrUpdateSession = async (req: Request, res: Response) => {
  try {
    const { userId, token, ipAddress, userAgent } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        message: "userId and token are required"
      });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);

    // Check if session exists with this token
    let session = await Session.findOne({ token });

    if (session) {
      // Update existing session
      session.lastActivity = now;
      session.expiresAt = expiresAt;
      if (ipAddress) session.ipAddress = ipAddress;
      if (userAgent) session.userAgent = userAgent;
      await session.save();
    } else {
      // Create new session
      session = await Session.create({
        userId,
        token,
        lastActivity: now,
        expiresAt,
        ipAddress,
        userAgent,
      });
    }

    return res.status(200).json({
      message: "Session created/updated successfully",
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error("Create/update session error:", error);
    return res.status(500).json({
      message: "Failed to create/update session"
    });
  }
};

/**
 * Keep session alive - refresh the timeout
 */
export const keepAlive = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No authorization token provided"
      });
    }

    const token = authorization.split(" ")[1];
    const session = await Session.findOne({ token });

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
        sessionExpired: true
      });
    }

    const now = new Date();
    session.lastActivity = now;
    session.expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);
    await session.save();

    return res.status(200).json({
      message: "Session refreshed",
      expiresAt: session.expiresAt,
      timeRemaining: SESSION_TIMEOUT,
    });
  } catch (error) {
    console.error("Keep alive error:", error);
    return res.status(500).json({
      message: "Failed to refresh session"
    });
  }
};

/**
 * Get session status
 */
export const getSessionStatus = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No authorization token provided"
      });
    }

    const token = authorization.split(" ")[1];
    const session = await Session.findOne({ token });

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
        sessionExpired: true
      });
    }

    const now = new Date();
    const timeRemaining = session.expiresAt.getTime() - now.getTime();

    if (timeRemaining <= 0) {
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        message: "Session expired",
        sessionExpired: true
      });
    }

    return res.status(200).json({
      isValid: true,
      expiresAt: session.expiresAt,
      timeRemaining: Math.floor(timeRemaining / 1000), // in seconds
      lastActivity: session.lastActivity,
    });
  } catch (error) {
    console.error("Get session status error:", error);
    return res.status(500).json({
      message: "Failed to get session status"
    });
  }
};

/**
 * Destroy a session (logout)
 */
export const destroySession = async (req: Request, res: Response) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No authorization token provided"
      });
    }

    const token = authorization.split(" ")[1];
    await Session.deleteOne({ token });

    return res.status(200).json({
      message: "Session destroyed successfully"
    });
  } catch (error) {
    console.error("Destroy session error:", error);
    return res.status(500).json({
      message: "Failed to destroy session"
    });
  }
};

/**
 * Destroy all sessions for a user
 */
export const destroyAllUserSessions = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    await Session.deleteMany({ userId });

    return res.status(200).json({
      message: "All user sessions destroyed successfully"
    });
  } catch (error) {
    console.error("Destroy all sessions error:", error);
    return res.status(500).json({
      message: "Failed to destroy all sessions"
    });
  }
};
