const express=require("express");
const {login,register,fetchProfile}=require("../controller/authController");
const router=express.Router();

router.post("/login",login);
router.post("/register",register);
router.post("/fetchProfile",fetchProfile);
module.exports=router;