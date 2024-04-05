// import express from 'express';
import dotenv from 'dotenv';
import {app} from './app.js';
import connectDB from './src/config/database.js';

dotenv.config();


//databse connection
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

app.use('/', (req,res)=>  {
    res.send("Server is ready");
})
