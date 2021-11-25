const dotenv = require("dotenv").config();
const Pool = require("pg").Pool;

const CONNECTION_STRING = process.env.DATABASE_URL || process.env.DEV_URL;

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;
