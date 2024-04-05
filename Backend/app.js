import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { cloudinaryConnect } from './src/config/cloudinary.js';
import fileUpload from 'express-fileupload';

dotenv.config();
const app = express();


//Cors are used for connecting backend to frontend
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(
	fileUpload({
		useTempFiles:true,
		tempFileDir:"/tmp",
	})
)

//this is use for read all the input data into json so express can read, because provided response in 
//different-different formats like url, json, request body,forms,objacts and so on.
app.use(express.json());

//use to read all urls because urls have different encoded values 
app.use(express.urlencoded({extended: true, limit:"16kb"}))

//cookie-parser is use to access the cookie from the user browser from server and set the cookie
//basically CRUD operations
app.use(cookieParser())

//connect cloudinary
cloudinaryConnect();

//route imports
import userRouter from './src/routes/user.route.js';


app.use("/api/v1/users", userRouter);


export {app};
