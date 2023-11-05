const mongoose=require("mongoose");

const productdetails= new mongoose.Schema({
    
        productid:{
            type:String,
            required:true
        },
        productname:{
            type:String,
            required:true
        },
        productprice:{
            type:Number,
            required:true
        },  
        productdescription:{
            type:String,
            required:true
        },
        productcategory:{
            type:String,
            required:true
        },
        list:{
            type:Boolean,
            default:true 
        },

        stock:{
            type:Number,
            required:true
        },
        productimage:{
            type:[String],
            
        },
        addeddate:{
            type:Date,
            default:Date.now
        }
        
})
const productcollection= new mongoose.model("productdetails",productdetails)

module.exports=productcollection;