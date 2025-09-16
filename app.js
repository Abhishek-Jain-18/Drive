const dotenv = require('dotenv');
dotenv.config(); // whole application get access to the variables stored in .env
const express = require('express');
const userRouter = require('./routes/user.routes')
const supabase = require('./supabaseClient.cjs') 
const multer = require('multer')  
const cookieParser = require('cookie-parser');
const indexRouter = require('./routes/index.routes')
const connectToDB = require('./config/db');

const app = express();
connectToDB();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true})) //  these statements must be written before using the middlewares
app.use(cookieParser());

app.use('/', indexRouter); // first preference will be indexRouter, if the route matches any route inside indexRouter it will get that 
app.use('/user',userRouter); // otherwise it will try user Router

app.listen(3000,()=>{
    console.log('server is running on port 3000');
})
