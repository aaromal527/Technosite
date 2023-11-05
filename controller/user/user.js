const usercollection = require("../../model/userdetails");
const bcrypt = require('bcrypt');
const accountsid = "AC05000ae43e38895f14456e60f757046d"
const authtoken = "d6aecd2e88004c4c4373366fd400c4d2"
const client = require('twilio')(accountsid, authtoken)
const categorycollection = require("../../model/categorydetails")
const productcollection = require("../../model/productdetails")
const ordercollection = require("../../model/orderdetails");
 
const { v4: uuidv4 } = require('uuid');
const session = require("express-session");
let Razorpay = require('razorpay');



const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;



// page without session
const techno = async (req, res) => {
    const category = await categorycollection.find()
    const product = await productcollection.find()

    res.render('techno', { category, product })
}

//load user sign up
const loadusersignup = async (req, res) => {
    res.render('signup');
}

// password encryption

const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    }
    catch (error) {
        res.status(500).send("Something went wrong")
        console.log(error.message)
    }
}


// create new user
const register = async (req, res) => {
    try {

        const checkemail = await usercollection.findOne({ email: req.body.emailinput })

        if (checkemail) {

            res.render('signup', { msg: "Email already exist" })

        }

        else {
            const secure = await securePassword(req.body.password)
            const data = {
                username: req.body.username,
                email: req.body.emailinput,
                password: secure,
                phonenumber: req.body.phonenumber
            }
            await usercollection.insertMany([data])
            req.session.email = req.body.email

            res.redirect("/otp")

        }
    }
    catch (err) {
        console.log(err, "error signing up");
    }
}

// load otp
const loadotp = async (req, res) => {
    let otp = ' ';
    for (let i = 0; i < 4; i++) {
        otp += Math.floor(Math.random() * 10);
    }
    req.session.otp = otp;
    console.log("this is", req.session.otp);
    client.messages.create({
        body: `<#> ${otp} is your E-Mech verification code.`,
        to: '+919995360813', // Text your number
        from: '+16562231519', // From a valid Twilio number
    })
    .then((message) => console.log(message))
    .catch(err => console.log(err));
    res.render('otp');
}

// verify otp

const otpVerification = async (req, res) => {
    try {
        const session = req.session.otp;
        const bodyotp = req.body.otp;
       
        if (req.session.otp.trim() === req.body.otp.trim()) {
          
            await usercollection.updateOne({ email: req.session.email }, { $set: { isverified: true } });
            res.status(200).redirect("/");
        } else {
            res.render('otp', { msg: "Incorrect OTP" })
        }
    }
    catch (err) {
        console.log(err);
    }
}





// load login  page

const loadlogin = async (req, res) => {
    res.render("login");
}




// landing page
const landing = async (req, res) => {
    const category = await categorycollection.find()
    const product = await productcollection.find({list:true})

    res.render("landingpage", { category, product });
}

// all category 

const allcategory = async (req, res) => {


    const product = await productcollection.find({ productcategory: req.query.categoryname })

    res.render('categorymobile', { product })
}
// all products


const allproduct = async (req, res) => {
    const product = await productcollection.find({list:true})
    const category = await categorycollection.find()
    res.render("allproduct", { product, category })
}

// filter products
const productsfilter = async (req, res) => {
    let value = req.body.order;
    let cat = req.body.filter;
 
    let product;
    if (cat == undefined) {
        if (value == 'lowtohigh') {
            product = await productcollection.find({}).sort({ productprice: 1 })


        } else {
            product = await productcollection.find({}).sort({ productprice: -1 })
        }
    }
    else {
        if (value = 'lowtohigh') {
            product = await productcollection.find({ productcategory: cat }).sort({ productprice: 1 })
        } else {
            product = await productcollection.find({ productcategory: cat }).sort({ productprice: -1 })


        }

    }



    const category = await categorycollection.find()
    res.render('allproduct', { product, category })

}


// login validation
const loginvalidation = async (req, res) => {
    try {
        
        const check = await usercollection.findOne({ email: req.body.email });
        
        const pass = req.body.password
        const passwordMatch = await bcrypt.compare(pass, check.password)
        if (passwordMatch && check.email == req.body.email && check.isverified === true) {
            req.session.email = req.body.email;
            res.redirect("/"); 
        } else if (passwordMatch && check.email == req.body.email) {
            // Redirect to "/otp" only if the user is not verified
            if (check.isverified === false) {
                req.session.email = req.body.email;
                res.redirect("/otp");
            } else {
                // Handle the case where the credentials are correct but not verified
                res.render("login", { msg: "Account not verified" });
            }
        } else {
            res.render("login", { msg: "Invalid credential" });
        }
    } catch (err) {
        console.log("error in login", err);
        res.render("login", { msg: "Invalid " });
    }
}





