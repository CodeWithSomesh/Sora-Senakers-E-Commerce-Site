import express from "express";
import AdminUserController from "../controllers/AdminUserController";
import { jwtCheck, jwtParse } from "../middleware/auth";

const router = express.Router();

// /api/admin/users
router.get("/", jwtCheck, jwtParse, AdminUserController.getAllUsers);
router.put("/:userId/promote", jwtCheck, jwtParse, AdminUserController.promoteToAdmin);
router.put("/:userId/demote", jwtCheck, jwtParse, AdminUserController.demoteToUser);
router.put("/:userId/deactivate", jwtCheck, jwtParse, AdminUserController.deactivateAccount);
router.put("/:userId/activate", jwtCheck, jwtParse, AdminUserController.activateAccount);
router.put("/:userId/block", jwtCheck, jwtParse, AdminUserController.blockAccount);
router.put("/:userId/unblock", jwtCheck, jwtParse, AdminUserController.unblockAccount);

// Check if user is blocked (public endpoint - called by Auth0 Action)
router.get("/check-block-status", AdminUserController.checkBlockStatus);

export default router;
