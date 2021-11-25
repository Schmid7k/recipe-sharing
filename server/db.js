const dotenv = require("dotenv").config();
const Pool = require("pg").Pool;

const env = process.env.NODE_ENV || "development";

let connectionString = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DEV_IP,
  port: process.env.DEV_PORT,
  database: process.env.DB_DATABASE,
};

if (env === "development") {
  connectionString.database = process.env.DB_DATABASE;
} else {
  connectionString = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
}

const pool = new Pool(connectionString);

module.exports = pool;
