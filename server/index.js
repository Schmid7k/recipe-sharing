const express = require("express");
const multer = require("multer");
const main = multer({ dest: "images/main/" });
const app = express();
const cors = require("cors");
const pool = require("./db");
const { application } = require("express");
const crypt = require("bcrypt");
const fs = require("fs");

// Helper function that save instructions to the instruction database

async function saveInstructions(instructions, recipeID) {
  instructions.forEach(async (instruction, index) => {
    try {
      await pool.query(
        "INSERT INTO recipe_instructions (RecipeID, Step, Instruction, Instruction_Image) VALUES($1, $2, $3, $4) RETURNING *",
        [recipeID, index + 1, instruction, ""]
      );
    } catch (error) {
      console.error(error);
    }
  });
}

// Helper function that checks if recipe tags are not yet part of the database and adds them

async function saveTags(tags, recipeID) {
  tags.forEach(async (tag) => {
    try {
      const checkTag = await pool.query("SELECT * FROM tags WHERE Name = $1", [
        tag,
      ]);

      if (checkTag.rows && checkTag.rows.length == 0) {
        await pool.query("INSERT INTO tags (Name) VALUES($1) RETURNING *", [
          tag,
        ]);
      }

      await pool.query(
        "INSERT INTO recipe_tags (RecipeID, Name) VALUES($1, $2) RETURNING *",
        [recipeID, tag]
      );
    } catch (error) {
      console.error(error);
    }
  });
}

// Helper function that adds categories related to a recipe to the database

async function saveCategories(category, recipeID) {
  try {
    await pool.query(
      "INSERT INTO recipe_categories (RecipeID, Name) VALUES($1, $2) RETURNING *",
      [recipeID, category]
    );
  } catch (error) {
    console.error(error);
  }
}

// Helper function that checks if recipe ingredients are not yet part of the database and adds them

async function saveIngredients(ingredients, amounts, recipeID) {
  ingredients.forEach(async (ingredient, index) => {
    try {
      const checkIngredient = await pool.query(
        "SELECT * FROM ingredients WHERE Name = $1",
        [ingredient]
      );

      if (checkIngredient.rows && checkIngredient.rows.length == 0) {
        await pool.query(
          "INSERT INTO ingredients (Name) VALUES($1) RETURNING *",
          [ingredient]
        );
      }

      await pool.query(
        "INSERT INTO recipe_ingredients (Amount, RecipeID, Name) VALUES($1, $2, $3) RETURNING *",
        [amounts[index], recipeID, ingredient]
      );
    } catch (error) {
      console.error(error);
    }
  });
}

// Helper function that adds recipe groups to the database

async function saveGroups(groups, recipeID) {
  groups.forEach(async (group) => {
    try {
      await pool.query(
        "INSERT INTO ingredient_groups (RecipeID, Name) VALUES($1, $2) RETURNING *",
        [recipeID, group]
      );
    } catch (error) {
      console.error(error);
    }
  });
}

// middleware
app.use(cors());

// Routes

// POST; Creates a new user

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body; // Get the username and password from the request body
    const salt = await crypt.genSalt(); // Generate a random salt for every new password
    const hash = await crypt.hash(password, salt); // Hash the password with the generated salt
    await pool.query(
      "INSERT INTO users (Username, Pass) VALUES($1, $2) RETURNING *",
      [username, hash]
    ); // Add the new user to the database

    res.status(201).json("Successfully created user account!");
  } catch (error) {
    console.error(error.message);
  }
});

// POST; Upload a new recipe

app.post("/recipes", main.single("main"), async (req, res) => {
  try {
    const main = req.file; // retrieve the main image from the request
    var {
      title,
      category,
      ingredients,
      amounts,
      groups,
      instructions,
      addInstructions,
      tags,
    } = req.body; // retrieve the text form content

    if (!addInstructions) addInstructions = ""; // In case addInstructions is null set it to empty string

    const userID = 1; // FIXME: For development purposes the current originator of every recipe will be the user with userID 1

    const newRecipe = await pool.query(
      "INSERT INTO recipes (UserID, MainImage, Title, AdditionalInstructions) VALUES($1, $2, $3, $4) RETURNING *",
      [userID, main.path, title, addInstructions]
    );
    const recipeID = newRecipe.rows[0].recipeid;

    await saveInstructions(instructions, recipeID);
    await saveTags(tags, recipeID);
    await saveCategories(category, recipeID);
    await saveIngredients(ingredients, amounts, recipeID);
    await saveGroups(groups, recipeID);

    res.status(201).json(newRecipe.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

// GET all recipes

app.get("/recipes", async (req, res) => {
  try {
    const allRecipes = await pool.query(
      "SELECT * from recipes ORDER BY RecipeID DESC"
    );
    res.status(200).json(allRecipes.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Some specified get request

app.get("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the URL parameter
    const recipe = await pool.query(
      "SELECT * from recipes WHERE RecipeID = $1",
      [id]
    );

    res.status(200).json(recipe.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(404).json("Unable to find recipe");
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
    const { id } = req.params; // Get the URL parameter
    const recipe = await pool.query(
      "SELECT * FROM recipes WHERE RecipeID = $1",
      [id]
    ); // Retrieve the recipe from the database

    fs.unlinkSync(String(recipe.rows[0].mainimage)); // Delete the main image related to the database

    await pool.query("DELETE FROM recipes WHERE RecipeID = $1", [id]); // Delete the database entry

    res.status(200).json("Recipe successfully deleted!");
  } catch (error) {
    console.error(err.message);
    res.status(404).json("Unable to find recipe");
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
