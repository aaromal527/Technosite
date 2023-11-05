const mongoose=require("mongoose");

const orderdetails= new mongoose.Schema({
    
       
    

    orderid:{
        type : String,
        required : true
    },
    email:{
        type:String,
        required:true
    },
    orderitems:[
        {
            productid:{
                type:String
            },
            productname:{
                type:String
            },
            productprice:{
                type:Number
            },
            productimage:{
                type:String
            },
            productquantity:{
                type:Number,
            },
            productcategory:{
                type:String
            }

        }
    ],
    orderstatus:{
        type:String,
        required:true,
        default:"Placed"
    },
    total:{
        type:Number,
        required:true
    },
    purchasedate:{
        type:Date,
        default:new Date,
        required:true
    },
    deliverydate: {
        type: Date,
        default: function() {
            // adding 10 days to the purchase date
            const deliveryDate = new Date(this.purchasedate);
            deliveryDate.setDate(deliveryDate.getDate() + 10);
            return deliveryDate;
        },
        required: true
    },
    deliveryaddress:{
        type:Object,
        required:true
    },
    paymentmethod:{
        type:String,
        required:true
    }
    
});
const ordercollection= new mongoose.model("orderdetails",orderdetails)

module.exports=ordercollection;