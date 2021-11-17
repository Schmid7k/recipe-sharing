import React, { Fragment } from "react";
import { useParams } from 'react-router-dom'

//components
import NavigationBar from "../components/NavBar/NavBar";
import IndividualRecipe from "../components/IndividualRecipe/IndividualRecipe";

const Recipe = () => {
    const { id } = useParams();
    return (
        <Fragment>
        <NavigationBar />
        <div className="container-fluid">
            <div className="container pt-3">
                <IndividualRecipe id={id} />
            </div>
        </div>
        </Fragment>
    );
}

export default Recipe;