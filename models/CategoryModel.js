const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
    {
        Category_Name :{type :String,required :[true,"Please Enter Category Name"]},
        Category_Image:{ type: String, require: true},
        date :{type:Date,default:Date.now},
    }
);
const Category =mongoose.model('Category',CategorySchema)

module.exports = Category;
