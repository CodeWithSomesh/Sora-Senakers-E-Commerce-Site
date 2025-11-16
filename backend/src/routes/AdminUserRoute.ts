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

export default router;
