const express = require("express");
const multer = require("multer");
const app = express();
const cors = require("cors");
const pool = require("./db");
const helpers = require("./helpers");
const crypt = require("bcrypt");
const fs = require("fs");
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

app.post("/recipes", upload.array("images", 100), async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      const images = req.files; // retrieve image array from the request
      const main = images[0];
      const { recipe } = req.body; // retrieve the text content
      const content = JSON.parse(recipe);
      const {
        title,
        category,
        groups,
        instructions,
        addInstructions,
        tags,
        stepImages,
      } = content;

      const userID = await pool.query(
        "SELECT * FROM users WHERE Username = $1",
        [cookie]
      ); // Get userID from database

      const newRecipe = await pool.query(
        "INSERT INTO recipes (UserID, MainImage, Title, AdditionalInstructions) VALUES($1, $2, $3, $4) RETURNING *",
        [userID.rows[0].userid, main.path, title, addInstructions]
      );

      const recipeID = newRecipe.rows[0].recipeid;

      await pool.query(
        "UPDATE recipes SET MainImage = $1 WHERE recipeid = $2",
        [main.path, recipeID]
      ); // Update the new image path in the database

      if (
        // Execute the helper functions to store subelements in the database
        (await helpers.saveCategories(category, recipeID)) &&
        (await helpers.saveGroups(groups, recipeID)) &&
        (await helpers.saveInstructions(
          instructions,
          images.slice(1),
          stepImages,
          recipeID
        )) &&
        (await helpers.saveTags(tags, recipeID))
      ) {
        res.status(201).json(newRecipe.rows[0].recipeid);
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

    const popTags = await pool.query(
      "SELECT tags.name, COUNT(tags.name) FROM recipe_tags INNER JOIN tags ON recipe_tags.tagid=tags.tagid GROUP BY recipe_tags.tagid, tags.name ORDER BY count(recipe_tags.tagid) DESC LIMIT 5;"
    );

    const popIngredients = await pool.query(
      "SELECT ingredients.name, count(recipe_ingredients.ingredientsid) FROM recipe_ingredients INNER JOIN ingredients ON recipe_ingredients.ingredientsid=ingredients.ingredientsid GROUP BY recipe_ingredients.ingredientsid, ingredients.name ORDER BY count(recipe_ingredients.ingredientsid) DESC LIMIT 5"
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
    filters.popTags = [];
    filters.popIngredients = [];

    popTags.rows.forEach((tag) => {
      filters.popTags.push(tag.name);
    });

    popIngredients.rows.forEach((ingredient) => {
      filters.popIngredients.push(ingredient.name);
    });

    res.status(200).json(filters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// GET all recipes

app.get("/recipes", async (req, res) => {
  try {
    // If the request contains no query parameter
    if (Object.keys(req.query).length == 0) {
      const allRecipes = await pool.query(
        "SELECT * FROM recipes ORDER BY RecipeID DESC"
      ); // Retrieve all recipes from the database
      res.status(200).json(allRecipes.rows);
    } else {
      // The request contains query parameter
      var { category, inIngredients, outIngredients, tags, searchPhrase } =
        req.query; // Retrieve the query parameters from the request
      var filteredRecipes;
      // This is the query template used to build the query that is sent to the database later
      var queryTemplate = {
        start: "SELECT DISTINCT recipes.* FROM recipes ",
        mid: "",
        end: [],
        out: "",
      };
      // If the parameter category is there
      if (category) {
        category = category.toLowerCase();
        queryTemplate.mid =
          queryTemplate.mid +
          "LEFT JOIN recipe_categories ON recipe_categories.recipeid = recipes.recipeid LEFT JOIN categories ON categories.categoryid = recipe_categories.categoryid ";
        queryTemplate.end.push(
          "LOWER(categories.name) = " + "'" + `${category}` + "' "
        );
      }
      // If the parameter inIngredients is there
      if (inIngredients) {
        inIngredients = JSON.parse(inIngredients);
        inIngredients = inIngredients.map((x) => x.toLowerCase());
        queryTemplate.mid =
          queryTemplate.mid +
          "LEFT JOIN recipe_ingredients ON recipe_ingredients.recipeid = recipes.recipeid LEFT JOIN ingredients ON ingredients.ingredientsid = recipe_ingredients.ingredientsid ";
        queryTemplate.end.push(
          "LOWER(ingredients.name) IN ('" + inIngredients.join("','") + "') "
        );
      }
      // If the parameter outIngredients is there
      if (outIngredients) {
        outIngredients = JSON.parse(outIngredients);
        outIngredients = outIngredients.map((x) => x.toLowerCase());
        queryTemplate.out =
          "EXCEPT (SELECT recipes.* FROM recipes LEFT JOIN recipe_ingredients ON recipe_ingredients.recipeid = recipes.recipeid LEFT JOIN ingredients ON ingredients.ingredientsid = recipe_ingredients.ingredientsid WHERE LOWER(ingredients.name) IN ('" +
          outIngredients.join("','") +
          "')) ";
      }
      // If the parameter tags is there
      if (tags) {
        tags = JSON.parse(tags);
        tags = tags.map((x) => x.toLowerCase());
        queryTemplate.mid =
          queryTemplate.mid +
          "LEFT JOIN recipe_tags ON recipe_tags.recipeid = recipes.recipeid LEFT JOIN tags ON tags.tagid = recipe_tags.tagid ";
        queryTemplate.end.push("tags.name IN ('" + tags.join("','") + "') ");
      }
      // If the parameter searchPhrase is there
      if (searchPhrase) {
        searchPhrase = searchPhrase.toLowerCase();
        queryTemplate.end.push(
          "LOWER(recipes.title) ILIKE " + "'%" + `${searchPhrase}` + "%' "
        );
      }
      var finalQuery;
      // Construct the database query
      if (queryTemplate.end.length > 0) {
        finalQuery =
          queryTemplate.start +
          queryTemplate.mid +
          "WHERE " +
          queryTemplate.end.join(" AND ") +
          queryTemplate.out +
          "ORDER BY recipeid DESC";
      } else {
        finalQuery =
          queryTemplate.start +
          queryTemplate.mid +
          queryTemplate.out +
          "ORDER BY recipeid DESC";
      }

      console.debug(finalQuery); // Uncomment for debug

      // Apply the query to the database
      filteredRecipes = await pool.query(finalQuery);
      // Send results to client
      res.status(200).json(filteredRecipes.rows);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// POST request to rate a recipe

app.post("/recipes/:id/rate", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      const { id } = req.params; // Retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      const { rating } = req.body;
      await pool.query(
        "INSERT INTO recipe_ratings (Rating, RecipeID, UserID) VALUES ($1, $2, $3) RETURNING *",
        [rating, id, user.rows[0].userid]
      ); // Insert new bookmark into recipe_bookmarks table

      const avgRating = await pool.query(
        "SELECT ROUND(AVG(recipe_ratings.rating), 2) as avgRating FROM recipe_ratings WHERE recipe_ratings.recipeid = $1",
        [id]
      ); // Get new average rating
      res.status(201).json(avgRating.rows[0]);
    } else {
      res.status(401).send("Please register!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// PUT request to update a rating on a recipe

app.put("/recipes/:id/rate", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      const { id } = req.params; // Retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      const { rating } = req.body;
      await pool.query(
        "UPDATE recipe_ratings SET Rating = $1 WHERE recipeid = $2 AND userid = $3",
        [rating, id, user.rows[0].userid]
      ); // Insert new bookmark into recipe_bookmarks table

      res.status(200).send("Updated rating!");
    } else {
      res.status(401).send("Please register!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// DELETE request to delete a rating from a specified recipe

app.delete("/recipes/:id/rate", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      const { id } = req.params; // retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      await pool.query(
        "DELETE FROM recipe_ratings WHERE RecipeID = $1 AND UserID = $2",
        [id, user.rows[0].userid]
      ); // Delete the database entry
      res.status(200).send("Rating deleted!");
    } else {
      res.status(401).send("Please register!");
    }
  } catch {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// POST request to bookmark a recipe

app.post("/recipes/:id/save", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      const { id } = req.params; // Retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      await pool.query(
        "INSERT INTO recipe_bookmarks (RecipeID, UserID) VALUES($1, $2) RETURNING *",
        [id, user.rows[0].userid]
      ); // Insert new bookmark into recipe_bookmarks table
      res.status(201).send("Created bookmark!");
    } else {
      res.status(401).send("Please register!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// DELETE request to delete a bookmark from a specified recipe

app.delete("/recipes/:id/save", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      const { id } = req.params; // retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      await pool.query(
        "DELETE FROM recipe_bookmarks WHERE RecipeID = $1 AND UserID = $2",
        [id, user.rows[0].userid]
      ); // Delete the database entry
      res.status(200).send("Bookmark deleted!");
    } else {
      res.status(401).send("Please register!");
    }
  } catch {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// GET request to get specified recipe

app.get("/recipes/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get the URL parameter
    const base = await pool.query("SELECT * FROM recipes WHERE RecipeID = $1", [
      id,
    ]); // Get recipe from database
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    // Recipe template for the response
    var { recipe } = JSON.parse(`{
      "recipe": {
        "author": "",
        "title": "",
        "main": "",
        "category": "",
        "bookmarks":"",
        "isBookmarked": 0,
        "isRated": 0,
        "avgRating": 0,
        "groups": {
        },
        "instructions": {
        },
        "addInstructions": "",
        "tags": []
      }
    }`);
    // Check if currently logged in user already bookmarked and/or rated this recipe
    if (cookie) {
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      const isBookmarked = await pool.query(
        "SELECT recipe_bookmarks.recipeid FROM recipe_bookmarks WHERE userid = $1 AND recipeid = $2",
        [user.rows[0].userid, id]
      );
      if (isBookmarked.rows[0]) {
        recipe.isBookmarked = 1;
      }

      const isRated = await pool.query(
        "SELECT recipe_ratings.rating FROM recipe_ratings WHERE userid = $1 AND recipeid = $2",
        [user.rows[0].userid, id]
      );
      if (isRated.rows[0]) {
        recipe.isRated = isRated.rows[0].rating;
      }
    }
    if (base.rows[0]) {
      // Recipe exists
      const author = await pool.query("SELECT * FROM users WHERE UserID = $1", [
        base.rows[0].userid,
      ]); // Get the recipe author
      // Add recipe author to template
      recipe.author = author.rows[0].username;
      // Add title to template
      recipe.title = base.rows[0].title;
      // Add path to main image to template
      recipe.main = base.rows[0].mainimage;
      // Add additional instructions to template
      recipe.addInstructions = base.rows[0].additionalinstructions;
      // Get bookmark count
      const bookmarks = await pool.query(
        "SELECT COUNT(*) FROM recipe_bookmarks WHERE recipe_bookmarks.recipeid = $1",
        [id]
      );
      recipe.bookmarks = bookmarks.rows[0].count;
      // Get average rating
      const avgRating = await pool.query(
        "SELECT ROUND(AVG(recipe_ratings.rating), 2) AS avg FROM recipe_ratings WHERE recipe_ratings.recipeid = $1",
        [id]
      );
      // Add average rating to response, such that the average rating is a number rounded to at most 2 decimal places
      recipe.avgRating = avgRating.rows[0].avg;
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
      // console.debug(recipe); Uncomment for debug
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
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      // User is logged in
      const { id } = req.params;
      const user = await pool.query(
        "SELECT * FROM users WHERE users.Username = $1",
        [cookie]
      ); // retrieve user from database
      const recipe = await pool.query(
        "SELECT * FROM recipes WHERE recipes.userid = $1 AND recipes.recipeid = $2",
        [user.rows[0].userid, id]
      ); // Retrieve the recipe from the database and check if the user is actually the author

      if (recipe.rows[0]) {
        // Current user is author
        const images = await pool.query(
          "SELECT * FROM recipe_instructions WHERE RecipeID = $1",
          [id]
        ); // retrieve instruction images from the database
        if (recipe.rows[0]) {
          // Recipe exists
          fs.unlinkSync(String(recipe.rows[0].mainimage)); // Delete the main image stored in the database

          images.rows.forEach((row) => {
            if (row.instruction_image != "") {
              fs.unlinkSync(String(row.instruction_image));
            }
          }); // Delete all instruction images

          await pool.query("DELETE FROM recipes WHERE RecipeID = $1", [id]); // Delete the database entry

          res.status(200).send("Recipe deleted successfully!");
        } else {
          // Recipe does not exist
          res.status(404).send("This recipe does not exist");
        }
      } else {
        res.status(401).send("Please register!");
      }
    } else {
      res.status(401).send("Not authorized to delete this recipe!");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Something went wrong!");
  }
});

// TODO: placeholder for getting user data when loading up a user page

app.get("/user/:username", async (req, res) => {
  try {
    const { username } = req.params; // for use later to grab the user_id, then all the other related user details

    const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
      username,
    ]);
    const id = user.rows[0].userid;

    // we don't have a way for editing bio and uploading an image yet, but maybe we could still store some dummy data
    // for the client to look good and show this off
    // something like [uid, user_id, image_path, bio] table that we could fill in with dummy data directly on the backend
    let headerData = {
      bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc ut sapien vel nisl fermentum malesuada. From server.",
      image: "/images/user_placeholder_icon.svg",
    };

    // need searches to return recipes sorted as reviewed, saved, and uploaded, just filling in with all recipes for now
    const reviewedRecipes = await pool.query(
      "SELECT recipes.* FROM recipes WHERE recipes.recipeid IN (SELECT recipeid FROM recipe_ratings WHERE userid = $1) ORDER BY recipes.recipeid DESC",
      [id]
    );

    // Get all recipes uploaded by this user
    const uploadedRecipes = await pool.query(
      "SELECT * FROM recipes WHERE UserID = $1 ORDER BY recipeid DESC",
      [id]
    );

    const savedRecipes = await pool.query(
      "SELECT recipes.* FROM recipes WHERE recipes.recipeid IN (SELECT recipeid FROM recipe_bookmarks WHERE userid = $1) ORDER BY recipes.recipeid DESC",
      [id]
    );

    let recipes = {
      reviewed: reviewedRecipes.rows,
      saved: savedRecipes.rows,
      uploaded: uploadedRecipes.rows,
    };

    let userData = {
      headerData: headerData,
      recipes: recipes,
    };

    res.status(200).json(userData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// POST request to update user bio + pfp
// TODO: need store the bio and image in user_info
app.post(
  "/userdata",
  upload.fields([
    { name: "bio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const cookie = req.signedCookies.authentication;
      if (cookie) {
        console.log(cookie);
        // console.log(req.body)
        // console.log(req.files)
        console.log(req.files.image[0].path);

        res.status(201).send("Bio updated!");
      } else {
        res.status(401).send("Please register!");
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Something went wrong!");
    }
  }
);

// TODO: Get request to fetch user data *after* it's been updated by the user

app.get("/userdata/:username", async (req, res) => {
  let headerData = {
    bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc ut sapien vel nisl fermentum malesuada. From server v2.",
    image: "/images/user_placeholder_icon.svg",
  };

  res.json(headerData);
});

app.get("/recommendations", async (req, res) => {
  try {
    const recommendedRecipes = await pool.query(
      "SELECT recipe_bookmarks.recipeid, recipes.title, recipes.mainimage, COUNT(recipe_bookmarks.recipeid) AS bookmark_count FROM recipe_bookmarks INNER JOIN recipes ON recipe_bookmarks.recipeid=recipes.recipeid GROUP BY recipe_bookmarks.recipeid, recipes.title, recipes.mainimage ORDER BY bookmark_count DESC LIMIT 3"
    );
    res.status(200).json(recommendedRecipes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

app.listen(5000, () => {
  console.log("server has started on port 5000");
});
