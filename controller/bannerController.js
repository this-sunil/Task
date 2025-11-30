const pool = require("../database/pool");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../upload");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
     cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const fileName = `${timestamp}${extension}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 5 * 1024 * 1024 },
}).single('imgPath');

const bannerTable = `CREATE TABLE IF NOT EXISTS Banner(id SERIAL PRIMARY KEY,title TEXT,subtitle TEXT,imgPath TEXT)`;
pool.query(bannerTable, (err, result) => {
  if (err) {
    return console.log("Failed to Create banner Table");
  }
  return console.log("Banner Create Table Successfully or Already exists");
});

const uploadBanner = async (req, res) => {
   try {
    await new Promise((resolve, reject) => {
        upload(req, res, (err) => {
          if (err) {
            reject(err); 
          } else {
            resolve();
          }
        });
      });
    const { title, subtitle } = req.body;
    console.log(`Title=>${title} Subtitle=>${subtitle}`);
    if (!title || !subtitle) {
      return res.status(400).json({
        status: false,
        msg: "Missing required params title or subtitle",
      });
    }

    const imgPath = req.file;
    if (!imgPath) {
      return res.status(400).json({
        status: true,
        msg: "Missing file",
      });
    }
    console.log(`Image Path=>${imgPath.filename}`);

    const query = `INSERT INTO Banner (title,subtitle,imgPath) VALUES($1,$2,$3) RETURNING *`;
    const values = [ title, subtitle, `/upload/${imgPath.filename}`];
    const { rows } = await pool.query(query, values);

    return res.status(200).json({
      status: true,
      msg: "Fetch Banner Successfully",
      result: rows[0],
    });
  } catch (e) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
    });
  }
};
const fetchBanner = async (req, res) => {
  try {
    const query = `SELECT * FROM Banner`;
    const { rows } = await pool.query(query);
    console.log(`Banner results=>${rows.length}`);
    if (rows.length == 0) {
      return res.status(400).json({
        status: false,
        msg: "Data not found !!!",
      });
    } else {
      return res.status(200).json({
        status: true,
        msg: "Fetch Banner Successfully",
        result: rows,
      });
    }
  } catch (e) {
    return res.status(500).json({
      status: false,
      msg: "Internal Server Error",
    });
  }
};
module.exports = { uploadBanner, fetchBanner };
