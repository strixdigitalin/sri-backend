const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        UserId: { type: String, required: [true, "Please Enter UserId"] },
        Product_Name: { type: String, required: [true, "Please Enter Product Name"] },
        Product_Image: { type: String, require: true },
        Product_Category: { type: String, require: true },
        Product_Price: { type: Number, require: true },
        Color: { type: String, require: true },
        Warrenty: { type: Number, require: true },
        Brand: { type: String, require: true },
        Model_name: { type: String, require: true },
        Country_of_origin: { type: String, require: true },
        Product_description: { type: String, require: true },
        Product_Features: { type: String, require: true },
        Available_color: { type: [String], require: true },
        Quntity: { type: Number, require: true },
        About_the_company: { type: String, require: true },
        IsApproved: { type: Boolean, default: false },
        date: { type: Date, default: Date.now },
    }
);
const Product = mongoose.model('Product', ProductSchema)

module.exports = Product;
