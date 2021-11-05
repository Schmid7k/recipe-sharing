CREATE DATABASE recipesharing;

CREATE TABLE users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(32) UNIQUE NOT NULL,
    Pass VARCHAR(32) NOT NULL
);

CREATE TABLE recipes (
    RecipeID SERIAL PRIMARY KEY,
    UserID integer REFERENCES users ON DELETE SET NULL,
    MainImage VARCHAR(1024),
    Title VARCHAR(64) NOT NULL,
    AdditionalInstructions VARCHAR(1024)
);

CREATE TABLE ingredients (
    IngredientID SERIAL PRIMARY KEY,
    Name VARCHAR(128)
);

CREATE TABLE Recipe_Ingredients (
    Amount VARCHAR(64),
    Unit VARCHAR(64),
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    IngredientID integer REFERENCES ingredients ON DELETE CASCADE,
    PRIMARY KEY ( RecipeID, IngredientID )
);

CREATE TABLE categories (
    CategoryID SERIAL PRIMARY KEY,
    Name VARCHAR(128)
);

CREATE TABLE recipe_categories (
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    CategoryID integer REFERENCES categories ON DELETE CASCADE,
    PRIMARY KEY ( RecipeID, CategoryID )
);

CREATE TABLE tags (
    TagID SERIAL PRIMARY KEY,
    Name VARCHAR(32)
);

CREATE TABLE recipe_tags (
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    TagID integer REFERENCES tags ON DELETE CASCADE,
    PRIMARY KEY ( RecipeID, TagID )
);

CREATE TABLE recipe_instructions (
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    Step integer NOT NULL,
    Instruction VARCHAR(1024),
    Instruction_Image VARCHAR(1024),
    PRIMARY KEY (RecipeID)
);

CREATE TABLE ingredient_groups (
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    Name VARCHAR(64),
    PRIMARY KEY (RecipeID)
);