//deals with the product routes for logged in user
import express from "express";
import multer from "multer";
import OrderController from "../controllers/OrderController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateMyShopRequest } from "../middleware/validation";

const router = express.Router();
const app = express()

//GET /api/my/shop
router.get("/", OrderController.getAllOrders)


router.post("/", OrderController.createOrder)

export default router;