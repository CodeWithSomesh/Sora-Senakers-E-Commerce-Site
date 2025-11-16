import express from "express";
import { param } from "express-validator";
import ShopController from "../controllers/ShopController";

//interacting with all the products in here
const router = express.Router();

router.get(
    "/:shopId", 
    param("shopId")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("ShopId parameter must be a valid string"),
        ShopController.getShop
);

router.get(
    "/search/:color", 
    param("color")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Color parameter must be a valid string"),
    ShopController.searchShop
);

export default router;