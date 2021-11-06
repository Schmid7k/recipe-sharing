import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./RecipeForm.css";

const NameInput = () => {
    return (
      <Fragment>
        <div className="form-group recipe-element">
            <label htmlFor="recipeNameInput"><h5>Name of the dish</h5></label>
            <input type="text" className="form-control" id="recipeNameInput" placeholder="Enter the name of the dish..." />
        </div>
      </Fragment>
    );
};

const CategorySelection = () => {
    return (
      <Fragment>
        <div className="recipe-element">
            <h5><label htmlFor="categories-select">Category</label></h5>
            <select name="categories" id="categories-select" className="form-select" defaultValue="placeholder">
                <option value="placeholder" disabled hidden>Select a category</option>
                <option value="appetizers">Appetizers</option>
                <option value="maindishes">Main Dishes</option>
                <option value="snacks">Snacks</option>
                <option value="sidedishes">Side Dishes</option>
                <option value="desserts">Desserts</option>
            </select>
        </div>
      </Fragment>
    );
};

const ImageUploader = () => {
    return (
      <Fragment>
            <div className="recipe-element">
                <h5>Image of the dish</h5>
                <div className="form-group image-uploader-container">
                    <input type="file" className="form-control-file" id="dishImageFileInput" />
                </div>
            </div>
      </Fragment>
    );
};

const Ingredient = ({ name, amount, unit }) => {
    return (
    <Fragment>
            <li className="list-group-item list-ingredient-container">
                <div className="list-ingredient-name">
                    {name}
                </div>
                <div className="list-ingredient-amount float-end">
                    {amount} {unit}
                </div>
            </li>
      </Fragment>
    );
};

Ingredient.propTypes = {
    name: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
};

const IngredientList = () => {
    return (
      <Fragment>
            <ul className="list-group">
                <Ingredient name="Ingredient 1" amount="100" unit="g"/>
                <Ingredient name="Ingredient 2" amount="200" unit="ml"/>
                <Ingredient name="Ingredient 3" amount="2" unit="pcs"/>
                <li className="list-group-item list-button">+ Add a new ingredient</li>
            </ul>
      </Fragment>
    );
};

const IngredientSubgroup = ({ name }) => {
    return (
      <Fragment>
            <div className="ingredient-subgroup">
                <h6>{name} <button type="button" className="btn-close btn-close-custom" aria-label="Close"></button></h6>
                <IngredientList />
            </div>
      </Fragment>
    );
};

IngredientSubgroup.propTypes = {
    name: PropTypes.string.isRequired,
};

const IngredientInput = () => {
    return (
      <Fragment>
            <div className="recipe-element">
                <h5>Ingredients</h5>
                <IngredientList />
                <IngredientSubgroup name="Subgroup name" />
                <button className="btn btn-secondary-custom mt-1">+ Add a new ingredient group</button>
            </div>
      </Fragment>
    );
};

const InstructionsStep = ({ number, description }) => {
    return (
      <Fragment>
            <div className="list-instructions-step">
                <div className="instructions-step-start">{number}.</div>
                <ul className="list-group"><li className="list-group-item">{description}</li></ul>
                <div className="instructions-step-end">
                    <button type="button" className="btn-close btn-close-custom" aria-label="Close"></button>
                </div>
            </div>
      </Fragment>
    );
};

InstructionsStep.propTypes = {
    number: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

const InstructionsInput = () => {
    return (
      <Fragment>
            <div className="recipe-element">
                <h5>Instructons</h5>
                <InstructionsStep number="1" description="First step description." />
                <InstructionsStep number="2" description="Second step description." />
                <InstructionsStep number="3" description="Third step description." />
                <button className="btn btn-secondary-custom mt-1">+ Add a new step</button>
            </div>
      </Fragment>
    );
};

const AdditionalInstructionsInput = () => {
    return (
      <Fragment>
            <div className="form-group recipe-element">
                <label htmlFor="additionalInstructionsInput"><h5>Additional Instructions</h5></label>
                <textarea className="form-control" id="additionalInstructionsInput" rows="2" placeholder="Enter the tags of the dish separated by ';' ..."></textarea>
            </div>
      </Fragment>
    );
};

const TagInput = () => {
    return (
      <Fragment>
        <div className="form-group recipe-element">
            <label htmlFor="recipeTagInput"><h5>Tags</h5></label>
            <input type="text" className="form-control" id="recipeTagInput" placeholder="Enter the tags of the dish separated by ';' ..." />
        </div>
      </Fragment>
    );
};

const RecipeForm = () => {
  return (
    <Fragment>
      <div className="recipe-form-container text-center">
        <h1>Add a new recipe</h1>
        <form>
            <NameInput />
            <CategorySelection />
            <ImageUploader />
            <IngredientInput />
            <InstructionsInput />
            <AdditionalInstructionsInput />
            <TagInput />
            <button type="submit" className="btn btn-primary btn-custom mt-3">Submit recipe</button>
        </form>
      </div>
    </Fragment>
  );
};

export default RecipeForm;