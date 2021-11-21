const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const pool = require("./db");
const helpers = require("./helpers");
const { application } = require("express");
const crypt = require("bcrypt");
const fs = require("fs");
const { restart } = require("nodemon");
const { DatabaseError } = require("pg-protocol");
const cookie_parser = require("cookie-parser");
const path = require("path");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const correctPath = path.normalize("../client/public/images/");
    cb(null, correctPath);
  },
});
var upload = multer({ storage: storage });

// middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookie_parser("development"));

// Routes

// POST; Creates a new user

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body; // Get the username and password from the request body
    // Check if username already exists
    const exists = await pool.query("SELECT * FROM users WHERE Username = $1", [
      username,
    ]);
    if (username && password) {
      // User input username & password
      if (exists.rows[0]) {
        // Username exists
        res.status(409).send("This Username already exists!");
      } else {
        // username does not exist
        const salt = await crypt.genSalt(); // Generate a random salt for every new password
        const hash = await crypt.hash(password, salt); // Hash the password with the generated salt
        await pool.query(
          "INSERT INTO users (Username, Pass) VALUES($1, $2) RETURNING *",
          [username, hash]
        ); // Add the new user to the database

        res.status(201).send("Successfully created user account!");
      }
    } else {
      // Either username or password missing
      res.status(400).send("Please enter Username and Password!");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Something went wrong!");
  }
});

// POST; Login

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body; // Get the username and password from the request body

    if (username && password) {
      // User input username & password
      const entry = await pool.query(
        "SELECT pass FROM users WHERE username = $1",
        [username]
      ); // Look up if user exists

      if (entry.rows[0]) {
        // User exists
        if (await crypt.compare(password, entry.rows[0].pass)) {
          // Correct password
          res.cookie("authentication", username, {
            signed: true,
            expires: new Date(Date.now() + 2592000000),
          });
          res.status(200).send("Successful authentication!");
        } else {
          // Wrong password
          res.status(401).send("Wrong password for this username!");
        }
      } else {
        // User does not exist
        res.status(401).send("This username does not exist!");
      }
    } else {
      // Either username or password missing
      res.status(400).send("Please enter Username and Password!");
    }
  } catch (error) {
    // An error occurred while trying to process the request
    console.error(error.message);
    res.status(500).json("Something went wrong!");
  }
});

// POST; Upload a new recipe

