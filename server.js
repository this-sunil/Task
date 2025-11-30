const express=require('express');
const dotenv=require('dotenv');
const cors = require("cors");
const path=require("path");
const axios=require("axios");
const https=require("https");
const fs=require("fs");
const authRoute=require('./routes/authRoutes');
const bannerRoute=require('./routes/bannerRoute');

dotenv.config();
const port=process.env.PORT || 9000;
console.log(`PORT=> ${port}`);
const app=express();
app.use(express.json());

app.use(express.urlencoded({extended:true}));
app.use("/upload",express.static('upload'));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors({
  origin: `http://localhost:${port}`,
  // or for development on Android device:
  methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
  preflightContinue: true,
  allowedHeaders: ["Content-Type", "Accept", "Authorization"]
}));


app.use(
  '/css',
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css'))
);
app.use(
  '/js',
  express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js'))
);

app.use('/bootstrap-icon', express.static(path.join(__dirname, 'node_modules/bootstrap-icons/font')));
app.set('view engine', 'ejs');
app.use("views",express.static(path.join(__dirname,"views")));

app.get("/task", (req, res) => {
    return res.render('task');
});
app.get("/practice",async (req,res)=>{
  const resp=await axios.get(`${process.env.BASEURL}api/getAllUser`);
  console.log("status:", resp.status);
  const result = resp.data.result;
  return res.render("practice",{
    users:result
  });
});

app.use("/api",authRoute);
app.use("/api",bannerRoute);



// Start HTTPS server
app.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}`);
});
