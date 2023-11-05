const express = require("express");
const session = require("express-session");
const {v4:uuidv4} = require('uuid')

const multer = require("multer")
const adminroute = express();
const admincontrol = require("../controller/admin/admin")
const path = require("path")
const adminauth=require("../middleware/adminauth")


adminroute.use(session({
    secret:uuidv4(),
    resave:false,
    saveUninitialized:true
}));

adminroute.use(function(req, res, next) {
    if (!req.user)
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./assets/uploads")
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
})
const fileFilter = function (req, file, cb) {
    const allowedFileTypes = ['.jpeg', '.jpg', '.png', '.svg'];
    const extname = path.extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(extname)) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and SVG files are allowed.'), false); // Reject the file
    }
};
const uploads = multer({ storage, fileFilter })

adminroute.set('view engine', 'ejs');
adminroute.set('views', './views/admin');

// Admin login
adminroute.get('/adminlogin',adminauth.islogin, admincontrol.loadadminlogin)
adminroute.post('/adminlogin', admincontrol.adminvalidation)
adminroute.get('/admindashboard', adminauth.islogout,admincontrol.admindashboard)
adminroute.get('/report',adminauth.islogout,admincontrol.report)
adminroute.post('/generatepdf',admincontrol.generatepdf)
// User management
adminroute.get('/usermanagement',adminauth.islogout, admincontrol.usermanagement)
adminroute.get('/moreinfo',adminauth.islogout,admincontrol.moreinfo)
adminroute.get('/userblock',adminauth.islogout, admincontrol.userblock)

// Product management
adminroute.get('/productsmanagement',adminauth.islogout, admincontrol.productsmanagement)
adminroute.get('/addproduct', adminauth.islogout,admincontrol.addproduct)
adminroute.get('/list',adminauth.islogout,admincontrol.list)
adminroute.post('/addproduct', uploads.fields([
    { name: 'productImage', maxcount: 5 },
]),
    admincontrol.addnewproduct)

adminroute.get('/productedit', admincontrol.productedit)

adminroute.post('/productedit', uploads.fields([
    { name: 'productImage', maxcount: 5 },
]), admincontrol.productedited)
adminroute.get('/delete1', admincontrol.deleteimage)

// Search 
adminroute.post('/searchuser', admincontrol.searchuser)
adminroute.post('/searchcategory', admincontrol.searchcategory)
adminroute.post('/searchproduct', admincontrol.searchproduct)
adminroute.post('/searchorder', admincontrol.searchorder)

// category management
adminroute.get('/category', adminauth.islogout,admincontrol.category)
adminroute.get('/addcategory', adminauth.islogout,admincontrol.addcategory)
adminroute.post('/addcategory', uploads.single('categoryImage'), admincontrol.addnewcategory)
adminroute.get('/editcategory', adminauth.islogout,admincontrol.categoryedit)
adminroute.post('/editcategory', uploads.single('categoryImage'), admincontrol.categoryedited)

// order management
adminroute.get('/ordermanagement',adminauth.islogout, admincontrol.ordermanagement)
adminroute.get('/orderedit', adminauth.islogout,admincontrol.orderedit)
adminroute.post('/orderedited', admincontrol.orderedited)

// log out
adminroute.get('/logout',adminauth.islogout, admincontrol.logout)


module.exports = adminroute;

