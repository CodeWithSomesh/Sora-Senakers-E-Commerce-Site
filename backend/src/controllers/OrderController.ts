import { Request, Response } from "express";
import Order from "../models/order";
import mongoose from "mongoose";
import Product from "../models/product";

const createOrder = async ( req: Request, res: Response) => {
    try {
        const { userId, productId, productPrice, numOfItems, totalPrice } = req.body;
    
        // Create a new order
        const newOrder = new Order({
          user: userId,
          product: productId,
          productPrice,
          numOfItems,
          totalPrice,
          orderCreatedAt: new Date(),
        });
    
        // Save the order to the database
        await newOrder.save();
    
        // Find the product and update the stock
        const product = await Product.findById(productId);
    
        if (product) {
          const updatedStock = parseInt(product.productStock) - parseInt(numOfItems);
    
          if (updatedStock < 0) {
            return res.status(400).json({ message: 'Not enough stock available' });
          }
    
          product.productStock = updatedStock.toString();
    
          // Save the updated product to the database
          await product.save();
        } else {
          return res.status(404).json({ message: 'Product not found' });
        }
    
        res.status(201).json(newOrder);
      } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
      }
};

const getAllOrders =  async ( req: Request, res: Response) => {
   try {
        const allOrders = await Order.find().populate('user').populate('product').maxTimeMS(30000) // Set timeout to 30 seconds
        res.status(200).json(allOrders); 
   } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
   }
}

export default {
    // getMyShop,
    createOrder,
    getAllOrders,
}