import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./IndividualRecipe.css";
import bookmarkIcon from "../../images/bookmark_svg.svg";
import starIcon from "../../images/star_svg.svg";
import recipeInfo from "../../recipe-placeholder-data.json";

import {withRouter} from 'react-router-dom';
import { Link } from 'react-router-dom'

/**
 * Component for rendering a recipe image.
 * @param {string} source The source for the image file
 * @param {string} alternative Alternative text for the image if it doesn't render
 * @returns A img element styled with .recipe-image that uses the provided source and alternative.
 */
const RecipeImage = ({ source, alternative }) => {
    return (
        <Fragment>
            <img className="recipe-image" src={`/${source}`} alt={alternative} />
        </Fragment>
    );
}

RecipeImage.propTypes = {
    source: PropTypes.string.isRequired,
    alternative: PropTypes.string.isRequired,
};

/**
 * Component for rendering the recipe header that includes the name of the dish, username for the submitter,
 * recipe category, bookmarks and star rating.
 * @param {string} name Name of recipe to be displayed
 * @param {string} author Username of the submitter to be displayed
 * @param {string} category Category of the recipe to be displayed
 * @param {number} bookmarks Number of bookmarks for the recipe
 * @param {number} stars Star rating of the recipe
 * @returns A .recipe-title div that contains .recipe-title-text and .recipe-title-icons divs.
 *          .recipe-title-text div contains headers for the name of the dish, the author and the category.
 *          .recipe-title-icons div contains the bookmark count and star rating and image icons for those 
 *          displayed next to them.
 */
