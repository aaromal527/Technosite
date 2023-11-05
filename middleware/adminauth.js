const admincollection = require("../model/admindetails");

const islogin = async (req,res,next)=>{
    if(req.session.email){
        res.redirect('/admindashboard');
    }
        
    else{
        next();
    }
       
}
 const islogout = async (req,res,next)=>{
    if(req.session.email)
        next()
    else
        res.redirect('/adminlogin');
}

module.exports= {
    
    islogin,
    islogout
}
