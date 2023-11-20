const mongoose = require("mongoose");

const Product_checked = new mongoose.Schema(
    {
        UserId:{ type: String, required: true},
        ProductId:{ type: String, required: true},
        date :{type:Date,default:Date.now},
    }
);
const Product_check =mongoose.model('Product_checked',Product_checked)

module.exports = Product_check;
