const Pool = require("pg").Pool;

const pool = new Pool({
  user: "%YOUR_USERNAME_HERE%",
  password: "%YOUR_PASSWORD_HERE%",
  host: "localhost",
  port: "5432",
  database: "recipesharing",
});

module.exports = pool;
