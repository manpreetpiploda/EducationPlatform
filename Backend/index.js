// import express from 'express';
import dotenv from 'dotenv';
import {app} from './app.js';
import connectDB from './src/db/database.js'

dotenv.config();
// const app = express();

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

// app.use('/', (req,res)=>  {
//     // console.log(`Running at port ${potr}`);
//     res.send("Server is ready");
// })

// app.listen(port, ()=>{
//     console.log(`Running at port ${port}`);
// })