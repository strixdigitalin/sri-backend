const mongoose = require("mongoose");

const PopolurCitySchema = new mongoose.Schema(
    {
        City_Name :{type :String,required :[true,"Please Enter Category Name"]},
        City_Image:{ type: String, require: true},
        date :{type:Date,default:Date.now},
    }
);
const CityModel =mongoose.model('City',PopolurCitySchema)

module.exports = CityModel;
