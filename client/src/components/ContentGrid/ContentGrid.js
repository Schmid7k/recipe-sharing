import React from "react";

import ContentGridCard from "./ContentGridCard/ContentGridCard";
import recipes from "../../grid-placeholder-data.json";

import "./ContentGrid.css"

class ContentGrid extends React.Component {

    constructor(){
        super();

        this.state = {
            recipeCards: []
        }
    }

    // TEMP: fetch some recipe data to construct the array of cards
    // could move to a higher level component that just manages what the grid should display
    componentDidMount(){
        let recipeCards = [];

        recipes.recipes.forEach((recipe, idx) => {
            recipeCards.push(<ContentGridCard title={recipe.title} img={recipe.img} key={idx}/>);
        });

        this.setState({
            recipeCards: recipeCards
        });
    }

    render(){
        return (
            <div className="content-grid-container">
                {this.state.recipeCards}
            </div>    
        )
    } 
}

export default ContentGrid;