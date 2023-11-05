const admincollection = require("../../model/admindetails");
const usercollection = require("../../model/userdetails");
const productcollection = require("../../model/productdetails");
const categorycollection = require("../../model/categorydetails");
const ordercollection = require("../../model/orderdetails")
const sharp = require('sharp');
const fs = require('fs');

const pdfDoc= require('pdfkit')
const { v4: uuidv4 } = require("uuid");
const multer = require('multer');
const { log } = require("console");





// admin login page
const loadadminlogin = async (req, res) => {
    res.render("adminlogin");

}

// validation admin
const adminvalidation = async (req, res) => {
    try {

        const check = await admincollection.findOne({ email: req.body.email });

        if (check.password == req.body.password && check.email == req.body.email) {
            
            req.session.email = req.body.email;

            res.redirect("/admindashboard")
        }
        else {
            res.redirect("/adminlogin", { msg: "Invalid credential" })
        }
    }
    catch (err) {
        res.render("adminlogin", { msg: "Invalid credential" })
    }

}

const admindashboard=async(req,res)=>{
    const product=await productcollection.find().count()
    const orders = await ordercollection.find().count()
    const users = await usercollection.find().count()
    const category= await categorycollection.find().count()

    const delivered= await ordercollection.countDocuments({'orderstatus':'Delivered'}).count()
    const placed= await ordercollection.countDocuments({'orderstatus':'Placed'}).count()
    const cancel= await ordercollection.countDocuments({'orderstatus':'Cancelled'}).count()


   

    const mobile= await ordercollection.countDocuments({'orderitems.productcategory':'Mobiles'}).count()
    const smartwatch= await ordercollection.countDocuments({'orderitems.productcategory':'Smartwatch'}).count()
    const power= await ordercollection.countDocuments({'orderitems.productcategory':'Powerbank'}).count()
    const ipad= await ordercollection.countDocuments({'orderitems.productcategory':'Ipad'}).count()




    
    res.render('admindashboard',{product,orders,users,category,mobile,smartwatch,power,ipad,delivered,placed,cancel})
}

// user data 
const usermanagement = async (req, res) => {

    if (req.session) {
        const data = await usercollection.find()

        res.render('usermanagement', { data })
    }
    else {
        res.redirect("/adminlogin")
    }
}


const report=async(req,res)=>{
   
    const orders = await ordercollection.find({}).sort({$natural:-1})
    const order= await ordercollection.find()
    
  
    res.render('report',{orders,order})
}



const generatepdf = async (req, res) => {
    try {
      let orders = await ordercollection.find()
  
      const doc = new pdfDoc({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=Report.pdf');
      doc.pipe(res);
      doc.pipe(fs.createWriteStream('Report.pdf'));
      doc.fontSize(12).text('Report ', { align: 'center' });
      doc.text('--------------------------');
  
      for (let i = 0; i < orders.length; i++) {
        doc.text(`Order Id: ${orders[i].orderid}`);
        doc.text(`Purchase Email: ${orders[i].email}`);
        doc.text(`Total Amount: ${orders[i].total}`);
        doc.text(`Date of Delivery: ${orders[i].deliverydate}`);
        doc.text(`Payment Method: ${orders[i].paymentmethod}`);

  
        if (orders[i].orderstatus === 'Delivered') {
          doc.text('Order Status: Delivered');
          // Handle the 'Delivered' status case
          // ...
        } else {
          doc.text(`Order Status: ${orders[i].orderstatus}`);
          // Handle other statuses
          // ...
        }
  
        doc.text('--------------------------');
        doc.text(' ');
        doc.text(' ');
      }
  
      doc.end();
      console.log('PDF report generated successfully.');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error generating the PDF report');
    }
  };
  
  
const moreinfo=async(req,res)=>{
    const email=req.query.email
    const data=await usercollection.find({email:email})
    
    res.render('userinfo',{data})
    
}


// block user

const userblock = async (req, res) => {
    const userdata = await usercollection.findOne({ email: req.query.email })
    const data = await usercollection.find()
    if (userdata.isblocked) {
        await usercollection.updateOne({ email: req.query.email }, { $set: { isblocked: false } })
    }
    else {
        await usercollection.updateOne({ email: req.query.email }, { $set: { isblocked: true } })
    }
    res.redirect("/usermanagement")

}

// products 
const productsmanagement = async (req, res) => {
    if (req.session) {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.pagesize) || 5;
        const skip = (page - 1) * limit;
          const data = await productcollection.find({}).skip(skip).limit(limit);
          let countpages = Math.ceil(data.length / limit);
        // const data = await productcollection.find()

        res.render('productsmanagement', { data,page,limit,countpages})
    } else {
        res.redirect("/adminlogin")
    }
}

// search user
const searchuser = async (req, res) => {
    try {
        const searchName = req.body.search;
        const data = await usercollection.find({
            $or: [
                { email: { $regex: '^' + searchName, $options: 'i' } }
            ]
        });


        if (data == "") {
            res.render("usermanagement", { message: "searched user  doesnot exist", data: data })

        }
        else {
            res.render("usermanagement", { data })
        }

    }
    catch (err) {
        console.log(err, "item does not exist");
    }
}

//  category

const category = async (req, res) => {
    try {
        if (req.session) {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.pagesize) || 10;
            const skip = (page - 1) * limit;
              const data = await categorycollection.find({}).skip(skip).limit(limit);
              let countpages = Math.ceil(data.length / limit);
            // const data = await categorycollection.find()

            res.render('productcategory', { data,page,limit,countpages })
        }
    }
    catch (err) {
        console.log("Error in loading category tb", err);
    }

}