app.post("/recipes", upload.single("main"), async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      const main = req.file; // retrieve the main image from the request
      const { recipe } = req.body; // retrieve the text content
      const content = JSON.parse(recipe);
      const { title, category, groups, instructions, addInstructions, tags } =
        content;

      const userID = await pool.query(
        "SELECT * FROM users WHERE Username = $1",
        [cookie]
      ); // Get userID from database

      const newRecipe = await pool.query(
        "INSERT INTO recipes (UserID, MainImage, Title, AdditionalInstructions) VALUES($1, $2, $3, $4) RETURNING *",
        [userID.rows[0].userid, main.path, title, addInstructions]
      );

      const recipeID = newRecipe.rows[0].recipeid;

      const newPath = path.dirname(main.path) + "/" + recipeID + "_" + 0; // To rename the image paths

      fs.rename(main.path, newPath, (err) => {
        if (err) console.error("Error while renaming file path: ", +err);
      });

      await pool.query(
        "UPDATE recipes SET MainImage = $1 WHERE recipeid = $2",
        [newPath, recipeID]
      ); // Update the new image path in the database

      if (
        // Execute the helper functions to store subelements in the database
        (await helpers.saveCategories(category, recipeID)) &&
        (await helpers.saveGroups(groups, recipeID)) &&
        (await helpers.saveInstructions(instructions, recipeID)) &&
        (await helpers.saveTags(tags, recipeID))
      ) {
        res.status(201).send("Recipe added successfully!");
      } else {
        res.status(500).send("Something went wrong!");
      }
    } else {
      res.status(401).send("Please register!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// GET all filters
// NOTE: using these to populate the filtering menu for content search
app.get("/filters", async (req, res) => {
  try {
    let filters = {};

    const allTags = await pool.query("SELECT * from tags ORDER BY tagid DESC");
    const allIngredients = await pool.query(
      "SELECT * from ingredients ORDER BY ingredientsid DESC"
    );
    const allCategories = await pool.query(
      "SELECT * from categories ORDER BY categoryid DESC"
    );

    filters.allTags = [];
    filters.allIngredients = [];
    filters.allCategories = [];

    allTags.rows.forEach((tag) => {
      filters.allTags.push(tag.name);
    });
    allIngredients.rows.forEach((ingredient) => {
      filters.allIngredients.push(ingredient.name);
    });
    allCategories.rows.forEach((category) => {
      filters.allCategories.push(category.name);
    });

    // TODO: placeholder data for now - should we have separate tables for most popular ingredients/tags or another column in the table for each?
    // we don't really have a mechanism for counting popularity, unless the query for recipes with applied filters would track their frequency
    filters.popTags = ["popTag1", "popTag2", "popTag3"];
    filters.popIngredients = [
      "popIngredient1",
      "popIngredient2",
      "popIngredient3",
    ];

    res.status(200).json(filters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// GET all recipes

app.get("/recipes", async (req, res) => {
  try {
    const allRecipes = await pool.query(
      "SELECT * from recipes ORDER BY RecipeID DESC"
    ); // Retrieve all recipes from the database
    res.status(200).json(allRecipes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// Some specified get request

app.get("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the URL parameter
    const base = await pool.query("SELECT * from recipes WHERE RecipeID = $1", [
      id,
    ]); // Get recipe from database
    const user = await pool.query("SELECT * FROM users WHERE UserID = $1", [
      base.rows[0].userid,
    ]); // Get the recipe author
    if (base.rows[0]) {
      // Recipe exists
      // Recipe template for the response
      var { recipe } = JSON.parse(`{
        "recipe": {
          "author": "",
          "title": "",
          "main": "",
          "category": "",
          "groups": {
          },
          "instructions": {
          },
          "addInstructions": "",
          "tags": []
        }
      }`);
      // Add recipe author to tempalte
      recipe.author = user.rows[0].username;
      // Add title to template
      recipe.title = base.rows[0].title;
      // Add path to main image to template
      recipe.main = base.rows[0].mainimage;
      // Add additional instructions to template
      recipe.addInstructions = base.rows[0].additionalinstructions;
      // Get tags
      const tags = await pool.query(
        "SELECT tags.name FROM recipes LEFT JOIN recipe_tags ON recipe_tags.recipeid = recipes.recipeid LEFT JOIN tags ON tags.tagid = recipe_tags.tagid WHERE recipes.recipeid = $1",
        [id]
      );
      // Add tags to template
      recipe.tags = JSON.parse(JSON.stringify(tags.rows));
      // Get instructions
      const instructions = await pool.query(
        "SELECT recipe_instructions.step, recipe_instructions.instruction, recipe_instructions.instruction_image FROM recipes LEFT JOIN recipe_instructions ON recipe_instructions.recipeid = recipes.recipeid WHERE recipes.recipeid = $1",
        [id]
      );
      // Add instructions to template
      recipe.instructions = JSON.parse(JSON.stringify(instructions.rows));
      // Get category
      const category = await pool.query(
        "SELECT categories.name FROM recipes LEFT JOIN recipe_categories ON recipe_categories.recipeid = recipes.recipeid LEFT JOIN categories ON categories.categoryid = recipe_categories.categoryid WHERE recipes.recipeid = $1",
        [id]
      );
      // Add category to template
      recipe.category = category.rows[0].name;
      // Get ingredient groups
      const ingredient_groups = await pool.query(
        "SELECT ingredient_groups.name as group, ingredients.name as ingredient, recipe_ingredients.amount FROM recipes LEFT JOIN ingredient_groups ON ingredient_groups.recipeid = recipes.recipeid LEFT JOIN recipe_ingredients ON recipe_ingredients.groupid = ingredient_groups.groupid LEFT JOIN ingredients ON ingredients.ingredientsid = recipe_ingredients.ingredientsid WHERE recipes.recipeid = $1",
        [id]
      );
      // Every ingredient group contains a list of ingredients related to that group
      for (var i = 0; i < ingredient_groups.rowCount; i++) {
        const group = ingredient_groups.rows[i].group;
        const ingredient = ingredient_groups.rows[i].ingredient;
        const amount = ingredient_groups.rows[i].amount;
        // Check if the key of the current group already exists in the template
        if (recipe.groups[group]) {
          // Key exists
          recipe.groups[group].push(
            JSON.parse(
              JSON.stringify({ ingredient: ingredient, amount: amount })
            )
          );
        } else {
          // Key does not exists
          recipe.groups[group] = [];
          recipe.groups[group].push(
            JSON.parse(
              JSON.stringify({ ingredient: ingredient, amount: amount })
            )
          );
        }
      }
      // Send response
      res.status(200).json(recipe);
    } else {
      // Recipe does not exist
      res.status(404).send("This recipe does not exist!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Something went wrong!");
  }
});

// Delete a recipe with the specified ID

app.delete("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the URL parameter
    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE RecipeID = $1",
      [id]
    ); // Retrieve the recipe from the database
    if (recipe.rows[0]) {
      // Recipe exists
      fs.unlinkSync(String(recipe.rows[0].mainimage)); // Delete the main image stored in the database

      await pool.query("DELETE FROM recipes WHERE RecipeID = $1", [id]); // Delete the database entry

      res.status(200).send("Recipe deleted successfully!");
    } else {
      // Recipe does not exist
      res.status(404).send("This recipe does not exist");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Something went wrong!");
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
