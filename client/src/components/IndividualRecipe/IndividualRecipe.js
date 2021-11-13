import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./IndividualRecipe.css";
import bookmarkIcon from "../../images/bookmark_svg.svg";
import starIcon from "../../images/star_svg.svg";
import recipeInfo from "../../recipe-placeholder-data.json";

const RecipeImage = ({ source, alternative }) => {
    return (
        <Fragment>
            <img className="recipe-image" src={source} alt={alternative} />
        </Fragment>
    );
}

RecipeImage.propTypes = {
    source: PropTypes.string.isRequired,
    alternative: PropTypes.string.isRequired,
};

const RecipeHeader = ({ name, author, category, bookmarks, stars }) => {
    return (
      <Fragment>
        <div className="recipe-title">
            <div className="recipe-title-text">
                <h1>{name}</h1>
                <h4>@{author}</h4>
                <h6>Category: {category}</h6>
            </div>
            <div className="recipe-title-icons">
                <h2>
                    {bookmarks}<img className="recipe-title-icon" src={bookmarkIcon} alt="Stars" /> 
                    {stars}<img className="recipe-title-icon" src={starIcon} alt="Stars" />
                </h2>
            </div>
        </div>
      </Fragment>
    );
};

RecipeHeader.propTypes = {
    name: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    bookmarks: PropTypes.number.isRequired,
    stars: PropTypes.number.isRequired,
};

const RecipeTag = ({ name }) => {
    return (
      <Fragment>
        <div className="recipe-tag">
            {name}
        </div>
      </Fragment>
    );
};

RecipeTag.propTypes = {
    name: PropTypes.string.isRequired,
};

const RecipeIngredient = ({ name, amount, unit }) => {
    return (
      <Fragment>
            <div className="recipe-ingredient">
                <div className="recipe-ingredient-name">
                    {name}
                </div>
                <div className="recipe-ingredient-amount">
                    {amount} {unit}
                </div>
            </div>
      </Fragment>
    );
};

RecipeIngredient.propTypes = {
    name: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
};

const RecipeInstruction = ({ step, description }) => {
    return (
      <Fragment>
        <div className="recipe-instruction">
            <h5>Step {step}</h5>
            <div className="recipe-instruction-description">
                {description}
            </div>
        </div>
      </Fragment>
    );
};

RecipeInstruction.propTypes = {
    step: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
};

const RecipeAdditionalInstructions = ({ description }) => {
    return (
      <Fragment>
            <div className="recipe-element">
                <h3>Additional instructions</h3>
                <div className="recipe-additional-instructions">
                    {description}
                </div>
            </div>
      </Fragment>
    );
};


class IndividualRecipe extends React.Component {
    constructor(){
        super();
    
        this.state = {
            recipe: {}
        }
    }

    componentDidMount(){
        let recipe = {
            header: <RecipeHeader name={recipeInfo.recipeInfo.title} author={recipeInfo.recipeInfo.username} category={recipeInfo.recipeInfo.category} bookmarks={recipeInfo.recipeInfo.bookmarks} stars={recipeInfo.recipeInfo.stars} />,
            img: <RecipeImage source={recipeInfo.recipeInfo.image} alternative={recipeInfo.recipeInfo.title} />,
            additionalInstructions: <RecipeAdditionalInstructions description={recipeInfo.recipeInfo.additionalInstructions} />,
            tags: [],
            defaultIngredients: [],
            subgroups: [],
            instructions: []
        };

        recipeInfo.recipeInfo.tags.forEach((tag, idx) => {
            recipe.tags.push( <RecipeTag name={tag.name} key={idx} /> );
        });

        recipeInfo.recipeInfo.ingredients.defaultIngredients.forEach((ingredient, idx) => {
            recipe.defaultIngredients.push( <RecipeIngredient name={ingredient.name} amount={ingredient.amount} unit={ingredient.unit} key={idx} /> );
        });

        recipeInfo.recipeInfo.ingredients.subgroups.forEach((group, gidx) => {
            recipe.subgroups.push( 
                <div key={gidx}>
                    <h5>{group.name}</h5>
                    <div className="recipe-ingredients-list">
                        {group.groupIngredients.map((ingredient, idx) => (<RecipeIngredient name={ingredient.name} amount={ingredient.amount} unit={ingredient.unit} key={idx} />))}
                    </div>
                </div>
            );
        });

        recipeInfo.recipeInfo.instructions.forEach((instruction, idx) => {
            recipe.instructions.push( <RecipeInstruction step={instruction.step} description={instruction.description} key={idx} /> );
        });

        this.setState({
            recipe: recipe
        });
    }

    render(){
        return (
            <Fragment>
                <div className="recipe-container">

                    <div className="recipe-column-left">

                        {this.state.recipe.img}

                        <div className="recipe-tag-list">
                            {this.state.recipe.tags}
                        </div>

                    </div>

                    <div className="recipe-column-right">

                        {this.state.recipe.header}

                        <div className="recipe-element">
                            <h3>Ingredients</h3>
                            <div className="recipe-ingredients">
                                <div className="recipe-ingredients-list">
                                    {this.state.recipe.defaultIngredients}
                                </div>
                                {this.state.recipe.subgroups}
                            </div>
                        </div>

                        <div className="recipe-element">
                            <h3>Instructions</h3>
                            <div className="recipe-instructions-list">
                                {this.state.recipe.instructions}
                            </div>
                        </div>

                        {this.state.recipe.additionalInstructions}

                    </div>

                </div>
            </Fragment>
        );
    }
};

export default IndividualRecipe;