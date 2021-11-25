const dotenv = require("dotenv").config();
const Pool = require("pg").Pool;

var pool;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
} else {
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DEV_IP,
    port: process.env.DEV_PORT,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
  });
}

module.exports = pool;
