const pool = require("./db");
const s3 = require("./s3");

// Helper function that saves instructions to the instruction database

async function saveInstructions(instructions, images, stepImages, recipeID) {
  try {
    var counter = 0;
    Object.entries(instructions).forEach(async (instruction) => {
      const [step, description] = instruction;
      var imagePath = "";
      if (stepImages[step]) {
        const image = images[counter];
        counter += 1;
        console.log("Uploading:" + image);
        const result = await s3.uploadFile(image);
        imagePath = result.Location;

        await pool.query(
          "INSERT INTO recipe_instructions (RecipeID, Step, Instruction, Instruction_Image) VALUES($1, $2, $3, $4) RETURNING *",
          [recipeID, step, description, imagePath]
        );
      } else {
        await pool.query(
          "INSERT INTO recipe_instructions (RecipeID, Step, Instruction, Instruction_Image) VALUES($1, $2, $3, $4) RETURNING *",
          [recipeID, step, description, ""]
        );
      }
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
      tag = tag.toLowerCase();
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
      const ingredient = entry.ingredient.toLowerCase();

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

module.exports = {
  saveInstructions,
  saveTags,
  saveCategories,
  saveGroups,
};
