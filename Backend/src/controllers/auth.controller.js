import {User} from '../models/user.model.js';
import { Profile } from '../models/profile.model.js';
import mongoose from 'mongoose';
import {OTP} from '../models/otp.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {mailSender} from '../utils/mailSender.js';
import otpGenerator from 'otp-generator'; 
import {passwordUpdated} from '../templates/passwordUpdated.template.js';
import {otpTemplate} from '../templates/emailVerificationTemplate.js'


const signup = async (req, res) => {
    try{
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        } = req.body
          // Check if All Details are there or not
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword ||
            !otp
        ) {
            return res.status(403).json({
              success: false,
              message: "All Fields are required",
            })
        }
        console.log("Data verified ");

        //password and confirmPassword mattches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
              success: false,
              message:
                "Password and Confirm Password do not match. Please try again.",
            })
        }
        console.log("Data verified 2");

        //user already present or not
        const userPresent  = await User.findOne({email});
        console.log("User present :   ", userPresent);
        if(userPresent){
            return res.send(400).json({
                success:false,
                message: "User is already present. Please sign in to continue"
            })
        }
        console.log("Data verified 3 ");

        // Find the most recent OTP for the email
        const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
        console.log(response)
        if (response.length === 0) {
          // OTP not found for the email
          return res.status(400).json({
            success: false,
            message: "The OTP is not valid",
          })
        } else if (otp !== response[0].otp) {
          // Invalid OTP
          return res.status(400).json({
            success: false,
            message: "The OTP is not valid",
          })
        }
        console.log("Fail before has");
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10)
        
        console.log("password hased");
        // Create the user
        let approved = ""
        accountType === "Instructor" ? (approved = false) : (approved = true)

        console.log("account type set");
        
        // Create the Additional Profile For User
        const profileDetails = await Profile.create({
          gender: null,
          dateOfBirth: null,
          about: null,
          contactNumber: null,
        })
        console.log("profile is created");;

        const user = await User.create({
          firstName,
          lastName,
          email,
          contactNumber,
          password: hashedPassword,
          accountType: accountType,
          approved: approved,
          additionalDetails: profileDetails._id,
          image: "",
        })
        console.log("user is created");
        return res.status(200).json({
          success: true,
          user,
          message: "User registered successfully",
        })        

    }catch(error){
        console.error(error)
        return res.status(500).json({
          success: false,
          message: "User cannot be registered. Please try again.",
        })
    }
};


const login = async(req, res) => {
    try {
        // Get email and password from request body
        const { email, password } = req.body
    
        // Check if email or password is missing
        if (!email || !password) {
          // Return 400 Bad Request status code with error message
          return res.status(400).json({
            success: false,
            message: `Please Fill up All the Required Fields`,
          })
        }
    
        // Find user with provided email
        const user = await User.findOne({ email }).populate("additionalDetails")
    
        // If user not found with provided email
        if (!user) {
          // Return 401 Unauthorized status code with error message
          return res.status(401).json({
            success: false,
            message: `User is not Registered with Us Please SignUp to Continue`,
          })
        }
    
        // Generate JWT token and Compare Password
        if (await bcrypt.compare(password, user.password)) {
          const token = jwt.sign(
            { email: user.email, id: user._id, role: user.role },  //payload
            process.env.JWT_SECRET,    //secretOrPrivateKey
            { expiresIn: "24h", }    //options
          )
    
          // Save token to user document in database
          user.token = token
          user.password = undefined
          // Set cookie for token and return success response
          const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true,
          }
          res.cookie("token", token, options).status(200).json({
            success: true,
            token,
            user,
            message: `User Login Success`,
          })
        } else {
          return res.status(401).json({
            success: false,
            message: `Password is incorrect`,
          })
        }
    } catch (error) {
        console.error(error)
        // Return 500 Internal Server Error status code with error message
        return res.status(500).json({
          success: false,
          message: `Login Failure Please Try Again`,
        })
    }
    
};

//Send OTP for mail verification
const sendOtp = async (req, res) => {
  try{
    const {email} = req.body;

    if(!email){
      return res.send(401).json({
        success:true,
        message:"Please enter the data",
      })
    }
    // Check if user is already present
    // Find user with provided email
    const checkUserPresent = await User.findOne({ email })
    // to be used in case of signup

    // If user found with provided email
    if (checkUserPresent) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is Already Registered`,
      })
    }

    //random otp
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    })

    const result = await OTP.findOne({ otp: otp })
    console.log("Result is Generate OTP Func")
    console.log("OTP", otp)
    console.log("Result", result)

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      result = await OTP.findOne({ otp: otp })
    }
    console.log("New otp send 1")

    const otpBody = await OTP.create(
      { email,
        otp,
      })
    console.log("New otp send")
    console.log("OTP Body", otpBody)

    return res.status(200).json({
      success: true,
      message: `OTP Sent Successfully`,
      otp,
    })  

  }catch(error){
    console.log(error.message)
    return res.status(500).json({ success: false, error: error.message })
  }
}

//Change Password
const changePassword = async (req,res) => {
  try{

    // Get user data from req.user
    const userDetails = await User.findById(req.user.id)

    const { oldPassword, newPassword } = req.body

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    )
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" })
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10)
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    )

    //send notification email

    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      )
      console.log("Email sent successfully:", emailResponse.response)
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      })
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error)
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    })
  }
}
export {
    signup,
    login,
    sendOtp,
    changePassword
};