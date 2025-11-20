import { Request, Response } from "express";
import Product from "../models/product";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import SecurityLog from "../models/securityLog";
import AdminAction from "../models/adminAction";
import User from "../models/user";

// const getMyShop = async (req: Request, res: Response) => {
//     try {
//         const shop = await Shop.findOne({ user: req.userId });
//         if(!shop) {
//             return res.status(404).json({ message: "shop not found"});
//         }
//         res.json(shop);

//     } catch (error) {
//         console.log("error", error);
//         res.status(500).json({ message: "Error fetching shop"});
//     }
// }

//Create A New Product in DB
const createProduct = async ( req: Request, res: Response) => {
    try {
        //finding
        //console.log(req.body)
        const productCode = req.body.productCode

        const existingProduct = await Product.findOne({ productCode: productCode})

        if(existingProduct) {
            return res.status(409).json({ message: "Product with this Product Code already exist"});
        }


        const product = new Product(req.body);
        console.log(product)
        product.user = new mongoose.Types.ObjectId(req.userId);
        product.productCreatedAt = new Date();
        await product.save();

        // SECURITY TRACKING: Log product addition
        const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || "unknown";
        const userAgent = req.headers['user-agent'] || "unknown";

        // Get admin email from database
        let adminEmail = "Unknown Admin";
        try {
            const admin = await User.findById(req.userId);
            if (admin) adminEmail = admin.email;
        } catch (err) {
            console.error("Failed to fetch admin email:", err);
        }

        try {
            await AdminAction.create({
                adminId: req.userId,
                adminUsername: adminEmail,
                actionType: "product_added",
                targetType: "product",
                targetId: product._id.toString(),
                targetName: product.productName,
                ipAddress,
                userAgent,
                timestamp: new Date(),
                status: "success",
            });

            await SecurityLog.create({
                eventType: "admin_action",
                userId: req.userId,
                username: adminEmail,
                ipAddress,
                userAgent,
                severity: "low",
                details: {
                    actionType: "product_added",
                    targetType: "product",
                    targetId: product._id.toString(),
                    targetName: product.productName,
                },
                timestamp: new Date(),
                resolved: false,
            });
        } catch (trackingError) {
            console.error("Failed to track product addition:", trackingError);
            // Continue even if tracking fails
        }

        res.status(201).send(product);
    } catch(error){
        console.log(error);
        res.status(500).json({ message: "Something went wrong in createProduct function"});
    }
};


//Get All Added Products in DB
const getAllProducts =  async ( req: Request, res: Response) => {
    const allProducts = await Product.find().maxTimeMS(30000) // Set timeout to 30 seconds
    res.json(allProducts); 
}

//Delete A Product in DB by its ID
const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;
        console.log(productId)

        // Check if the product ID is valid
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }

        // Find the product first to get its details for logging
        const product = await Product.findById(productId);

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Store product details before deletion
        const productName = product.productName;
        const productCode = product.productCode;

        // Delete the product
        await Product.findByIdAndDelete(productId);

        // SECURITY TRACKING: Log product deletion (HIGH severity)
        const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || "unknown";
        const userAgent = req.headers['user-agent'] || "unknown";

        // Get admin email from database
        let adminEmail = "Unknown Admin";
        try {
            const admin = await User.findById(req.userId);
            if (admin) adminEmail = admin.email;
        } catch (err) {
            console.error("Failed to fetch admin email:", err);
        }

        try {
            await AdminAction.create({
                adminId: req.userId,
                adminUsername: adminEmail,
                actionType: "product_deleted",
                targetType: "product",
                targetId: productId,
                targetName: productName,
                changes: {
                    productCode: productCode,
                    deletedAt: new Date(),
                },
                ipAddress,
                userAgent,
                timestamp: new Date(),
                status: "success",
            });

            await SecurityLog.create({
                eventType: "admin_action",
                userId: req.userId,
                username: adminEmail,
                ipAddress,
                userAgent,
                severity: "high", // Product deletion is HIGH severity
                details: {
                    actionType: "product_deleted",
                    targetType: "product",
                    targetId: productId,
                    targetName: productName,
                    changes: {
                        productCode: productCode,
                        deletedAt: new Date(),
                    },
                },
                timestamp: new Date(),
                resolved: false,
            });

            console.log(`✅ SECURITY: Product deletion tracked - ${productName} deleted by ${adminEmail}`);
        } catch (trackingError) {
            console.error("❌ Failed to track product deletion:", trackingError);
            // Continue even if tracking fails
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong in deleteProduct function" });
    }
};


