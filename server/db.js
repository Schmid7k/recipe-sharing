const dotenv = require("dotenv").config();
const Pool = require("pg").Pool;

const CONNECTION_STRING = process.env.DATABASE_URL || {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DEV_IP,
  port: process.env.DEV_PORT,
  database: process.env.DB_DATABASE,
};

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
