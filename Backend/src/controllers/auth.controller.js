import User from '../models/user.model.js';
import mongoose from 'mongoose';
import OTP from '../models/otp.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


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
            return res.status(403).send({
            success: false,
            message: "All Fields are required",
            })
        }

        //password and confirmPassword mattches or not
        if (password !== confirmPassword) {
            return res.status(400).json({
              success: false,
              message:
                "Password and Confirm Password do not match. Please try again.",
            })
        }

        //user already present or not
        const userPresent  = await User.findOne({email});
        if(!userPresent){
            return res.send(400).json({
                success:false,
                message: "User is already present. Please sign in to continue"
            })
        }

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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    let approved = ""
    accountType === "Instructor" ? (approved = false) : (approved = true)
    
    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    })
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


export {
    signup,
    login,
};