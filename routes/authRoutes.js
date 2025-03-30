const express=require("express");
const {login,register,fetchProfile}=require("../controller/authController");
const multer = require("multer");
const router=express.Router();
const upload=multer();
router.post("/login",upload.none(),login);
router.post("/register",register);
router.post("/fetchProfile",upload.none(),fetchProfile);
module.exports=router;