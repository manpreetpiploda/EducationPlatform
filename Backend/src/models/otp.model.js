import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({

});


export const OTP = mongoose.model("OTP", otpSchema);