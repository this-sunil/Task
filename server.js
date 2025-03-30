const express=require('express');
const dotenv=require('dotenv');
const cors = require("cors");
const path=require("path");
const authRoute=require('./routes/authRoutes');
const bannerRoute=require('./routes/bannerRoute');
dotenv.config();

const app=express();
app.use(express.json());

app.use(express.urlencoded({extended:true}));

app.use("/upload",express.static('upload'));
const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
  };
app.use(cors(corsOptions));
const port=process.env.PORT || 9000;
console.log(`PORT=> ${port}`);
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,"views")));
function factorial(n) {
    if (n === 0) return 1;
    return n * factorial(n - 1);
}
app.get("/task", (req, res) => {
    return res.render('task');
});

console.log(factorial(5));
app.use("/api",authRoute);
app.use("/api",bannerRoute);





app.listen(port,(req,res)=>{
    console.log(`Server is running on http://localhost:${port}`);
});
