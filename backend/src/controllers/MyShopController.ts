
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
import { Request, Response } from "express";
import Product from "../models/product";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import crypto from "crypto";

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
// Ensure ENCRYPTION_KEY is always a Buffer of correct length (32 bytes for AES-256)
const getEncryptionKey = (): Buffer => {
    if (process.env.IMAGE_ENCRYPTION_KEY) {
        return Buffer.from(process.env.IMAGE_ENCRYPTION_KEY, 'hex');
    }
    console.warn('⚠️ IMAGE_ENCRYPTION_KEY not set in .env - using random key (NOT RECOMMENDED FOR PRODUCTION)');
    return crypto.randomBytes(32);
};
const ENCRYPTION_KEY = getEncryptionKey();
const IV_LENGTH = 16;

// Encrypt image buffer
const encryptImage = (buffer: Buffer): { encryptedData: string; iv: string } => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(
        ENCRYPTION_ALGORITHM,
        ENCRYPTION_KEY as any,
        iv as any
    );
    
    const encrypted = Buffer.concat([
        cipher.update(buffer as any),
        cipher.final()
    ] as any) as Buffer;
    
    return {
        encryptedData: encrypted.toString('base64'),
        iv: iv.toString('hex')
    };
};

// Decrypt image (for retrieval)
const decryptImage = (encryptedData: string, ivHex: string): Buffer => {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        ENCRYPTION_KEY as any,
        iv as any
    );
    
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    const decrypted = Buffer.concat([
        decipher.update(encryptedBuffer as any),
        decipher.final()
    ] as any) as Buffer;
    
    return decrypted;
};

// Upload encrypted image to Cloudinary
const uploadImage = async (file: Express.Multer.File): Promise<{
    url: string;
    iv: string;
    encrypted: boolean;
    publicId: string;
}> => {
    try {
        // Encrypt the image buffer
        const { encryptedData, iv } = encryptImage(file.buffer);
        
        // Convert encrypted data to base64 for upload
        const dataURI = `data:application/octet-stream;base64,${encryptedData}`;
        
        // Upload to Cloudinary with resource_type: 'raw' for encrypted data
        const uploadResponse = await cloudinary.v2.uploader.upload(dataURI, {
            resource_type: 'raw',
            folder: 'encrypted_products',
            tags: ['encrypted', 'product-image']
        });
        
        return {
            url: uploadResponse.secure_url,
            iv: iv,
            encrypted: true,
            publicId: uploadResponse.public_id
        };
    } catch (error) {
        console.error("Error uploading encrypted image:", error);
        throw error;
    }
};

// Upload multiple encrypted images endpoint
const uploadProductImages = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        // Upload all images with encryption
        const uploadPromises = files.map(file => uploadImage(file));
        const uploadedImages = await Promise.all(uploadPromises);
        
        console.log(`✅ Uploaded ${uploadedImages.length} encrypted images to Cloudinary`);
        
        res.status(200).json({ 
            message: "Images uploaded and encrypted successfully",
            images: uploadedImages 
        });
    } catch (error) {
        console.error("Error uploading images:", error);
        res.status(500).json({ message: "Error uploading images" });
    }
};

// Retrieve and decrypt image
const getDecryptedImage = async (req: Request, res: Response) => {
    try {
        const { url, iv } = req.body;
        
        if (!url || !iv) {
            return res.status(400).json({ message: "URL and IV are required" });
        }

        // Fetch encrypted image from Cloudinary
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const encryptedData = Buffer.from(arrayBuffer).toString('base64');
        
        // Decrypt the image
        const decryptedBuffer = decryptImage(encryptedData, iv);
        
        // Send decrypted image back
        res.set('Content-Type', 'image/jpeg'); // Adjust based on actual image type
        res.send(decryptedBuffer);
    } catch (error) {
        console.error("Error decrypting image:", error);
        res.status(500).json({ message: "Error decrypting image" });
    }
};

// Create A New Product in DB
const createProduct = async (req: Request, res: Response) => {
    try {
        const productCode = req.body.productCode;
        
        const existingProduct = await Product.findOne({ productCode: productCode });

        if (existingProduct) {
            return res.status(409).json({ 
                message: "Product with this Product Code already exist" 
            });
        }

        const product = new Product(req.body);
        product.user = new mongoose.Types.ObjectId(req.userId);
        product.productCreatedAt = new Date();
        await product.save();

        res.status(201).send(product);
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Something went wrong in createProduct function" 
        });
    }
};

// Get All Added Products in DB
const getAllProducts = async (req: Request, res: Response) => {
    try {
        const allProducts = await Product.find().maxTimeMS(30000);
        res.json(allProducts);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching products" });
    }
};

// Delete A Product in DB by its ID
const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid Product ID" });
        }

        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete encrypted images from Cloudinary
        if (product.productImages && product.productImages.length > 0) {
            for (const imageData of product.productImages) {
                try {
                    let publicId: string | undefined;
                    
                    // Check if imageData has publicId property (new format)
                    if (imageData && typeof imageData === 'object' && 'publicId' in imageData) {
                        publicId = imageData.publicId;
                    }
                    
                    if (publicId) {
                        await cloudinary.v2.uploader.destroy(publicId, { 
                            resource_type: 'raw' 
                        });
                        console.log(`✅ Deleted image: ${publicId}`);
                    }
                } catch (err) {
                    console.error('Error deleting image from Cloudinary:', err);
                }
            }
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            message: "Something went wrong in deleteProduct function" 
        });
    }
};

// Update A Product in DB by its ID
const updateProduct = async (req: Request, res: Response) => {
    try {
        const { productId } = req.params;

        const product = await Product.findOne({ _id: productId });

        if (!product) {
            return res.status(404).json({ message: "product not found" });
        }

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
        res.status(200).send(product);
    } catch (error) {
        console.log("error", error);
        res.status(500).json({ message: "Error updating product" });
    }
};

export default {
    createProduct,
    getAllProducts,
    deleteProduct,
    updateProduct,
    uploadProductImages,
    getDecryptedImage,
    uploadImage,
    encryptImage,
    decryptImage
};