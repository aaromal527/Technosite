const mongoose=require("mongoose");

const admindetails= new mongoose.Schema({
        name:{
        type:String,
        required:true
        },
    
        adminid:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        block:{
            type:Boolean,
            default:false
        }

})
const admincollection= new mongoose.model("admindetails",admindetails)

module.exports=admincollection;