// product 
const product = async (req, res) => {
    const product = await productcollection.find({ productid: req.query.productid })
    res.render('product', { product })
}

// search for products

const search = async (req, res) => {
    try {
        const searchName = req.body.search;
        const searchData = await productcollection.find({
            $or: [
                { productname: { $regex:  new RegExp('^' + searchName, 'i') }}
            ]
        });


        if (searchData == "") {
            res.render("product", { message: "searched item  doesnot exist", product: searchData })

        }
        else {
            res.render("product", { product: searchData })
        }

    }
    catch (err) {
        console.log(err, "item does not exist");
    }
}
//cart page     
const cart = async (req, res) => {
    try {

        const user = await usercollection.findOne({ email: req.session.email });

        const cart = user.cart;

        res.render("cart", { user, cart })
    }
    catch (err) {
        console.log("error loading cart", err);

    }
}


// add items to cart 
const addtocart = async (req, res) => {
    try {


        const product = await productcollection.find({ productid: req.query.productid })
        const user = await usercollection.findOne({ email: req.session.email }, { _id: 1 })
        const checkproduct = await usercollection.findOne({
            email: req.session.email,
            'cart': {
                $elemMatch: { 'productid': req.query.productid }
            }
        });


        if (checkproduct) {
            await usercollection.updateOne(
                { email: req.session.email, 'cart.productid': req.query.productid },
                { $inc: { 'cart.$.productquantity': 1 } }
            );
            res.render('product', { product });
        } else {

            const data = {
                productname: product[0].productname,
                productid: product[0].productid,
                productprice: product[0].productprice,
                productimage: product[0].productimage[0],
                productcategory:product[0].productcategory

            }
           
            

            await usercollection.findByIdAndUpdate(
                user,
                { $push: { cart: data } },
                { new: true } 
            );
            res.render('product', { product });

        }
    }
    catch (err) {
        console.log(err);
    }
}

// cart  quantity

    const increasequantity = async (req, res) => {
    const product=await productcollection.findOne({productid:req.query.data},{stock:1 , _id:0})
    const stock1=product ? product.stock : 0;
    product.stock=stock1
    const value=req.query.value;

    
    if (value<stock1){
    await usercollection.updateOne(
        { email: req.session.email, 'cart.productid': req.query.data },
        { $inc: { 'cart.$.productquantity': 1 } }
    );
    res.redirect('/cart');
    }else{
        res.redirect('/cart')
    }
}

const decreasequantity = async (req, res) => {

    const value=req.query.value;
    if(value>1){
    await usercollection.updateOne(
        { email: req.session.email, 'cart.productid': req.query.data },
        { $inc: { 'cart.$.productquantity': -1 } }
    );
    res.redirect('/cart');
}else{
    res.redirect('/cart')
}
}

// delete item from cart 
const deletecart = async (req, res) => {

    console.log("hiolo");
    const deleteProduct = req.query.delete;
    try {
        await usercollection.findOneAndUpdate({ email: req.session.email }, { $pull: { cart: { productid: deleteProduct } } });
        res.redirect('/cart')
    }
    catch (err) {
        console.log("Error in dlte cart", err);
    }
}


// check out 
const checkout = async (req, res) => {
    try {
        const user = await usercollection.findOne({ email: req.session.email })
        const cart = user.cart
        const address = user.address
        res.render('checkout', {user,cart,address})
    }
    catch (err) {
        console.log(err);
    }
}


// address add page

const address = async (req, res) => {
    try {
        res.render('address')

    }
    catch (error) {
        console.log(error, "error loading address");
    }
}

// input address from checkout 
const addressinput = async (req, res) => {
    try {


        const userEmail = req.session.email;
        const data = {
            name: req.body.name,
            mobile: req.body.mobile,
            housenumber: req.body.housenumber,
            area: req.body.area,
            city: req.body.city,
            pincode: req.body.pincode,
            state: req.body.state
        };

        // Update the user document with the new address data
        const updatedUser = await usercollection.findOneAndUpdate(
            { email: userEmail },
            { $push: { address: data } }, // Add the new address data to the address array
            { new: true } // Return the updated document
        );


        res.redirect("/checkout")
    }
    catch (error) {
        console.log(error, "error");
    }
}