// search category
const searchcategory = async (req, res) => {
    try {
        const searchName = req.body.search;
        const data = await categorycollection.find({
            $or: [
                { categoryname: { $regex: '^' + searchName, $options: 'i' } }
            ]
        });


        if (data == "") {
            res.render("productcategory", { message: "The searched category does not exist", data: data });

        }
        else {
            res.render("productcategory", { data })
        }

    }
    catch (err) {
        console.log(err, "item does not exist");
    }
}

// search product
const searchproduct = async (req, res) => {
    try {
        const searchName = req.body.search;
        const data = await productcollection.find({
            $or: [
                { productname: { $regex: '^' + searchName, $options: 'i' } }
            ]
        });


        if (data == "") {
            res.render("productsmanagement", { message: "The searched product does not exist", data: data });

        }
        else {
            res.render("productsmanagement", { data })
        }

    }
    catch (err) {
        console.log(err, "item does not exist");
    }
}

// search order
const searchorder = async (req, res) => {
    try {
        const searchName = req.body.search;
        const orders = await ordercollection.find({
            $or: [
                { email: { $regex: '^' + searchName } }
            ]
        });


        if (orders == "") {
            res.render("orders", { message: "No orders in this email address", orders: orders });

        }
        else {
            res.render("orders", { orders })
        }

    }
    catch (err) {
        console.log(err, "item does not exist");
    }
}

// category add page

const addcategory = async (req, res) => {
    res.render("addcategory")
}

// add new category
const addnewcategory = async (req, res) => {
    try {
        const categoryName = req.body.categoryname;

        // Check if a category with the exact name exists (case-sensitive)
        const checkCategory = await categorycollection.findOne({
            categoryname: { $regex: `^${categoryName}$`, $options: 'i' }, // Use case-sensitive regex
        });

        if (checkCategory) {
            res.render('addcategory', { errorMessage: 'Category already exists.' });
        } else {

            const data1 = {
                categoryid: uuidv4(),
                categoryname: categoryName,
                categorydescription: req.body.categorydescription,
                categoryimage: req.file.filename,
            };
            const data = await categorycollection.find()
            await categorycollection.insertMany([data1])
            res.render('productcategory', { data, msg: 'New category added' })
        }
    } catch (err) {
        console.error('Error adding category:', err);

    }
};

// edit category

const categoryedit = async (req, res) => {
    try {
        const olddata = await categorycollection.findOne({ categoryid: req.query.data })
        res.render('editcategory', { olddata })


    }
    catch (err) {
        console.log(err);
    }

}

// category data edited

const categoryedited = async (req, res) => {
    try {

        const id = req.body.categoryid;


        const data = {
            categoryname: req.body.categoryname,
            categorydescription: req.body.categorydescription,
            categoryimage: req.file.filename


        }



        await categorycollection.updateOne({ categoryid: id }, { $set: data });
        res.redirect("/category")


    }
    catch (err) {
        console.log(err, "error editing user");
    }
}

// add product page

const addproduct = async (req, res) => {
   
    const categoryname = await categorycollection.find({}, { categoryname: 1, _id: 0 })

    res.render("addproduct", { categoryname })
}

// add new product

