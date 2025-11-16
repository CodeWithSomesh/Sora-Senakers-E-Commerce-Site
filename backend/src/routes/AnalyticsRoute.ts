import express from "express";
import {
  trackEvent,
  getDashboardData,
  getAnalyticsByDateRange,
  cleanupOldEvents,
} from "../controllers/AnalyticsController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// Track an event (open to all authenticated users)
router.post("/track", trackEvent);

// Get dashboard data (admin only - we'll check isAdmin in the frontend)
router.get("/dashboard", jwtCheck, jwtParse, getDashboardData);

// Get analytics by date range (admin only)
router.get("/range", jwtCheck, jwtParse, getAnalyticsByDateRange);

// Cleanup old events (admin only - should be called by cron or manually)
router.delete("/cleanup", jwtCheck, jwtParse, cleanupOldEvents);

export default router;
