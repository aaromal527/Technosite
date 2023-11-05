const usercollection = require("../model/userdetails");



const isblocked=async (req,res,next)=>{
    try{
        const check= await usercollection.findOne({email:req.session.email||req.body.email})
        if(check.isblocked){
            return res.status(500).send("User is Blocked");
        }else{
            next();
        }
    }
    catch(err){
        console.log("Err in block",err);
    }
    
}


const islogin = async (req,res,next)=>{
    if(req.session.email){
        res.redirect('/');
    }
        
    else{
        next();
    }
       
}
 const islogout = async (req,res,next)=>{
    if(req.session.email)
        next()
    else
        res.redirect('/loginuser');
}

module.exports= {
    isblocked,
    islogin,
    islogout
    
}