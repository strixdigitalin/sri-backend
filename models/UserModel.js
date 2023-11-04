const mongoose =require('mongoose');


const UserSchema =mongoose.Schema(
    {
        Name :{type :String,required :[true,"please enter User Name"]},
        Profile_Image:{ type: String, require: true},
        Address:{ type: String, require: true},
        password :{type :String,required:true,},
        Primary_Number: { type: Number, require:true},
        Alternative_Number: { type: Number, require: true },
        Primary_Email :{ type: String, required: true, unique: true}, 
        Alternative_Email :{ type: String, require: true},
        token: { type: String },
        date :{type:Date,default:Date.now},

    }
)

const UserModel =mongoose.model('UserModel',UserSchema)

module.exports = UserModel;
