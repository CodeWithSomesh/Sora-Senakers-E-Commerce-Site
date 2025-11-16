import { Request, Response } from "express";
import Product from "../models/product";
import cloudinary from "cloudinary";
import mongoose from "mongoose";

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

        // Find and delete the product by its ID
        const product = await Product.findByIdAndDelete(productId);

        // Check if the product was found and deleted
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
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

    } catch(error) {
        console.log("error", error);
        res.status(500).json
    }
}

const uploadImage = async (file: Express.Multer.File) =>{
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
}


export default {
    // getMyShop,
    createProduct,
    getAllProducts,
    deleteProduct,
    updateProduct,
}