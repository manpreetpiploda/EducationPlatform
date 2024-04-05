import Profile from '../models/profile.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';
import CourseProgress from '../models/courseProgress.model.js';
import uploadImageToCloudinary from '../utils/imageUploader.js';
import convertSecondsToDuration from '../utils/secToDuration.js'


const updateProfile = async (req, res) => {
    try {
        const {
          firstName = "",
          lastName = "",
          dateOfBirth = "",
          about = "",
          contactNumber = "",
          gender = "",
        } = req.body
        const id = req.user.id
    
        // Find the profile by id
        const userDetails = await User.findById(id)
        const profile = await Profile.findById(userDetails.additionalDetails)
    
        const user = await User.findByIdAndUpdate(id, {
          firstName,
          lastName,
        })
        await user.save()
    
        // Update the profile fields
        profile.dateOfBirth = dateOfBirth
        profile.about = about
        profile.contactNumber = contactNumber
        profile.gender = gender
    
        // Save the updated profile
        await profile.save()
    
        // Find the updated user details
        const updatedUserDetails = await User.findById(id)
          .populate("additionalDetails")
          .exec()
    
        return res.json({
          success: true,
          message: "Profile updated successfully",
          updatedUserDetails,
        })
      } catch (error) {
        console.log(error)
        return res.status(500).json({
          success: false,
          error: error.message, 
        })
      }
}

const deleteAccount = async (req,res) => {
    try {
        const id = req.user.id
        console.log(id)
        const user = await User.findById({ _id: id })
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          })
        }
        // Delete Assosiated Profile with the User
        await Profile.findByIdAndDelete({
          _id: new mongoose.Types.ObjectId(user.additionalDetails),
        })
        for (const courseId of user.courses) {
          await Course.findByIdAndUpdate(
            courseId,
            { $pull: { studentsEnroled: id } },
            { new: true }
          )
        }
        // Now Delete User
        await User.findByIdAndDelete({ _id: id })
        res.status(200).json({
          success: true,
          message: "User deleted successfully",
        })
        await CourseProgress.deleteMany({ userId: id })
      } catch (error) {
        console.log(error)
        res
          .status(500)
          .json({ success: false, message: "User Cannot be deleted successfully" })
      }
}

const getAllUserDetails =async (req, res) =>{
    try {
        const id = req.user.id
        const userDetails = await User.findById(id)
          .populate("additionalDetails")
          .exec()
        console.log(userDetails)
        res.status(200).json({
          success: true,
          message: "User Data fetched successfully",
          data: userDetails,
        })
    } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        })
    }
}

const updateDisplayPicture = async(req, res) =>{
    try {
        const displayPicture = req.files.displayPicture
        const userId = req.user.id
        const image = await uploadImageToCloudinary(
          displayPicture,
          process.env.FOLDER_NAME,
          1000,
          1000
        )
        console.log(image)
        const updatedProfile = await User.findByIdAndUpdate(
          { _id: userId },
          { image: image.secure_url },
          { new: true }
        )
        res.send({
          success: true,
          message: `Image Updated successfully`,
          data: updatedProfile,
        })
    } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        })
    }
}

const getEnrolledCourses = async (req, res) =>{
    try{
        const id = req.user.id;

        const user= await User.findById({_id: id});

        const coursses=[];
        for(const courseId of user){
            coursses.push(courseId);
        }

    }
    catch(error){

    }
}


export {
    updateProfile,
    deleteAccount,
    getAllUserDetails,
    updateDisplayPicture,
}