// order data to database
const createorder = async (req, res) => {

    try {
        const user = await usercollection.findOne({ name: req.session.email })
        const product = await usercollection.findOne({ email: req.session.email }, { cart: 1 })
        const address = await usercollection.findOne({ email: req.session.email }, { address: 1 })
        const useraddress = address.address[req.body.address]
        const paymentmethod = req.body.paymentmethod;
        const item = product.cart


        const razorpayInstance = new Razorpay({
            key_id: RAZORPAY_ID_KEY,
            key_secret: RAZORPAY_SECRET_KEY
        });
        
        

        const data = {
            orderid: uuidv4(),
            total: req.body.total,
            email: req.session.email,
            deliveryaddress: useraddress,
            paymentmethod: req.body.paymentmethod,
            orderitems: item

        }


        if (paymentmethod === 'cod') {

            const data = {
                orderid: uuidv4(),
                total: req.body.total,
                email: req.session.email,
                deliveryaddress: useraddress,
                paymentmethod: req.body.paymentmethod,
                orderitems: item

            }
           
            await ordercollection.insertMany([data])
            await usercollection.updateOne({ email: req.session.email }, { $set: { cart: [] } })
            let quantity;
            for (let i = 0; i < item.length; i++) {
                quantity = item[i].productquantity
                await productcollection.updateOne({ productid: item[i].productid }, { $inc: { stock: -quantity } })
    
            }

            // res.redirect('/ordersuccess');
            res.send({paymentmethod:'cod',success:true})
            

        }
        else if(paymentmethod==='online'){   
                
                const amount = req.body.total*100
                
                const options = {
                    amount: amount,
                    currency: 'INR',
                    receipt: 'razorUser@gmail.com'
                }
        
                razorpayInstance.orders.create(options, 
                    (err, order)=>{
                        if(!err){
                            res.status(200).send({
                                success:true,
                                msg:'Order Created',
                                order_id:order.id,
                                amount:amount,
                                key_id:RAZORPAY_ID_KEY,
                                data:data,
                                contact:"9995360813",
                                name: "Aromal Babu",
                                email: "aromalbabu527@gmail.com",
                                paymentmethod:"online"
                            });
                        }
                        else{
                            res.status(400).send({success:false,msg:'Something went wrong!'});
                        }
                    }
                );
        
            
        }
        


    }

    catch (err) {
        console.log(err, "error adding product");
    }
}

 const verifyorder=async(req,res)=>{
    try{
        const product = await usercollection.findOne({ email: req.session.email }, { cart: 1 })
        const item = product.cart
        const data= req.body.data
       
        await ordercollection.insertMany([data])
        await usercollection.updateOne({ email: req.session.email }, { $set: { cart: [] } })
        let quantity;
        for (let i = 0; i < item.length; i++) {
            quantity = item[i].productquantity
            await productcollection.updateOne({ productid: item[i].productid }, { $inc: { stock: -quantity } })

        }
        res.status(200).send({
            success:true,
            msg:'Order Created'
        })



    }catch(err){
        console.log("error in verifying order",err)
    }
 } 


// orderplaced successfully
const ordersuccess = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.pagesize) ||6;
        const skip = (page - 1) * limit;
        const order  = await ordercollection.find({email:req.session.email}).sort({$natural:-1}).skip(skip).limit(limit)
        let countpages = Math.ceil(order.length / limit);
        if (!order) {
         return res.status(404).send('No order found for the provided email.');
        }

        res.render('ordersuccess', { order,page,limit,countpages });
    } catch (error) {
        console.log('Error placing order:', error);
        res.status(500).send('Error placing order');
    }
};

// Order Cancelled
const ordercancel=async(req,res)=>{
    try{
       
        const quantity=req.query.quantity;
        const productid=req.query.productid;
        const orderid=req.query.id;
        const updated='Cancelled';
        await ordercollection.updateOne({orderid:orderid},{$set:{orderstatus:updated}})
        await productcollection.updateOne({productid:productid},{$inc:{stock:quantity}})
        res.redirect('/ordersuccess')

    }
    catch(err){
        console.log(err,'order not cancelled')
    }
} 

const orderreturn=async(req,res)=>{
    try{
       
        const quantity=req.query.quantity;
        const productid=req.query.productid;
        const orderid=req.query.id;
        const updated='Returned';
        await ordercollection.updateOne({orderid:orderid},{$set:{orderstatus:updated}})
        await productcollection.updateOne({productid:productid},{$inc:{stock:quantity}})
        res.redirect('/ordersuccess')

    }
    catch(err){
        console.log(err,'order not cancelled')
    }
} 


// logout session
const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                res.send('Error');
            } else {
                res.redirect('/loginuser');
            }
        });
    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    loadusersignup,
    register,
    loadotp,
    otpVerification,
    loadlogin,
    loginvalidation,
    techno,
    landing,
    search,
    product,
    allproduct,
    allcategory,
    productsfilter,
    addtocart,
    cart,
    increasequantity,
    decreasequantity,
    deletecart,
    checkout,
    createorder,
    address,
    addressinput,
    ordersuccess,
    ordercancel,
    orderreturn,
    verifyorder,
    logout
}