const mongoose = require("mongoose");

const ProductQuerySchema = new mongoose.Schema(
    {
        UserId: { type: String, required: [true, "Please Enter UserId"] },
        Product_Name: { type: String, required: [true, "Please Enter Product Name"] },
        Product_Category: { type: String, require: true },
        Product_Price: { type: Number, require: true },
        Product_description: { type: String, require: true },
        Product_Features: { type: String, require: true },
        Quntity: { type: Number, require: true },
        date: { type: Date, default: Date.now },
    }
);
const ProductQuery = mongoose.model('ProductQuery', ProductQuerySchema)

module.exports = ProductQuery;
