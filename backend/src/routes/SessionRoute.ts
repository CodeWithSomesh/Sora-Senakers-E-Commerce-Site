import express from "express";
import {
  createOrUpdateSession,
  keepAlive,
  getSessionStatus,
  destroySession,
  destroyAllUserSessions,
} from "../controllers/SessionController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// Create or update session
router.post("/", createOrUpdateSession);

// Keep session alive (refresh timeout)
router.post("/keep-alive", jwtCheck, keepAlive);

// Get session status
router.get("/status", jwtCheck, getSessionStatus);

// Destroy current session (logout)
router.delete("/", jwtCheck, destroySession);

// Destroy all sessions for a user (admin only or user's own sessions)
router.delete("/user/:userId", jwtCheck, jwtParse, destroyAllUserSessions);

export default router;
