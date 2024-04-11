import {Router} from "express";
import {contactUsController} from '../controllers/contactUs.controller.js';
const router =Router();

router.post("/contact", contactUsController);

export default router;  