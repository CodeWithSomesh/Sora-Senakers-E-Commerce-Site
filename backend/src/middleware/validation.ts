import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const handleValidationErrors = async (
    req:Request, 
    res: Response, 
    next: NextFunction
) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

export const validateMyUserRequest = [
    /* it's going to check the body for the request of name field, check if it's a string, check if it's not empty, if all validation fails.it will pop out the message*/
    body("name").isString().notEmpty().withMessage("Name must be a string"),
    body("addressLine1")
        .isString()
        .notEmpty()
        .withMessage("AddressLine1 must be a string"),
    body("city").isString().notEmpty().withMessage("City must be a string"),
    body("country").isString().notEmpty().withMessage("Country must be a string"),
    handleValidationErrors,
];

export const validateMyShopRequest = [
    body("shopName").notEmpty().withMessage("Shop name is required"),
    body("color").notEmpty().withMessage("Color name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price name is required and must be a positive number"),
    body("category").isArray().withMessage("Category must be an array").not().isEmpty().withMessage("Category array cannot be empty"),
    body("sizeStock").isArray().withMessage("Category must be an array"),
    body("sizeStock.*.size").notEmpty().withMessage("Size name is required"),
    body("sizeStock.*.stock").notEmpty().withMessage("Stock name is required"),
    handleValidationErrors,
];