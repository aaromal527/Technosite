
const mongoose=require("mongoose");

const userdetails= new mongoose.Schema({
     
      username:{
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
      phonenumber:{
        type:Number,
        required:true

      },
      wishlist:[{
        productname:{
          type:String,
          required:true
        },
        productquantity:{
          type:Number,
          default:1
        },
        productprice:{
          type:Number,
          required:true
        },
        productimage:{
          type:String,
          required:true
        },
        productid:{
          type:String,
          required:true
        }
      }],

      cart:[{
        productname:{
          type:String,
          required:true
        },
        productquantity:{
          type:Number,
          default:1
        },
        productprice:{
          type:Number,
          required:true
        },
        productimage:{
          type:String,
          required:true
        },
        productid:{
          type:String,
          required:true
        },
        productcategory:{
          type:String
        }
      }],

      address:[{
        name:{
            type:String
        },
        mobile:{
            type: Number
        },
        housenumber:{
            type:String
        },
        area:{
            type:String
        },
        city:{
            type:String
        },
        pincode:{
            type:Number
        },
        state:{
            type:String
        }
    }],
   
      isblocked:{
        type:Boolean,
        default:false
      },
      isverified:{
        type:Boolean,
        default:false
      }


    }
)
const usercollection = new mongoose.model("userdetails",userdetails)
module.exports= usercollection;