const addnewproduct = async (req, res) => {
    try {
        const checkproduct = await productcollection.findOne({ productname: req.body.productname })

        const mainimagefile = req.files['productImage'][0].path;
        // crop the main image
        const croppedMainImage = await sharp(mainimagefile)
            .resize(500, 500, {
                fit: 'cover',
                position: 'top'
            })
            .toBuffer();

            
        //  save the cropped image
        const mainimagefilename = `cropped-${req.files['productImage'][0].filename}`;
        await sharp(croppedMainImage)
            .toFile(`asset/uploads/${mainimagefilename}`);

        const filename = req.files['productImage'].map((file) => file.filename)



        if (checkproduct && req.body.productprice < 0) {

            res.render('productsmanagement')

        }

        else {

            const data1 = {
                productid: uuidv4(),
                productname: req.body.productname,
                productprice: req.body.productprice,
                stock: req.body.stock,
                productdescription: req.body.productdescription,
                productcategory: req.body.categoryname,
                productimage: filename,


            }

            await productcollection.insertMany([data1])
            const data = await productcollection.find()

            res.render("productsmanagement", { data, msg: "New product is added" })

        }
    }
    catch (err) {
        console.log(err, "error adding product");
    }
}

const list=async(req,res)=>{
    try{
    const id=req.query.id
    const product = await productcollection.findOne({productid:id});
    const list=product.list
    if(list){
    await productcollection.updateOne(
        { productid: id },
        { $set: { list: false } }
    );
}else{
    await productcollection.updateOne(
        { productid: id },
        { $set: { list:true } }
    );
}
    
    res.redirect("/productsmanagement")
}


catch(err){
    console.log(err);
}
}
// edit the product

const productedit = async (req, res) => {
    try {
        const olddata = await productcollection.findOne({ productid: req.query.data })
        const categoryname = await categorycollection.find({}, { categoryname: 1, _id: 0 })

        res.render('productedit', { olddata, categoryname })


    }
    catch (err) {
        console.log(err);
    }

}


// delete image
const deleteimage = async (req, res) => {

    await productcollection.updateOne({ productid: req.query.id }, { $pull: { productimage: req.query.data } })
    res.redirect('/productsmanagement')
}

// product edit details

const productedited = async (req, res) => {
    try {
        const productId = req.body.productid; // Assuming you have a product ID

        // Fetch the existing product data
        const existingProduct = await productcollection.findOne({ productid: productId });

        const data = {
            productname: req.body.productname,
            productprice: req.body.productprice,
            stock: req.body.stock,
            productdescription: req.body.productdescription,
            productcategory: req.body.productcategory,
        };

        // Check if a new image is being uploaded
        if (req.files && req.files['productImage'] && req.files['productImage'].length > 0) {
            data.productimage = req.files['productImage'].map((f) => f.filename);
        } else {
            // If no new image is uploaded, retain the existing image
            data.productimage = existingProduct.productimage;
        }

        // Update the product in the database
        await productcollection.updateOne({ productid: productId }, { $set: data });
        res.redirect("/productsmanagement");
    } catch (err) {
        console.log(err, "error editing product");
    }
};

// order management

const ordermanagement = async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.pagesize) || 10;
      const skip = (page - 1) * limit;
      const orders = await ordercollection.find({}).sort({$natural:-1}).skip(skip).limit(limit);
      let countpages = Math.ceil(orders.length / limit);

        // const orders = await ordercollection.find({})

        res.render('orders', { orders,page,limit,countpages })
    }
    catch (err) {
        console.log(err)
    }
}

// edit order
const orderedit = async (req, res) => {
    try {

        const order = await ordercollection.findOne({ orderid: req.query.id })
        res.render('orderedit', { order })

    }
    catch (err) {
        console.log('error editing product', err);
    }
}


// order data updated
const orderedited = async (req, res) => {

    try {


        const data = {
            orderstatus: req.body.orderstatus,
            deliverydate: req.body.deliverydate,
            paymentmethod: req.body.paymentmethod

        };



        // Update the product in the database
        await ordercollection.updateOne({ orderid: req.body.orderid }, { $set: data });
        res.redirect("/ordermanagement");
    } catch (err) {
        console.log(err, "error editing order");
    }
}







// logout for admin
const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                res.send('Error');
            } else {
                res.redirect('/adminlogin');
            }
        });
    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    loadadminlogin,
    admindashboard,
    report,
    generatepdf,
    usermanagement,
    moreinfo,
    userblock,
    adminvalidation,
    productsmanagement,
    list,
    addproduct,
    searchuser,
    searchcategory,
    searchproduct,
    searchorder,
    addnewproduct,
    productedit,
    productedited,
    deleteimage,
    category,
    addcategory,
    addnewcategory,
    ordermanagement,
    orderedit,
    orderedited,
    categoryedit,
    categoryedited,
    logout

}