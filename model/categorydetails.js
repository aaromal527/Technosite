const mongoose=require("mongoose");

const categorydetails= new mongoose.Schema({
    
        categoryid:{
            type:String,
            required:true
        },
        categoryname:{
            type:String,
            unique:true,
            collation: { locale: 'en', strength: 2 },
            required:true
        },
        
        categorydescription:{
            type:String,
            required:true
        },
        

        
        categoryimage:{
            type:[String],
            
        }
        

})
const categorycollection= new mongoose.model("categorydetails",categorydetails)

module.exports=categorycollection;