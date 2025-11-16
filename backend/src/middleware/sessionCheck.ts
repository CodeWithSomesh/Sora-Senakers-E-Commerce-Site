import { Request, Response, NextFunction } from "express";
import Session from "../models/session";

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Middleware to check if user's session is still valid
 * Returns 401 if session has expired
 * Updates lastActivity on valid requests
 */
export const checkSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No authorization token provided",
        sessionExpired: false
      });
    }

    const token = authorization.split(" ")[1];

    // Find the session
    const session = await Session.findOne({ token });

    if (!session) {
      return res.status(401).json({
        message: "Invalid session",
        sessionExpired: true
      });
    }

    // Check if session has expired
    const now = new Date();
    if (now > session.expiresAt) {
      // Delete expired session
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        message: "Session expired. Please log in again.",
        sessionExpired: true
      });
    }

    // Check if last activity was more than 15 minutes ago
    const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      // Delete inactive session
      await Session.deleteOne({ _id: session._id });
      return res.status(401).json({
        message: "Session expired due to inactivity.",
        sessionExpired: true
      });
    }

    // Update last activity and expiry time
    session.lastActivity = now;
    session.expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);
    await session.save();

    next();
  } catch (error) {
    console.error("Session check error:", error);
    return res.status(500).json({
      message: "Internal server error during session validation"
    });
  }
};

/**
 * Get remaining session time for a user
 */
export const getSessionTimeRemaining = async (token: string): Promise<number | null> => {
  try {
    const session = await Session.findOne({ token });

    if (!session) {
      return null;
    }

    const now = new Date();
    const timeRemaining = session.expiresAt.getTime() - now.getTime();

    return timeRemaining > 0 ? timeRemaining : 0;
  } catch (error) {
    console.error("Error getting session time:", error);
    return null;
  }
};
