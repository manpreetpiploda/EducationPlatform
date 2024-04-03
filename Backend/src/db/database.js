import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(console.log(`\n MongoDB connected !!`))
    .catch( (error) => {
        console.log("DB connection Issue");
        console.error(error);
        process.exit(1);
    })
}

export default connectDB;