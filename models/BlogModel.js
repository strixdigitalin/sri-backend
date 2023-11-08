const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
    {
        User_id:{ type: String, required: true},
        Blog_Title :{type :String,required :[true,"Please Enter Blog Title"]},
        Author_Name:{ type: String, require: true},
        Blog_Content:{type:String,require:true},
        Blog_Image:{type:String,require:true},
        date :{type:Date,default:Date.now},
    }
);
const Blogs =mongoose.model('Blogs',BlogSchema)

module.exports = Blogs;
