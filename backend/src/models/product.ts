import mongoose from "mongoose";


const productSchema = new mongoose.Schema({
    // ref is creating a link between the "user"model and the "product"model
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    //when we want to store productName in db, productName has to be in string and has to have a value
    productName: { type: String, required: true },
    productCode: { type: String, required: true },
    productPrice: { type: String, required: true },
    productStock: { type: String, required: true },
    productCategory: { type: String, required: true },
    productSizes: [{ type: String, required: true }],
    productDescription: { type: String, required: true },
    productTags: { type: String, required: true },
    productImages: [ { type: String, required: true} ],
    productCreatedAt: { type: Date, required: true},
});

const Product = mongoose.model("Product", productSchema);
export default Product;