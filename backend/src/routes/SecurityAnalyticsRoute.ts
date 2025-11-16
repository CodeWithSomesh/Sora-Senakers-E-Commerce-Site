import express from "express";
import {
  trackFailedLogin,
  trackAdminAction,
  detectSuspiciousActivity,
  getSecurityDashboard,
  resolveSecurityAlert,
} from "../controllers/SecurityAnalyticsController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// Track failed login attempt (public - no auth required)
router.post("/failed-login", trackFailedLogin);

// Track admin action (requires auth)
router.post("/admin-action", jwtCheck, jwtParse, trackAdminAction);

// Detect suspicious activity (requires auth)
router.post("/suspicious-activity", jwtCheck, jwtParse, detectSuspiciousActivity);

// Get security dashboard data (admin only)
router.get("/dashboard", jwtCheck, jwtParse, getSecurityDashboard);

// Resolve security alert (admin only)
router.patch("/alert/:alertId/resolve", jwtCheck, jwtParse, resolveSecurityAlert);

export default router;
