const dotenv = require("dotenv").config();
const Pool = require("pg").Pool;

const CONNECTION_STRING = process.env.DATABASE_URL || process.env.DEV_URL;
const SSL = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: CONNECTION_STRING,
  ssl: SSL,
});

module.exports = pool;
