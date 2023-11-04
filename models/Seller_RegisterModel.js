const mongoose =require('mongoose');


const Seller_RegisterSchema =mongoose.Schema(
    {
        Name :{type :String,required :[true,"please enter User Name"]},
        Profile_Image:{ type: String, require: true},
        Address:{ type: String, require: true},
        password :{type :String,required:true,},
        Primary_Number: { type: Number, require: true },
        Alternative_Number: { type: Number, require: true },
        Primary_Email :{ type: String, required: true, unique: true}, 
        Alternative_Email :{ type: String, require: true}, 
        Company_Name:{ type: String, require: true},
        Company_Website:{ type: String, require: true},
        Gstin: { type: Number, require: true },
        Pan_Number: { type: Number, require: true },
        token: { type: String },
        date :{type:Date,default:Date.now},

    }
);


const Seller_Register =mongoose.model('Seller_Register',Seller_RegisterSchema)

module.exports = Seller_Register;