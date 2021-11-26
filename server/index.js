const express = require("express");
const dotenv = require("dotenv").config();
const multer = require("multer");
const app = express();
const cors = require("cors");
const pool = require("./db");
const helpers = require("./helpers");
const crypt = require("bcrypt");
const fs = require("fs");
const cookie_parser = require("cookie-parser");
const path = require("path");
const s3 = require("./s3");
const env = process.env.NODE_ENV || "development";
const port = process.env.PORT || 5000;

// Here we define the storage location for images that are uploaded to the server
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const correctPath = path.normalize("./client/build/images");
    cb(null, correctPath);
  },
});
var upload = multer({ storage: storage });

// middleware
app.use(express.static(path.join(__dirname, "../client/build")));
app.use(
  cors({
    origin: "http://localhost:3000", // Requests will come in from localhost:3000; that's where the frontend resides
    credentials: true,
  })
);
app.use(express.json()); // JSON middleware used to process requests that contain JSON data
app.use(cookie_parser(process.env.COOKIE_SECRET)); // Cookie setting middleware used to parse request cookies and check if they are signed properly with the servers cookie secret

// Routes

// POST; Accepts requests to create a new user
/*
 * Request body is expected to hold the fields "username" and "password"
 * Responds either with 400er error codes in case something doesn't work out with the given request or with 201 if the user account was created
 */

