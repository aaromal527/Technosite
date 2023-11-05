const express=require("express");
const session=require("express-session");
const {v4:uuidv4} = require('uuid')
const userroute=express()
const usercontrol=require("../controller/user/user")
const userauth=require("../middleware/userauth")

userroute.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true
}));
userroute.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});


userroute.set('view engine','ejs');
userroute.set('views','./views/user');
// user sign up
userroute.get('/usersignup',usercontrol.loadusersignup)
userroute.post('/usersignup',usercontrol.register)
userroute.get('/otp',usercontrol.loadotp)
userroute.post('/otp',usercontrol.otpVerification)

// login validation  
userroute.get('/loginuser', userauth.islogin, usercontrol.loadlogin)
userroute.post('/loginuser', usercontrol.loginvalidation)

// landing page
userroute.get('/', userauth.islogout, usercontrol.landing)

// search
userroute.post('/search',usercontrol.search)

// page without session 
userroute.get('/techno',usercontrol.techno)

// products page 
userroute.get('/allproduct',userauth.islogout,usercontrol.allproduct)
userroute.post('/productsfilter',usercontrol.productsfilter)
userroute.get('/product',userauth.islogout,usercontrol.product)

// category 
userroute.get('/allcategory',userauth.islogout,usercontrol.allcategory)



// cart 
userroute.get('/cart',userauth.islogout,usercontrol.cart)
userroute.get('/addtocart',userauth.islogout,usercontrol.addtocart)
userroute.get('/increasequantity',userauth.islogout,usercontrol.increasequantity)
userroute.get('/decreasequantity',userauth.islogout,usercontrol.decreasequantity)
userroute.get('/deletecart',userauth.islogout,usercontrol.deletecart)

// check out 
userroute.get('/checkout',userauth.islogout,usercontrol.checkout)

// order page 
userroute.post('/createorder',usercontrol.createorder)
userroute.get('/address',userauth.islogout,usercontrol.address)
userroute.post('/address',usercontrol.addressinput)
userroute.get('/ordersuccess',userauth.islogout,usercontrol.ordersuccess)
userroute.get('/ordercancel',userauth.islogout,usercontrol.ordercancel)
userroute.get('/orderreturn',userauth.islogout,usercontrol.orderreturn)

userroute.post('/verifyorder',usercontrol.verifyorder)

// log out 
userroute.get("/logout",userauth.islogout ,usercontrol.logout)


module.exports=userroute;   