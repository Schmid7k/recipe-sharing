const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const { application } = require("express");

// middleware
app.use(cors());
app.use(express.json());

// Routes

// Some post request

app.post("/placeholder", async (req, res) => {
  try {
    console.log("Not yet implemented!");
  } catch (err) {
    console.error(err.message);
  }
});

// Some get request

app.get("/placeholder", async (req, res) => {
  try {
    console.log("Not yet implemented!");
  } catch (err) {
    console.error(err.message);
  }
});

// Some specified get request

app.get("/placeholder/:id", async (req, res) => {
  try {
    console.log("Not yet implemented!");
  } catch (err) {
    console.error(err.message);
  }
});

// Some put request

app.put("/placeholder/:id", async (req, res) => {
  try {
    console.log("Not yet implemented!");
  } catch (err) {
    console.error(err.message);
  }
});

// Some delete request

app.delete("/placeholder/:id", async (req, res) => {
  try {
    console.log("Not yet implemented!");
  } catch (err) {
    console.error(err.message);
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
