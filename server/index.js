const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const pool = require("./db");
const { application } = require("express");
const crypt = require("bcrypt");
const fs = require("fs");
const { restart } = require("nodemon");
const { DatabaseError } = require("pg-protocol");
const cookie_parser = require("cookie-parser");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/main/");
  },
});
var upload = multer({ storage: storage });

// middleware
app.use(cors());
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
        res.send("This Username already exists!");
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
            maxAge: 2592000000,
          });
          res.status(302).redirect("/recipes");
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
    const cookie = req.signedCookies.authentication;
    if (cookie) {
      const main = req.file; // retrieve the main image from the request
      const { recipe } = req.body; // retrieve the text content
      const content = JSON.parse(recipe);
      const { title, category, groups, instructions, addInstructions, tags } =
        content;
      const userID = 1; // FIXME: For development purposes the current originator of every recipe will be the user with userID 1

      const newRecipe = await pool.query(
        "INSERT INTO recipes (UserID, MainImage, Title, AdditionalInstructions) VALUES($1, $2, $3, $4) RETURNING *",
        [userID, main.path, title, addInstructions]
      );

      const recipeID = newRecipe.rows[0].recipeid;

      if (
        (await saveCategories(category, recipeID)) &&
        (await saveGroups(groups, recipeID)) &&
        (await saveInstructions(instructions, recipeID)) &&
        (await saveTags(tags, recipeID))
      ) {
        res.status(201).json(newRecipe.rows[0]);
      } else {
        res.status(500).send("Something went wrong!");
      }
    } else {
      res.status(302).redirect("/register");
    }
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

    if (base.rows[0]) {
      // Recipe exists
      // Recipe template for the response
      var { recipe } = JSON.parse(`{
        "recipe": {
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
              JSON.stringify({ ingedient: ingredient, amount: amount })
            )
          );
        } else {
          // Key does not exists
          recipe.groups[group] = [];
          recipe.groups[group].push(
            JSON.parse(
              JSON.stringify({ ingedient: ingredient, amount: amount })
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
      fs.unlinkSync(String(recipe.rows[0].mainimage)); // Delete the main image related to the database

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

// Helper function that saves instructions to the instruction database

async function saveInstructions(instructions, recipeID) {
  try {
    Object.entries(instructions).forEach(async (instruction) => {
      const [step, description] = instruction;
      await pool.query(
        "INSERT INTO recipe_instructions (RecipeID, Step, Instruction, Instruction_Image) VALUES($1, $2, $3, $4) RETURNING *",
        [recipeID, step, description, ""]
      );
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Helper function that checks if recipe tags are not yet part of the database and adds them

async function saveTags(tags, recipeID) {
  try {
    tags.forEach(async (tag) => {
      const checkTag = await pool.query("SELECT * FROM tags WHERE Name = $1", [
        tag,
      ]);

      if (checkTag.rows && checkTag.rows.length == 0) {
        const newTag = await pool.query(
          "INSERT INTO tags (Name) VALUES($1) RETURNING *",
          [tag]
        );
        await pool.query(
          "INSERT INTO recipe_tags (RecipeID, tagID) VALUES($1, $2) RETURNING *",
          [recipeID, newTag.rows[0].tagid]
        );
      } else {
        await pool.query(
          "INSERT INTO recipe_tags (RecipeID, tagID) VALUES($1, $2) RETURNING *",
          [recipeID, checkTag.rows[0].tagid]
        );
      }
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Helper function that adds categories related to a recipe to the database

async function saveCategories(category, recipeID) {
  try {
    const checkCat = await pool.query(
      "SELECT * FROM categories WHERE Name = $1",
      [category]
    );
    if (checkCat.rows[0]) {
      await pool.query(
        "INSERT INTO recipe_categories (RecipeID, categoryID) VALUES($1, $2) RETURNING *",
        [recipeID, checkCat.rows[0].categoryid]
      );
    } else {
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Helper function that checks if recipe ingredients are not yet part of the database and adds them

async function saveIngredients(ingredients, recipeID, groupID) {
  try {
    ingredients.forEach(async (entry) => {
      const ingredient = entry.ingredient;
      const amount = entry.amount;
      const checkIngredient = await pool.query(
        "SELECT * FROM ingredients WHERE Name = $1",
        [ingredient]
      );

      if (checkIngredient.rows && checkIngredient.rows.length == 0) {
        const newIngredient = await pool.query(
          "INSERT INTO ingredients (Name) VALUES($1) RETURNING *",
          [ingredient]
        );
        await pool.query(
          "INSERT INTO recipe_ingredients (Amount, ingredientsID, RecipeID, groupID) VALUES($1, $2, $3, $4) RETURNING *",
          [amount, newIngredient.rows[0].ingredientsid, recipeID, groupID]
        );
      } else {
        await pool.query(
          "INSERT INTO recipe_ingredients (Amount, ingredientsID, RecipeID, groupID) VALUES($1, $2, $3, $4) RETURNING *",
          [amount, checkIngredient.rows[0].ingredientsid, recipeID, groupID]
        );
      }
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Helper function that adds recipe groups to the database

async function saveGroups(groups, recipeID) {
  try {
    Object.entries(groups).forEach(async (group) => {
      const [name, values] = group;
      const newGroup = await pool.query(
        "INSERT INTO ingredient_groups (RecipeID, Name) VALUES($1, $2) RETURNING *",
        [recipeID, name]
      );
      await saveIngredients(values, recipeID, newGroup.rows[0].groupid);
    });
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