app.post("/api/register", async (req, res) => {
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
        const newUser = await pool.query(
          "INSERT INTO users (Username, Pass) VALUES($1, $2) RETURNING *",
          [username, hash]
        ); // Add the new user to the database

        // add default image and bio
        await pool.query(
          "INSERT INTO user_info (userid, imagepath, bio) VALUES ($1, $2, $3) RETURNING *",
          [
            newUser.rows[0].userid,
            "https://recipesharingheroku.s3.eu-central-1.amazonaws.com/user_placeholder_icon.svg",
            "This user has no bio.",
          ]
        );

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

// POST; Accepts requests to login
/*
 * Request body is expected to hold the fields "username" and "password"
 * Responds with 400er error codes in case something doesn't work out with the given request
 * Responds with status code 200 and a signed cookie for future authentication if the provided login information is correct
 */

app.post("/api/login", async (req, res) => {
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

// POST; Accepts requests to upload a new recipe
/*
 * Request body is expected to hold the fields "images", "title", "category", "groups", "instructions", "addInstructions", "tags" and "stepImages"
 * Request must send a valid authentication cookie, because only logged in users are allowed to create new recipes
 * Responds with 400er error codes in case something doesn't work out with the given request
 * Responds with status code 201 and the newly created recipe if the provided information is correct
 */

app.post("/api/recipes", upload.array("images", 100), async (req, res) => {
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

      // Upload file to AWS and get the response
      const result = await s3.uploadFile(main);
      // retrieve file location from AWS response
      const location = result.Location;

      const userID = await pool.query(
        "SELECT * FROM users WHERE Username = $1",
        [cookie]
      ); // Get userID from database

      const newRecipe = await pool.query(
        "INSERT INTO recipes (UserID, MainImage, Title, AdditionalInstructions) VALUES($1, $2, $3, $4) RETURNING *",
        [userID.rows[0].userid, location, title, addInstructions]
      ); // Add the new recipe to the database

      // Get the recipeid of the newly created recipe
      const recipeID = newRecipe.rows[0].recipeid;

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

// GET; Accepts requests to return all filters
/*
 * Request body is empty
 * Responds with status code 200 and all tags, ingredients, categories and the top 5 popular tags/ingredients
 */
app.get("/api/filters", async (req, res) => {
  try {
    let filters = {}; // Response template

    const allTags = await pool.query("SELECT * from tags ORDER BY tagid DESC"); // Get all tags from the database
    const allIngredients = await pool.query(
      "SELECT * from ingredients ORDER BY ingredientsid DESC" // Get all ingredients from the database
    );
    const allCategories = await pool.query(
      "SELECT * from categories ORDER BY categoryid DESC" // Get all categories from the database
    );

    const popTags = await pool.query(
      "SELECT tags.name, COUNT(tags.name) FROM recipe_tags INNER JOIN tags ON recipe_tags.tagid=tags.tagid GROUP BY recipe_tags.tagid, tags.name ORDER BY count(recipe_tags.tagid) DESC LIMIT 5;"
    ); // Get the 5 most popular tags (by how often they come up in recipes)

    const popIngredients = await pool.query(
      "SELECT ingredients.name, count(recipe_ingredients.ingredientsid) FROM recipe_ingredients INNER JOIN ingredients ON recipe_ingredients.ingredientsid=ingredients.ingredientsid GROUP BY recipe_ingredients.ingredientsid, ingredients.name ORDER BY count(recipe_ingredients.ingredientsid) DESC LIMIT 5"
    ); // Get the 5 most popular ingredients (by how often they come up in recipes)

    filters.allTags = [];
    filters.allIngredients = [];
    filters.allCategories = [];

    allTags.rows.forEach((tag) => {
      filters.allTags.push(tag.name);
    }); // Add retrieved tags to response
    allIngredients.rows.forEach((ingredient) => {
      filters.allIngredients.push(ingredient.name);
    }); // Add retrieved ingredients to response
    allCategories.rows.forEach((category) => {
      filters.allCategories.push(category.name);
    }); // Add retrieved categories to response

    filters.popTags = [];
    filters.popIngredients = [];

    popTags.rows.forEach((tag) => {
      filters.popTags.push(tag.name);
    }); // Add popular tags to response

    popIngredients.rows.forEach((ingredient) => {
      filters.popIngredients.push(ingredient.name);
    }); // Add popular ingredients to response

    res.status(200).json(filters);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// GET; Accepts requests to return all recipes or recipes filtered by query parameters
/*
 * Request body is empty;
 * Existence of query parameters denotes a request to filter through recipes
 * Can filter by: "category", inIngredients (ingredients that should be included), outIngredients (ingredients that should be excluded), tags, minimum rating and search phrase
 * Responds with status code 200 either all recipes or all recipes filtered by the given query parameters
 */
app.get("/api/recipes", async (req, res) => {
  try {
    // If the request contains no query parameters
    if (Object.keys(req.query).length == 0) {
      const allRecipes = await pool.query(
        "SELECT * FROM recipes ORDER BY RecipeID DESC"
      ); // Retrieve all recipes from the database
      res.status(200).json(allRecipes.rows);
    } else {
      // The request contains query parameters
      var {
        category,
        inIngredients,
        outIngredients,
        tags,
        rating,
        searchPhrase,
      } = req.query; // Retrieve the query parameters from the request
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
      // If the parameter rating is there
      if (rating > 0) {
        queryTemplate.mid =
          queryTemplate.mid +
          "LEFT JOIN recipe_ratings ON recipe_ratings.recipeid = recipes.recipeid ";
        queryTemplate.end.push(`recipe_ratings.rating >= ${rating} `);
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

      // console.debug(finalQuery); // Uncomment for debug

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

// POST; Accepts requests to rate a recipe
/*
 * Request body contains the rating; Request must contain valid user cookie, because only logged in users are allowed to rate recipes
 * Responds with status code 401 if originator could not be authenticated
 * Responds with status code 201 and the new average rating if recipe was rated successfully
 */
app.post("/api/recipes/:id/rate", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      // User is authenticated
      const { id } = req.params; // Retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      const { rating } = req.body; // Get rating from request body
      await pool.query(
        "INSERT INTO recipe_ratings (Rating, RecipeID, UserID) VALUES ($1, $2, $3) RETURNING *",
        [rating, id, user.rows[0].userid]
      ); // Insert new rating into recipe_ratings table

      const avgRating = await pool.query(
        "SELECT ROUND(AVG(recipe_ratings.rating), 2) as avgRating FROM recipe_ratings WHERE recipe_ratings.recipeid = $1",
        [id]
      ); // Get new average rating
      res.status(201).json(avgRating.rows[0]);
    } else {
      // User is unauthenticated
      res.status(401).send("Please register!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// PUT; Accepts requests to update a rating on a recipe
/*
 * Request body contains the rating; Request must contain valid user cookie, because only logged in users are allowed to rate recipes
 * Responds with status code 401 if originator could not be authenticated
 * Responds with status code 200 and the new average rating if recipe rating was updated successfully
 */
app.put("/api/recipes/:id/rate", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      // User is authenticated
      const { id } = req.params; // Retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      const { rating } = req.body; // Get new rating from request body
      await pool.query(
        "UPDATE recipe_ratings SET Rating = $1 WHERE recipeid = $2 AND userid = $3",
        [rating, id, user.rows[0].userid]
      ); // Insert new bookmark into recipe_bookmarks table

      const avgRating = await pool.query(
        "SELECT ROUND(AVG(recipe_ratings.rating), 2) as avgRating FROM recipe_ratings WHERE recipe_ratings.recipeid = $1",
        [id]
      ); // Get new average rating

      res.status(200).send(avgRating.rows[0]);
    } else {
      // User is not authenticated
      res.status(401).send("Please register!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// DELETE; Accepts requests to delete a rating from a specified recipe
/*
 * Request body is empty; Request must contain valid user cookie, because only logged in users are allowed to rate recipes
 * Responds with status code 401 if originator could not be authenticated
 * Responds with status code 200 and the new average rating if recipe rating was deleted successfully
 */
app.delete("/api/recipes/:id/rate", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      // User is authenticated
      const { id } = req.params; // retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      await pool.query(
        "DELETE FROM recipe_ratings WHERE RecipeID = $1 AND UserID = $2",
        [id, user.rows[0].userid]
      ); // Delete the database entry

      const avgRating = await pool.query(
        "SELECT ROUND(AVG(recipe_ratings.rating), 2) as avgRating FROM recipe_ratings WHERE recipe_ratings.recipeid = $1",
        [id]
      ); // Get new average rating

      res.status(200).send(avgRating.rows[0]);
    } else {
      // User is unauthenticated
      res.status(401).send("Please register!");
    }
  } catch {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// POST; Accepts requests to bookmark a recipe
/*
 * Request body is empty; Request must contain valid user cookie, because only logged in users are allowed to rate recipes
 * Responds with status code 401 if originator could not be authenticated
 * Responds with status code 201 if recipe was bookmarked successfully
 */
app.post("/api/recipes/:id/save", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      // User is authenticated
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
      // User is unauthenticated
      res.status(401).send("Please register!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// DELETE; Accepts requests to delete a bookmark from a specified recipe
/*
 * Request body is empty; Request must contain valid user cookie, because only logged in users are allowed to rate recipes
 * Responds with status code 401 if originator could not be authenticated
 * Responds with status code 200 if bookmark was deleted successfully
 */
app.delete("/api/recipes/:id/save", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      // User is authenticated
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
      // User is unauthenticated
      res.status(401).send("Please register!");
    }
  } catch {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// GET; Accepts requests to get a specified recipe
/*
 * Request body is empty; Request can contain valid user cookie, because only logged in users can see whether they bookmarked/rated the recipe
 * Responds with status code 404 if the requested recipe could not be found
 * Responds with status code 200 and the requested recipe if retrieval was successful
 */

app.get("/api/recipes/:id", async (req, res) => {
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
        "tags": [],
        "comments": []
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
      ); // Check if database has an entry for a bookmark for this recipe/user combination
      if (isBookmarked.rows[0]) {
        recipe.isBookmarked = 1;
      }

      const isRated = await pool.query(
        "SELECT recipe_ratings.rating FROM recipe_ratings WHERE userid = $1 AND recipeid = $2",
        [user.rows[0].userid, id]
      ); // Check if database has an entry for a rating for this recipe/user combination
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
      // Add average rating to response
      recipe.avgRating = avgRating.rows[0].avg;
      // Get comments
      const comments = await pool.query(
        "SELECT recipe_comments.commentid, recipe_comments.comment, users.username  FROM recipes INNER JOIN recipe_comments ON recipe_comments.recipeid = recipes.recipeid INNER JOIN users ON recipe_comments.userid=users.userid WHERE recipes.recipeid = $1 ORDER BY recipe_comments.commentid DESC",
        [id]
      );
      // Add comments to template
      recipe.comments = JSON.parse(JSON.stringify(comments.rows));
      // Get tags
      const tags = await pool.query(
        "SELECT tags.name FROM recipes LEFT JOIN recipe_tags ON recipe_tags.recipeid = recipes.recipeid LEFT JOIN tags ON tags.tagid = recipe_tags.tagid WHERE recipes.recipeid = $1",
        [id]
      );
      // Add tags to template
      recipe.tags = JSON.parse(JSON.stringify(tags.rows));
      // Get instructions
      const instructions = await pool.query(
        "SELECT recipe_instructions.step, recipe_instructions.instruction, recipe_instructions.instruction_image FROM recipes LEFT JOIN recipe_instructions ON recipe_instructions.recipeid = recipes.recipeid WHERE recipes.recipeid = $1 ORDER BY step ASC",
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
      console.debug(recipe); // Uncomment for debug
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

// DELETE; Accepts requests to delete a recipe with the specified ID
/*
 * Request body is empty; Request must contain valid user cookie and this cookie must correspond to the author of the recipe, because only authors are allowed to delete their recipes
 * Responds with status code 404 if the requested recipe could not be found or 401 if user could not be authenticated
 * Responds with status code 200 if the removal was successful
 */
app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      // User is authenticated
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
        // User is not authenticated
        res.status(401).send("Please register!");
      }
    } else {
      // User is authenticated but not authorized to delete this recipe
      res.status(401).send("Not authorized to delete this recipe!");
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Something went wrong!");
  }
});

// GET; Accepts requests to a users personal user page
/*
 * Request body is empty;
 * Responds with status code 404 if the user does not exist
 * Responds with status code 200 and the user information otherwise
 */
app.get("/api/user/:username", async (req, res) => {
  try {
    const { username } = req.params; // for use later to grab the user_id, then all the other related user details

    const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
      username,
    ]); // Retrieve the user from the database

    if (user.rows[0]) {
      // User exists
      const id = user.rows[0].userid; // Get the userid

      let userInfo = await pool.query(
        "SELECT * FROM user_info WHERE UserID = $1",
        [id]
      ); // Get the user profile info

      let headerData = {
        bio: userInfo.rows[0].bio,
        image: userInfo.rows[0].imagepath,
      }; // User page header data

      // Get all recipes reviewed by this user
      const reviewedRecipes = await pool.query(
        "SELECT recipes.* FROM recipes WHERE recipes.recipeid IN (SELECT recipeid FROM recipe_ratings WHERE userid = $1) ORDER BY recipes.recipeid DESC",
        [id]
      );

      // Get all recipes uploaded by this user
      const uploadedRecipes = await pool.query(
        "SELECT * FROM recipes WHERE UserID = $1 ORDER BY recipeid DESC",
        [id]
      );

      // Get all recipes saved by this user
      const savedRecipes = await pool.query(
        "SELECT recipes.* FROM recipes WHERE recipes.recipeid IN (SELECT recipeid FROM recipe_bookmarks WHERE userid = $1) ORDER BY recipes.recipeid DESC",
        [id]
      );

      let recipes = {
        reviewed: reviewedRecipes.rows,
        saved: savedRecipes.rows,
        uploaded: uploadedRecipes.rows,
      }; // construct recipe part of the response

      let userData = {
        headerData: headerData,
        recipes: recipes,
      }; // Construct complete response

      // console.debug(userData); // Uncomment for debug

      res.status(200).json(userData);
    } else {
      // User does not exist
      res.status(404).json("User does not exist!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// PUT; Accepts requests to update user bio + pfp
/*
 * Request body contains bio and image field;
 * Responds with status code 401 if the user is not authenticated
 * Responds with status code 201 if the user info was updated properly
 */

app.put(
  "/api/userdata",
  upload.fields([
    { name: "bio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const cookie = req.signedCookies.authentication; // Get authentication cookie from requests
      if (cookie) {
        // User is authenticated
        let imagePath = null;
        if (req.files.image) imagePath = req.files.image[0].path; // Request contains image

        const user = await pool.query(
          "SELECT * FROM users WHERE users.Username = $1",
          [cookie]
        ); // Get user from database
        let userid = user.rows[0].userid; // Get userid

        let userInfo = await pool.query(
          "SELECT * FROM user_info WHERE UserID = $1",
          [userid]
        ); // Get userinfo from database

        if (imagePath) {
          // Request contains a new profile image
          const result = await s3.uploadFile(req.files.image[0]);
          userInfo = await pool.query(
            "UPDATE user_info SET imagepath = $1, bio = $2 WHERE userid = $3",
            [result.Location, req.body.bio, userid]
          ); // Update user info in the database
        } else {
          // Requests contains no new profile image
          userInfo = await pool.query(
            "UPDATE user_info SET bio = $1 WHERE userid = $2",
            [req.body.bio, userid]
          ); // Update user infor in the database
        }

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

//GET; Accepts requests to fetch user data *after* it's been updated by the user
/*
 * Request body is empty;
 * Responds with status code 200 and the related user data
 */

app.get("/api/userdata/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await pool.query(
      "SELECT * FROM users WHERE users.Username = $1",
      [username]
    );

    let userid = user.rows[0].userid;

    let userInfo = await pool.query(
      "SELECT * FROM user_info WHERE UserID = $1",
      [userid]
    );

    let headerData = {
      bio: userInfo.rows[0].bio,
      image: userInfo.rows[0].imagepath,
    };

    res.status(200).json(headerData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

// GET; Accepts requests for fetching 3 recipe recommendations based on bookmark count
/*
 * Request body is empty;
 * Responds with status code 200 and the recommended recipes
 */
app.get("/api/recommendations", async (req, res) => {
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

// POST; Accepts requests for posting comments to a recipe
/*
 * Request body contains the comment; Request must contain valid user cookie, because only logged in users are allowed to comment on recipes
 * Responds with status code 401 if user could not be authenticated
 * Responds with status code 201 and the newly created comment, if creation was successful
 */
app.post("/api/recipes/:id/comment", async (req, res) => {
  try {
    const cookie = req.signedCookies.authentication; // retrieve authentication cookie from request
    if (cookie) {
      // User is authenticated
      const { id } = req.params; // Retrieve recipeid from url
      const user = await pool.query("SELECT * FROM users WHERE Username = $1", [
        cookie,
      ]); // Query database for user
      const { comment } = req.body; // Get comment from request body
      const newComment = await pool.query(
        "INSERT INTO recipe_comments (RecipeID, UserID, Comment) VALUES ($1, $2, $3) RETURNING *",
        [id, user.rows[0].userid, comment]
      ); // Insert new comment into recipe_comments table
      // Respond with new comment
      res.status(201).json({
        commentid: newComment.rows[0].commentid,
        author: cookie,
        comment: newComment.rows[0].comment,
      });
    } else {
      res.status(401).send("Please register!");
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something went wrong!");
  }
});

app.use("/*", express.static(path.join(__dirname, "../client/build")));

app.listen(port, () => {
  console.log(`server has started on port ${port}`);
});
