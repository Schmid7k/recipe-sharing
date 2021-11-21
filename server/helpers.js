const pool = require("./db");
const path = require("path");
const fs = require("fs");

// Helper function that saves instructions to the instruction database

async function saveInstructions(instructions, images, recipeID) {
  try {
    var counter = 0;
    Object.entries(instructions).forEach(async (instruction) => {
      const newPath = renameImagePath(
        images[counter].path,
        recipeID,
        counter + 1
      );
      counter += 1;
      const [step, description] = instruction;
      await pool.query(
        "INSERT INTO recipe_instructions (RecipeID, Step, Instruction, Instruction_Image) VALUES($1, $2, $3, $4) RETURNING *",
        [recipeID, step, description, newPath]
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

function renameImagePath(oldPath, recipeID, index) {
  const newPath = path.dirname(oldPath) + "/" + recipeID + "_" + index; // To rename the image paths

  fs.rename(oldPath, newPath, (err) => {
    if (err) console.error("Error while renaming file path: ", +err);
  });

  return newPath;
}

module.exports = {
  saveInstructions,
  saveTags,
  saveCategories,
  saveGroups,
  renameImagePath,
};