const RecipeHeader = ({ name, author, category, bookmarks, stars }) => {
    let userLink = `/user/${author}`;
    return (
      <Fragment>
        <div className="recipe-title">
            <div className="recipe-title-text">
                <h1>{name}</h1>
                <Link to={userLink} style={{textDecoration: 'none'}}><h4>@{author}</h4></Link>
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

/**
 * Component for rendering a single tag.
 * @param {string} name Name of the tag to be shown on the tag 
 * @returns A styled .recipe-tag div with the tag name as content.
 */
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

/**
 * Component for rendering a list of tags.
 * @param {Array[string]} tags Array of tags to be rendered
 * @returns A styled .recipe-tag-list div with RecipeTag elements inside it.
 */
const RecipeTagList = ({ tags }) => {
    return (
        <Fragment>
            <div className="recipe-tag-list">
                {tags.map(tag => <RecipeTag name={tag} key={`${tag}-tag`} />)}
            </div>
        </Fragment>
    );
};

RecipeTagList.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

/**
 * Component for rendering a single ingredient.
 * @param {string} name The name of the ingredient
 * @param {string} amount The amount of the ingredient including the unit
 * @returns A styled .recipe-ingredient div with two styled divs inside it, .recipe-ingredient-name div with the name
 *          as content and .recipe-ingredient-amount with the amount as content.
 */
const RecipeIngredient = ({ ingredient, amount }) => {
    return (
      <Fragment>
            <div className="recipe-ingredient">
                <div className="recipe-ingredient-name">
                    {ingredient}
                </div>
                <div className="recipe-ingredient-amount">
                    {amount}
                </div>
            </div>
      </Fragment>
    );
};

RecipeIngredient.propTypes = {
    ingredient: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
};

/**
 * Component for rendering a list of ingredients.
 * @param {string}  group   Name of the current ingredient subgroup
 * @param {Array[Object]} ingredients Array of ingredients where every element inside it should be of format
 *                                    { name: 'Ingredient name', amount: 'Ingredient amount' }
 * @returns A .recipe-ingredients-list div containing RecipeIngredient elements. 
 *          If the group rendered is not "Default", the group name header is included above the .recipe-ingredients-list div.
 */
 const RecipeIngredientList = ({ group, ingredients }) => {
    return (
        <Fragment>
            {group !== "Default" ? <h5>{group}</h5> : null}
            <div className="recipe-ingredients-list">
                {ingredients.map(ingredient => 
                    <RecipeIngredient   ingredient={ingredient.ingredient} amount={ingredient.amount} 
                                        key={`${group}-ingredient-${ingredient.ingredient}`} />
                )}
            </div>
        </Fragment>
    );
};

RecipeIngredientList.propTypes = {
    group: PropTypes.string.isRequired,
    ingredients: PropTypes.arrayOf(PropTypes.shape({
        ingredient: PropTypes.string.isRequired,
        amount: PropTypes.string.isRequired,
    })).isRequired,
};

/**
 * Component for rendering a list of ingredient groups.
 * @param {Array[Object]} ingredient Array of ingredient groups where every element inside it should have the format of
 *                                   { name: 'Group name', ingredients: [ name: 'Ingredient name', amount: 'Ingredient amount'] }
 * @returns A .recipe-element div element containing a header and a .recipe-ingredients div.
 *          .recipe-ingredients div contains RecipeIngredientList elements.
 */
 const RecipeIngredientGroups = ({ ingredients }) => {
    return (
        <Fragment>
            <div className="recipe-element">
                <h3>Ingredients</h3>
                <div className="recipe-ingredients">
                    {ingredients.map(group => 
                        <RecipeIngredientList   group={group.name} 
                                                ingredients={group.ingredients} key={group.name} />
                    )}
                </div>
            </div>
        </Fragment>
    );
};

RecipeIngredientGroups.propTypes = {
    ingredients: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string.isRequired,
            ingredients: PropTypes.arrayOf(
                PropTypes.shape({
                    ingredient: PropTypes.string.isRequired,
                    amount: PropTypes.string.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
};



/**
 * Component for rendering a single instruction.
 * @param {number} step Step number of the instruction
 * @param {string} description The description for the current instrucion step
 * @returns A styled .recipe-instruction div with a header that has the step and a styled 
 *          .recipe-instruction-description div with the step description as content.
 */
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

/**
 * Component for rendering a list of instructions.
 * @param {Array[Object]} instructions Array of instructions to be rendered
 * @returns A .recipe-element div with a header and a styled .recipe-instructions-list div containing 
 *          RecipeInstruction elements inside it.
 */
 const RecipeInstructionList = ({ instructions }) => {
    return (
        <Fragment>
            <div className="recipe-element">
                <h3>Instructions</h3>
                <div className="recipe-instructions-list">
                    {instructions.map((instruction, idx) => 
                        <RecipeInstruction step={instruction.step} description={instruction.instruction} key={idx} />
                    )}
                </div>
            </div>
        </Fragment>
    );
};

RecipeInstructionList.propTypes = {
    instructions: PropTypes.arrayOf(PropTypes.shape({
        step: PropTypes.number.isRequired,
        instruction: PropTypes.string.isRequired,
    })).isRequired,
};

/**
 * Component for rendering the header 'Additional instructions' and the additional instructions itself
 * @param {string} description  The content that should be shown under Additional instructions 
 * @returns A .recipe-element div with a header and a styled .recipe-additional-instructions div containing 
 *          the content of description prop inside it.
 */
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

RecipeAdditionalInstructions.propTypes = {
    description: PropTypes.string.isRequired,
};

/**
 * Component to render an individual recipe.
 * Stores all the relevant recipe data in its state, this.state.
 * @param   {string}  this.props.id   The recipe of the recipe being rendered by IndividualRecipe
 * @returns The whole recipe as a component using child components to render the parts inside it.
 */
class IndividualRecipe extends React.Component {
    constructor(){
        super();
    
        this.state = {
            header: {
                name: "",
                author: "",
                category: "",
                bookmarks: 0,
                stars: 0
            },
            image: {
                source: "",
                alternative: "",
            },
            additionalInstructions: "",
            tags: [],
            ingredients: [],
            instructions: [],
            recipe: {
            }
        }

        this.handleSettingRecipeData = this.handleSettingRecipeData.bind(this);
    }

    handleSettingRecipeData(data) {
        //TODO: no need if the path returns the image, but getting double \\ for some reason in path
        data.main = data.main.replace(/\\\\/g, '\\');

        // extract tags
        let tags = [];
        data.tags.forEach(element => {
            tags.push(element.name);
        });

        // extract and format ingredient groups
        let dataGroups = [];
        Object.keys(data.groups).forEach(key => {
            dataGroups.push({
                name: key,
                ingredients: data.groups[key]
            });
        });

        this.setState({
            header: {
                name: data.title,
                author: recipeInfo.recipeInfo.username, // TODO: add username to fetch results
                category: data.category,
                bookmarks: recipeInfo.recipeInfo.bookmarks, // TODO: need to fetch bookmarks and stars (display differently if a user is logged in and already done this?)
                stars: recipeInfo.recipeInfo.stars
            },
            image: {
                source: data.main, 
                alternative: data.title
            },
            additionalInstructions: data.addInstructions,
            tags: tags,
            ingredients: dataGroups,
            // TODO: we're not taking care of the instructions_image for per step images
            // possibly just add onto backburner for now
            instructions: data.instructions
        })
    }

    componentDidMount(){
       const recipe_id = this.props.match.params.id;
       fetch(`http://localhost:5000/recipes/${recipe_id}`, {method: 'GET'}) //TODO: we should set a proxy and just use a /path instead of the full path
       .then(res => res.json())
       .then(res => this.handleSettingRecipeData(res))
       .catch(err => this.props.history.push('/')) // TODO: should we have a simple 404 page or just redirect to home?
    }

    render(){
        return (
            <Fragment>
                <div className="recipe-container">
                    <div className="recipe-column-left">
                        <RecipeImage source={this.state.image.source} alternative={this.state.image.alternative} />
                        <RecipeTagList tags={this.state.tags} />
                    </div>
                    <div className="recipe-column-right">
                        <RecipeHeader   name={this.state.header.name} author={this.state.header.author} 
                                        category={this.state.header.category} bookmarks={this.state.header.bookmarks} 
                                        stars={this.state.header.stars} />
                        <RecipeIngredientGroups ingredients={this.state.ingredients} />
                        <RecipeInstructionList instructions={this.state.instructions} />
                        <RecipeAdditionalInstructions description={this.state.additionalInstructions} />
                    </div>
                </div>
            </Fragment>
        );
    }
};

export default withRouter(IndividualRecipe);