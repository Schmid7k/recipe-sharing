const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const pool = require("./db");
const { application } = require("express");
const crypt = require("bcrypt");

function addInstructions(instructions) {
  //TODO: Implement adding of instructions to database table
}

function addGroups(groups) {
  //TODO: Implement adding of groups to database table
}

function addCategory(category) {
  //TODO: Implement adding of category to database table
}

function addIngredients(ingredients) {
  //TODO: Implement adding of ingredients to database table
}

function addTags(tags) {
  //TODO: Implement adding of tags to database table
}

// middleware
app.use(cors());
app.use(express.json());
app.use(multer().single());

// Routes

// POST; Creates a new user

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body; // Get the username and password from the request body
    const salt = await crypt.genSalt(); // Generate a random salt for every new password
    const hash = await crypt.hash(password, salt); // Hash the password with the generated salt
    const newUser = await pool.query(
      "INSERT INTO users (Username, Pass) VALUES($1, $2) RETURNING *",
      [username, hash]
    ); // Add the new user to the database

    res.json("Successfully created user account!");
  } catch (error) {
    console.error(error.message);
  }
});

// POST; Upload a new recipe

app.post("/recipes", async (req, res) => {
  try {
    const {
      title,
      category,
      image,
      ingredients,
      groups,
      instructions,
      addInstructions,
      tags,
    } = req.body;
    const userID = 1; // FIXME: For development purposes the current originator of every recipe will be the user with userID 1;
    const newRecipe = await pool.query(
      "INSERT INTO recipes (UserID, MainImage, Title, AdditionalInstructions) VALUES($1, $2, $3, $4) RETURNING *",
      [userID, image, title, addInstructions]
    );
    addInstructions(instructions);
    addGroups(groups);
    addCategory(category);
    addIngredients(ingredients);
    addTags(tags);

    res.json(newRecipe.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// GET all recipes

app.get("/recipes", async (req, res) => {
  try {
    const allRecipes = await pool.query("SELECT * from recipes");
    res.json(allRecipes.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Some specified get request

app.get("/recipes/:id", async (req, res) => {
  try {
    console.log("Not yet implemented!");
  } catch (err) {
    console.error(err.message);
  }
});

// Some put request

app.put("/recipes/:id", async (req, res) => {
  try {
    console.log("Not yet implemented!");
  } catch (err) {
    console.error(err.message);
  }
});

// Delete a recipe with the specified ID

app.delete("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteRecipe = await pool.query(
      "DELETE FROM recipes where RecipeID = $1",
      [id]
    );

    res.json("Recipe successfully deleted!");
  } catch (error) {
    console.error(err.message);
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