//Update A Product in DB by its ID
const updateProduct = async (req: Request, res: Response) => {
    try {
        // console.log(req.body)
        // console.log(req.params)
        const { productId } = req.params;

        const product = await Product.findOne({ _id: productId})
        // console.log(product)

        if(!product) {
            return res.status(404).json({ message: "product not found"});
        }

        // Store old values for change tracking
        const oldValues = {
            productName: product.productName,
            productPrice: product.productPrice,
            productStock: product.productStock,
            productCode: product.productCode,
        };

        product.productName = req.body.productName;
        product.productCode = req.body.productCode;
        product.productPrice = req.body.productPrice;
        product.productStock = req.body.productStock;
        product.productCategory = req.body.productCategory;
        product.productSizes = req.body.productSizes;
        product.productDescription = req.body.productDescription;
        product.productTags = req.body.productTags;
        product.productImages = req.body.productImages;

        await product.save();

        // SECURITY TRACKING: Log product edit (MEDIUM severity)
        const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string) || "unknown";
        const userAgent = req.headers['user-agent'] || "unknown";

        // Get admin email from database
        let adminEmail = "Unknown Admin";
        try {
            const admin = await User.findById(req.userId);
            if (admin) adminEmail = admin.email;
        } catch (err) {
            console.error("Failed to fetch admin email:", err);
        }

        // Track what changed
        const changes: any = {};
        if (oldValues.productName !== product.productName) {
            changes.productName = { old: oldValues.productName, new: product.productName };
        }
        if (oldValues.productPrice !== product.productPrice) {
            changes.productPrice = { old: oldValues.productPrice, new: product.productPrice };
        }
        if (oldValues.productStock !== product.productStock) {
            changes.productStock = { old: oldValues.productStock, new: product.productStock };
        }
        if (oldValues.productCode !== product.productCode) {
            changes.productCode = { old: oldValues.productCode, new: product.productCode };
        }

        try {
            await AdminAction.create({
                adminId: req.userId,
                adminUsername: adminEmail,
                actionType: "product_edited",
                targetType: "product",
                targetId: productId,
                targetName: product.productName,
                changes: changes,
                ipAddress,
                userAgent,
                timestamp: new Date(),
                status: "success",
            });

            await SecurityLog.create({
                eventType: "admin_action",
                userId: req.userId,
                username: adminEmail,
                ipAddress,
                userAgent,
                severity: "medium", // Product edit is MEDIUM severity
                details: {
                    actionType: "product_edited",
                    targetType: "product",
                    targetId: productId,
                    targetName: product.productName,
                    changes: changes,
                },
                timestamp: new Date(),
                resolved: false,
            });

            console.log(`✅ SECURITY: Product edit tracked - ${product.productName} updated by ${adminEmail}`);
        } catch (trackingError) {
            console.error("❌ Failed to track product edit:", trackingError);
            // Continue even if tracking fails
        }

        res.status(200).send(product);

    } catch(error) {
        console.log("error", error);
        res.status(500).json({ message: "Something went wrong in updateProduct function" });
    }
}

// const uploadImage = async (file: Express.Multer.File) =>{
//     const image = file;
//     const base64Image = Buffer.from(image.buffer).toString("base64");
//     const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    
//     const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
//     return uploadResponse.url;
// }


export default {
    // getMyShop,
    createProduct,
    getAllProducts,
    deleteProduct,
    updateProduct,
}