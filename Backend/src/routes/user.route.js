import { signup, login, sendOtp, changePassword} from "../controllers/auth.controller";
import {resetPasswordToken, resetPassword } from "../controllers/resetPassword.controller.js"
import { auth } from "../middlewares/auth.middleware.js";
import {Router} from "express";

const router=Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/sendOtp', sendOtp);
router.post('/changePassword', auth, changePassword);

//reset paaword

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken);

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);



export default router;  