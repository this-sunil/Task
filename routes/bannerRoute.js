const express=require("express");
const router=express.Router();
const {fetchBanner,uploadBanner} = require("../controller/bannerController");

router.get('/fetchBanner',fetchBanner);
router.post('/uploadBanner',uploadBanner);

module.exports=router;