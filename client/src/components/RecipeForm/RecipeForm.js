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

const Ingredient = ({ name, amount }) => {
    return (
    <Fragment>
            <li className="list-group-item list-ingredient-container">
                <div className="list-ingredient-name">
                    {name}
                </div>
                <div className="list-ingredient-amount float-end">
                    {amount}
                </div>
                <button type="button" className="btn-close btn-close-custom" aria-label="Close"></button>
            </li>
      </Fragment>
    );
};

Ingredient.propTypes = {
    name: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
};

class AddIngredientInput extends React.Component {
  constructor() {
    super();

    this.state = {
      name: "",
      amount: ""
    }

    this.handleNameChange = this.handleNameChange.bind(this);
    this.handleAmountChange = this.handleAmountChange.bind(this);
    this.addIngredient = this.addIngredient.bind(this);
  }

  handleNameChange(e) {
    let newState = {...this.state}
    newState.name = e.target.value;
    this.setState(newState);
  }

  handleAmountChange(e) {
    let newState = {...this.state}
    newState.amount = e.target.value;
    this.setState(newState);
  }

  addIngredient(e) {
    e.preventDefault();
    this.props.addIngredient(e, this.state.name, this.state.amount);
  }

  render() {
    return (
      <Fragment>
        <div className="add-ingredient-input-container">
          <div className="form-group list-ingredient-container">
            <div className="add-ingredient-name">
              Name:
              <input type="text" className="form-control" id="ingredientNameInput" placeholder="Enter the name of the ingredient" onChange={this.handleNameChange} />
            </div>
            <div className="add-ingredient-amount">
              Amount:
              <input type="text" className="form-control" id="ingredientAmountInput" placeholder="Enter the amount" onChange={this.handleAmountChange} />
            </div>
          </div>
          <div onClick={this.addIngredient}>+ Add the above ingredient</div>
        </div>
      </Fragment>
    );
  }
};

class IngredientList extends React.Component {
  constructor() {
    super();

    this.state = {
      ingredients: [],
      showIngredientInput: false
    }

    this.addIngredient = this.addIngredient.bind(this);
    this.toggleIngredientInput = this.toggleIngredientInput.bind(this);
  }

  componentDidMount() {
    let ingredients = [];
    ingredients.push( { name: "flour", amount: "100 g" }, { name: "milk", amount: "200 ml" }, { name: "potato", amount: "2 pcs" } );

    this.setState({
      ingredients: ingredients
    });
  }

  toggleIngredientInput() {
    let newState = {...this.state}
    newState.showIngredientInput = !newState.showIngredientInput;
    this.setState(newState);
  }

  addIngredient(e, ingredientName, ingredientAmount) {
    e.preventDefault();
    this.toggleIngredientInput();
    let ingredients = [...this.state.ingredients];
    ingredients.push( { name: ingredientName, amount: ingredientAmount } );

    this.setState({
      ingredients: ingredients
    });
    
  }

  render() {
    return (
      <Fragment>
        <ul className="list-group">
          {this.state.ingredients.map((ingredient, idx) => <Ingredient name={ingredient.name} amount={ingredient.amount} key={idx} />)}
          <li className="list-group-item list-button">
          { this.state.showIngredientInput ? <AddIngredientInput addIngredient={this.addIngredient} /> : null }
          { !this.state.showIngredientInput ? <div onClick={this.toggleIngredientInput}>+ Add a new ingredient</div> : null }
          </li>
        </ul>
      </Fragment>
    );
  }  
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

class IngredientInput extends React.Component {
  constructor() {
    super();

    this.state = {
      subgroups: []
    }

    this.addIngredientSubgroup = this.addIngredientSubgroup.bind(this);
  }

  componentDidMount() {
    let subgroups = [];
    subgroups.push( { name: "Subgroup name" } );

    this.setState({
      subgroups: subgroups
    });
  }

  addIngredientSubgroup(e) {
    e.preventDefault();
    let subgroups = [...this.state.subgroups];
    // TODO: add subgroup naming input
    subgroups.push( { name: "Some subgroup name" } );

    this.setState({
      subgroups: subgroups
    });
  }

  // TODO: add subgroup removal functionality

  render() {
    return (
      <Fragment>
        <div className="recipe-element">
          <h5>Ingredients</h5>
          <IngredientList />
          {this.state.subgroups.map((subgroup, idx) => <IngredientSubgroup name={subgroup.name} key={idx} />)}
          <button className="btn btn-secondary-custom mt-1" onClick={this.addIngredientSubgroup}>+ Add a new ingredient group</button>
        </div>
      </Fragment>
    );
  }
};

class InstructionsStep extends React.Component {
  constructor() {
    super();
    this.handleInstructionChange = this.handleInstructionChange.bind(this);
  }

  handleInstructionChange(e) {
    e.preventDefault();
    this.props.handleInstructionChange(e, this.props.number - 1);
  }

  render() {
    return (
      <Fragment>
        <div className="list-instructions-step">
          <div className="instructions-step-start">{this.props.number}.</div>
          <textarea className="form-control" rows="1" placeholder="Enter the description for this step..." defaultValue={this.props.description} onChange={this.handleInstructionChange}></textarea>
          <div className="instructions-step-end">
            <button type="button" className="btn-close btn-close-custom" aria-label="Close" onClick={this.props.deleteInstructionStep} ></button>
          </div>
        </div>
        <div className="form-group">
          Step {this.props.number} image<br />
          <input type="file" className="form-control-file" id="instructionImageFileInput" />
        </div>
      </Fragment>
    );
  } 
};

InstructionsStep.propTypes = {
    number: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

class InstructionsInput extends React.Component {
  constructor() {
    super();
    
    this.state = {
      steps: []
    }

    this.addInstructionStep = this.addInstructionStep.bind(this);
    this.handleInstructionChange = this.handleInstructionChange.bind(this);
    this.deleteInstructionStep = this.deleteInstructionStep.bind(this);
  }

  componentDidMount() {
    let steps = [];
    steps.push( { description: "" } );

    this.setState({
      steps: steps
    });
  }

  addInstructionStep(e) {
    e.preventDefault();
    let steps = [...this.state.steps];
    steps.push( { description: "" } );

    this.setState({
      steps: steps
    });
  }

  handleInstructionChange(e, idx) {
    let steps = [...this.state.steps];
    steps[idx].description = e.target.value;

    this.setState({
      steps: steps
    });
  }

  deleteInstructionStep(idx) {
    let steps = [...this.state.steps];
    steps.splice(idx, 1);

    this.setState({
      steps: steps
    });
  }
  

  render() {
    return (
      <Fragment>
        <div className="recipe-element">
          <h5>Instructons</h5>
          {this.state.steps.map(step => <InstructionsStep number={String(this.state.steps.indexOf(step) + 1)} description={step.description} key={this.state.steps.indexOf(step)} handleInstructionChange={this.handleInstructionChange} deleteInstructionStep={() => this.deleteInstructionStep(this.state.steps.indexOf(step))} />)}
          <button className="btn btn-secondary-custom mt-2" onClick={this.addInstructionStep} >+ Add a new step</button>
        </div>
      </Fragment>
    );
  }
    
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

class RecipeForm extends React.Component {
  constructor() {
    super();

    this.state = {}
  }

  render() {
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
  }
};

export default RecipeForm;