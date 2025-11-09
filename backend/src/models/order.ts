import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({
    // ref is creating a link between the "user"model and the "product"model
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product"},
    //when we want to store productName in db, productName has to be in string and has to have a value
    productPrice: { type: String, required: true },
    numOfItems: { type: String, required: true },
    totalPrice: { type: String, required: true },
    orderCreatedAt: { type: Date, required: true},
});

const Order = mongoose.model("Order", orderSchema);
export default Order;