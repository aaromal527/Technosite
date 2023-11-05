const express=require("express")
require("dotenv").config();
const path=require("path")
const session=require("express-session");
const mongoose=require("mongoose")
const{v4:uuidv4}=require("uuid");
const userroute = require("./routes/userroute");
const adminroute=require("./routes/adminroute")






// app
const app=express();

const port=process.env.PORT ||3000;

app.set('view engine','ejs');
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log("MongoDB connected..."))
    .catch(() => console.log("MongoDB failed to connect"));

app.use('/static',express.static(path.join(__dirname,'assets')))
// middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))







app.use('/',userroute)
app.use('/',adminroute)



app.listen(port, () => {
    console.log("Listening to the server on http://localhost:999");
});