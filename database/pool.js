const { Pool } = require('pg');

const pool=new Pool({
 host:'localhost',
 port:'5432',
 user:'sunilshedge',
 database:'task',
 password:"",
});

pool.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Error connecting to PostgreSQL:", err));

module.exports=pool;