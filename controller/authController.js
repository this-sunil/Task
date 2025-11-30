const pool = require("../database/pool");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
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
    const fileExtension = path.extname(file.originalname);
    const fileName = `${timestamp}${fileExtension}`;
    cb(null, fileName);
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 5 * 1024 * 1024 },
}).single("photo");

const createTable = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    mobile BIGINT,
    password TEXT,
    photo VARCHAR(255)
  );
`;

pool.query(createTable, (err, result) => {
  if (err) {
    console.log("Failed to Create User Table", err.stack);
  }
  console.log("User Table Created or already exist");
});

const login = async (req, resp) => {
  const { mobile, password } = req.body;
  console.log(`Mobile =>${mobile}`);

  // Check if mobile is provided
  if (!mobile) {
    return resp.status(400).json({
      status: false,
      msg: "Mobile number is required",
    });
  }

  // Check if mobile is 10 digits
  if (mobile.length !== 10) {
    return resp.status(400).json({
      status: false,
      msg: "Phone number must be 10 digits",
    });
  }

  // Check if password is provided
  if (!password) {
    return resp.status(400).json({
      status: false,
      msg: "Password is required",
    });
  }

  try {
    // Prepare the query using parameterized inputs to prevent SQL injection
    const query = `SELECT * FROM users WHERE mobile = $1`;
    const values = [mobile];

    // Execute the query with parameters
    const { rows } = await pool.query(query, values);

    // Check if user exists
    if (rows.length === 0) {
      return resp.status(401).json({
        status: false,
        msg: "Invalid mobile number or password",
      });
    }
    const isMatch =await bcrypt.compare(password, rows[0].password);
    // Return successful login response
    if (isMatch) {
      return resp.status(200).json({
        status: true,
        msg: "Login Successfully",
        result: rows[0], // Send the user data (first row)
      });
    }
    else{
      return resp.status(400).json({
        status: false,
        msg: "Wrong password"
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return resp.status(500).json({
      status: false,
      msg: "Internal server error",
    });
  }
};

const register = async (req, res) => {
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

    const { full_name, mobile, email, password } = req.body;

    if (!full_name || !mobile || !email || !password || !req.file) {
      return res.json({
        status: false,
        msg: "This field is required: full name, email, phone, password, and photo",
      });
    }

    const checkQuery = `SELECT * FROM users WHERE mobile = $1 OR email = $2`;
    const { rows: existUser } = await pool.query(checkQuery, [mobile, email]);

    if (existUser.length > 0) {
      return res.status(400).json({
        status: false,
        msg: "User already exists",
      });
    }
    const imgPath = req.file?req.file.filename:"";
    console.log(`Image Path=>${imgPath.filename}`);
    const hashPass =await bcrypt.hash(password,10);
    const query = `INSERT INTO users (full_name, mobile, email, password, photo) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const { rows } = await pool.query(query, [
      full_name,
      mobile,
      email,
      hashPass,
      `/upload/${imgPath}`,
    ]);

    if(rows.length>0){
      return res.status(200).json({
      status: true,
      msg: "Registered successfully",
      result: rows[0],
    });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      msg: "Internal server error",
      error: err.message,
    });
  }
};
const fetchProfile = async (req, res) => {
  const { userid } = req.body;
  const query = `select * from users where id=$1`;
  const values = [userid];
  const result = await pool.query(query, values);
  if (!result) {
    return res.send({
      status: true,
      msg: "Invalid User ID",
    });
  }
  return res.send({
    status: true,
    msg: "Profile Fetch Successfully",
    result: result.rows[0],
  });
};
const getAllUser = async (req, res) => {
  try {
    const query = `SELECT * FROM users`;
    const { rows } = await pool.query(query);
    if (rows.length > 0) {
      return res.status(200).send({
        status: true,
        msg: "Fetch All Users",
        result: rows,
      });
    }
  } catch (error) {
    return res.status(500).send({
      status: false,
      msg: "Internal Server Error",
    });
  }
};
module.exports = { login, register, fetchProfile, getAllUser };
