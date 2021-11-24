const dotenv = require("dotenv").config();
const Pool = require("pg").Pool;

// Initializes connection to database
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DEV_IP,
  port: process.env.DEV_PORT,
  database: process.env.DB_DATABASE,
});

module.exports = pool;
