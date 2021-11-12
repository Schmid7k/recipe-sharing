import React, { Fragment } from "react";

//components
import NavigationBar from "../components/NavBar/NavBar";
import IndividualRecipe from "../components/IndividualRecipe/IndividualRecipe";

const Recipe = () => {
  return (
    <Fragment>
      <NavigationBar />
      <div className="container-fluid">
        <div className="container pt-3">
            <IndividualRecipe />
        </div>
      </div>
    </Fragment>
  );
}

export default Recipe;