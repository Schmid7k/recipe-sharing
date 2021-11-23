CREATE DATABASE recipesharing;

CREATE TABLE users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(32) UNIQUE NOT NULL,
    Pass VARCHAR(128) NOT NULL
);

CREATE TABLE recipes (
    RecipeID SERIAL PRIMARY KEY,
    UserID integer REFERENCES users ON DELETE SET NULL,
    MainImage VARCHAR(1024),
    Title VARCHAR(64) NOT NULL,
    AdditionalInstructions VARCHAR(1024)
);

CREATE TABLE categories (
    categoryID SERIAL PRIMARY KEY,
    Name VARCHAR(128) UNIQUE
);

CREATE TABLE recipe_categories (
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    categoryID integer REFERENCES categories ON DELETE CASCADE,
    PRIMARY KEY ( RecipeID, categoryID )
);

CREATE TABLE tags (
    tagID SERIAL PRIMARY KEY,
    Name VARCHAR(32) UNIQUE
);

CREATE TABLE recipe_tags (
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    tagID integer REFERENCES tags ON DELETE CASCADE,
    PRIMARY KEY ( RecipeID, tagID )
);

CREATE TABLE recipe_instructions (
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    Step integer NOT NULL,
    Instruction VARCHAR(1024),
    Instruction_Image VARCHAR(1024),
    PRIMARY KEY ( RecipeID, Step )
);

CREATE TABLE ingredient_groups (
    groupID SERIAL,
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    Name VARCHAR(64),
    PRIMARY KEY ( RecipeID, groupID )
);

CREATE TABLE ingredients (
    ingredientsID SERIAL PRIMARY KEY,
    Name VARCHAR(128) UNIQUE
);

CREATE TABLE recipe_ingredients (
    Amount VARCHAR(64),
    ingredientsID integer REFERENCES ingredients ON DELETE CASCADE,
    RecipeID integer,
    groupID integer,
    PRIMARY KEY ( ingredientsID, RecipeID, groupID ),
    FOREIGN KEY (RecipeID, groupID) REFERENCES ingredient_groups(RecipeID, groupID) ON DELETE CASCADE
);

CREATE TABLE recipe_bookmarks (
    RecipeID integer REFERENCES recipes ON DELETE CASCADE,
    UserID integer REFERENCES users ON DELETE CASCADE,
    PRIMARY KEY ( RecipeID, UserID)
);

CREATE TABLE user_info (
    infoID SERIAL PRIMARY KEY,
    UserID integer REFERENCES users ON DELETE SET NULL,
    imagePath VARCHAR(1024),
    bio VARCHAR(1024)
);