CREATE DATABASE recipesharing;

CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    Username VARCHAR(32) UNIQUE NOT NULL,
    Pass VARCHAR(32) NOT NULL
);

CREATE TABLE Recipes (
    RecipeID SERIAL PRIMARY KEY,
    UserID int,
    MainImage VARCHAR(1024),
    Title VARCHAR(128) NOT NULL,
    AdditionalInstructions VARCHAR(1024),
    CONSTRAINT fk_user
        FOREIGN KEY(UserID)
            REFERENCES Users(UserID)
            ON DELETE SET NULL
);

/*
Currently here
*/
CREATE TABLE Recipe_Ingredients (
    Amount VARCHAR(128),
    Unit VARCHAR(128),
    RecipeID int NOT NULL FOREIGN KEY REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    IngredientID int NOT NULL FOREIGN KEY REFERENCES Ingredients(IngredientID) ON DELETE CASCADE,
    PRIMARY KEY CLUSTERED ( RecipeID, IngredientID )
);

CREATE TABLE Ingredients (
    IngredientID int NOT NULL IDENTITY PRIMARY KEY,
    Name VARCHAR(256)
);

CREATE TABLE Recipe_Categories (
    RecipeID int NOT NULL FOREIGN KEY REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    CategoryID int NOT NULL FOREIGN KEY REFERENCES Categories(CategoryID) ON DELETE CASCADE,
    PRIMARY KEY CLUSTERED ( RecipeID, CategoryID )
);

CREATE TABLE Categories (
    CategoryID int NOT NULL IDENTITY PRIMARY KEY,
    Name VARCHAR(256)
);

CREATE TABLE Recipe_Tags (
    RecipeID int NOT NULL FOREIGN KEY REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    TagID int NOT NULL FOREIGN KEY REFERENCES Tags(TagID) ON DELETE CASCADE,
    PRIMARY KEY CLUSTERED ( RecipeID, TagID )
);

CREATE TABLE Tags (
    TagID int NOT NULL IDENTITY PRIMARY KEY,
    Name VARCHAR(256)
);

CREATE TABLE Recipe_Instructions (
    RecipeID int NOT NULL FOREIGN KEY REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    Step int NOT NULL,
    Instruction VARCHAR(1024),
    Instruction_Image VARCHAR(1024),
    PRIMARY KEY (RecipeID)
);

CREATE TABLE Ingredient_Groups (
    RecipeID int NOT NULL FOREIGN KEY REFERENCES Recipes(RecipeID) ON DELETE CASCADE,
    Name VARCHAR(512),
    PRIMARY KEY (RecipeID)
)