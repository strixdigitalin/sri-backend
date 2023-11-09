const mongoose = require("mongoose");

const EnquireSchema = new mongoose.Schema(
    {
        UserId:{ type: String, required: true},
        ProductId:{ type: String, required: true},
        Description :{type :String,required :[true,"Please Enter Description"]},
        Quantity:{ type: Number, require: true},
        Price_expected:{type:Number,require:true},
        date :{type:Date,default:Date.now},
    }
);
const Enquire =mongoose.model('Enquire',EnquireSchema)

module.exports = Enquire;
