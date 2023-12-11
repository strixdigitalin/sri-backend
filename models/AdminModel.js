const mongoose =require('mongoose');


const AdminSchema =mongoose.Schema(
    {
        Name :{type :String,required :[true,"please enter User Name"]},
        Primary_Email :{ type: String, required: true, unique: true}, 
        password :{type :String,required:true,},
        active :{ type: Boolean, default:true },
        token: { type: String },
    }
);


const Admin =mongoose.model('Admin',AdminSchema)

module.exports = Admin;