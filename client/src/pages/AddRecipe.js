import React, { Fragment } from "react";

//components
import NavigationBar from "../components/NavBar/NavBar";
import RecipeForm from "../components/RecipeForm/RecipeForm";

const AddRecipe = () => {
  return (
    <Fragment>
      <NavigationBar />
      <div className="container-fluid">
        <div className="container pt-3">
            <RecipeForm />
        </div>
      </div>
    </Fragment>
  );
}

export default AddRecipe;