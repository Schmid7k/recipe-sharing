import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./RecipeForm.css";

/**
 * Component for displaying a header with the text 'Name of the dish' and an input field.
 * 
 * When the input field content is changed, handleInputChange(e) is called. The input field 
 * name (='title') and its value are passed up to the RecipeForm component to be stored 
 * in its state.
 */
class NameInput extends React.Component {
  constructor() {
    super();

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.props.handleInputChange(e.target.name, e.target.value);
  }

  render() {
    return (
      <Fragment>
        <div className="form-group recipe-element">
          <label htmlFor="recipeNameInput"><h5>Name of the dish</h5></label>
          <input type="text" className="form-control" id="recipeNameInput" placeholder="Enter the name of the dish..." name="title" onChange={this.handleInputChange} />
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for displaying a header with the text 'Category' and a select dropdown menu.
 * 
 * When the select drowndown's selected option is changed, handleInputChange(e) is called. 
 * The select name (='category') and the selected option's value are passed up to the 
 * RecipeForm component to be stored in its state.
 */
 class CategorySelection extends React.Component {
  constructor() {
    super();

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.props.handleInputChange(e.target.name, e.target.value);
  }

  render() {
    return (
      <Fragment>
        <div className="recipe-element">
          <h5><label htmlFor="categories-select">Category</label></h5>
          <select name="category" id="categories-select" className="form-select" defaultValue="placeholder" onChange={this.handleInputChange}>
            <option value="placeholder" disabled hidden>Select a category</option>
            <option value="Appetizers">Appetizers</option>
            <option value="MainDishes">Main Dishes</option>
            <option value="Snacks">Snacks</option>
            <option value="Sidedishes">Side Dishes</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for showing a header with the text 'Image of the dish' and a file uploader.
 * TODO: Implement passing the uploaded file to RecipeForm to be stored
 */
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

/**
 * Component showing a single ingredient in a list and a button for removing it
 * wrapped in <li></li> tags. A list of these components should be wrapped with <ul></ul>.
 * @param {string}  name    The name of the ingredient
 * @param {string}  amount  The amount (should include the unit) of the ingredient
 * @param {function}  deleteIngredient  A function to remove the current ingredient
 */
const Ingredient = ({ name, amount, deleteIngredient }) => {
  return (
    <Fragment>
      <li className="list-group-item list-ingredient-container">
        <div className="list-ingredient-name">{name}</div>
        <div className="list-ingredient-amount float-end">{amount}</div>
        <button type="button" className="btn-close btn-close-custom" aria-label="Remove" onClick={deleteIngredient}></button>
      </li>
    </Fragment>
  );
};

Ingredient.propTypes = {
    name: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    deleteIngredient: PropTypes.func.isRequired,
};

/**
 * Component for showing ingredient adding interface.
 */
class AddIngredientInput extends React.Component {
  constructor() {
    super();

    this.state = {
      name: "",
      amount: ""
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.addIngredient = this.addIngredient.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
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
              <input type="text" className="form-control" id="ingredientNameInput" placeholder="Enter the name of the ingredient" name="name" onChange={this.handleInputChange} />
            </div>
            <div className="add-ingredient-amount">
              Amount:
              <input type="text" className="form-control" id="ingredientAmountInput" placeholder="Enter the amount" name="amount" onChange={this.handleInputChange} />
            </div>
          </div>
          <div onClick={this.addIngredient}>+ Add the above ingredient</div>
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for showing a list of ingredients.
 */
class IngredientList extends React.Component {
  constructor() {
    super();

    this.state = {
      ingredients: [],
      showIngredientInput: false
    }

    this.addIngredient = this.addIngredient.bind(this);
    this.deleteIngredient = this.deleteIngredient.bind(this);
    this.toggleIngredientInput = this.toggleIngredientInput.bind(this);
  }

  componentDidMount() {
    this.setState({
      ingredients: this.props.initialIngredients
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
    ingredients.push( { ingredient: ingredientName, amount: ingredientAmount } );

    this.setState({
      ingredients: ingredients
    });

    this.props.handleIngredientChange(ingredients);
  }

  deleteIngredient(idx) {
    let ingredients = [...this.state.ingredients];
    ingredients.splice(idx, 1);
    this.setState({
      ingredients: ingredients
    });

    this.props.handleIngredientChange(ingredients);
  }

  render() {
    return (
      <Fragment>
        <ul className="list-group ingredient-group">
          
          {this.state.ingredients.map((ingredient, idx) => 
              <Ingredient name={ingredient.ingredient} 
                          amount={ingredient.amount} 
                          key={idx} 
                          deleteIngredient={() => this.deleteIngredient(this.state.ingredients.indexOf(ingredient))} 
              />
            )}
          
          <li className="list-group-item list-button">
            { this.state.showIngredientInput ? <AddIngredientInput addIngredient={this.addIngredient} /> : null }
            { !this.state.showIngredientInput ? <div onClick={this.toggleIngredientInput}>+ Add a new ingredient</div> : null }
          </li>
        </ul>
      </Fragment>
    );
  }  
};

/**
 * Component showing a <h6></h6> header with the subgroup name specified through props
 * and a 'X' button to remove the current subgroup beside it. An IngredientList component 
 * is included below the header and the button.
 * @param {string}  this.props.name    The name of the ingredient subgroup
 * @param {number}  this.props.idx  The index of the current ingredient subgroup
 * @param {function}  this.props.handleSubgroupChange A function for callbacks when ingredients are updated
 * @param {array} this.props.initialIngredients The list of initial ingredients the subgroup should have
 * @param {function}  this.props.deleteIngredientSubgroup  A function to delete the current subgroup of ingredients
 */
class IngredientSubgroup extends React.Component {
  constructor() {
    super();
    this.state = {
      ingredients: []
    }

    this.handleIngredientChange = this.handleIngredientChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      ingredients: this.props.initialIngredients
    }); 
  }

  handleIngredientChange(ingredients) {
    this.setState({
      ingredients: ingredients
    });
    this.props.handleSubgroupChange(this.props.name, this.props.idx, ingredients);
  }

  render() {
    return (
      <Fragment>
        <div className="ingredient-subgroup">
          <h6>{this.props.name} <button type="button" className="btn-close btn-close-custom" aria-label="Remove" onClick={this.props.deleteIngredientSubgroup}></button></h6>
          <IngredientList initialIngredients={this.props.initialIngredients} handleIngredientChange={this.handleIngredientChange} />
        </div>
      </Fragment>
    );
  }
}

IngredientSubgroup.propTypes = {
    name: PropTypes.string.isRequired,
    deleteIngredientSubgroup: PropTypes.func.isRequired,
};

/**
 * Component for showing multiple ingredient lists (default, subgroups) together.
 */
class IngredientInput extends React.Component {
  constructor() {
    super();

    this.state = {
      default: [],
      subgroups: [],
      newGroupName: "Subgroup name"
    }

    this.addIngredientSubgroup = this.addIngredientSubgroup.bind(this);
    this.deleteIngredientSubgroup = this.deleteIngredientSubgroup.bind(this);
    this.handleIngredientChange = this.handleIngredientChange.bind(this);
    this.handleSubgroupChange = this.handleSubgroupChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  addIngredientSubgroup(e) {
    e.preventDefault();
    let subgroups = [...this.state.subgroups];
    subgroups.push( { name: this.state.newGroupName, ingredients: [] } );
    this.setState({
      subgroups: subgroups
    });
  }

  deleteIngredientSubgroup(idx) {
    let subgroups = [...this.state.subgroups];
    subgroups.splice(idx, 1);

    this.setState({
      subgroups: subgroups
    });
  }

  handleIngredientChange(ingredients) {
    this.setState({
      default: ingredients
    });

    let ingredientsObj = {
      Default: ingredients
    }
    this.state.subgroups.forEach( subgroup => ingredientsObj = { ...ingredientsObj, [subgroup.name]: subgroup.ingredients });
    this.props.handleInputChange("groups", ingredientsObj)
  }

  handleSubgroupChange(group, idx, ingredients) {
    let subgroups = [...this.state.subgroups];
    subgroups[idx] = {
      name: group,
      ingredients: ingredients
    }

    this.setState({
      subgroups: subgroups
    });

    let ingredientsObj = {
      Default: this.state.default
    }

    subgroups.forEach( subgroup => ingredientsObj = { ...ingredientsObj, [subgroup.name]: subgroup.ingredients });
    this.props.handleInputChange("groups", ingredientsObj)
  }

  render() {
    return (
      <Fragment>
        <div className="recipe-element">
          <h5>Ingredients</h5>
          <IngredientList key="default" initialIngredients={this.state.default} handleIngredientChange={this.handleIngredientChange} />
          {this.state.subgroups.map((subgroup, idx) => 
              <IngredientSubgroup name={subgroup.name} key={`${subgroup.name}-${idx}`} idx={idx}
                                  initialIngredients={subgroup.ingredients}
                                  handleSubgroupChange={this.handleSubgroupChange} 
                                  deleteIngredientSubgroup={() => this.deleteIngredientSubgroup(idx)} />
            )}
          <div className="add-subgroup-container">
            <input type="text" className="form-control" id="groupNameInput" placeholder="Name for a new ingredient group" name="newGroupName" onChange={this.handleInputChange} />
            <button className="btn btn-secondary-custom mt-1" onClick={this.addIngredientSubgroup}>+ Add a new ingredient group</button>
          </div>
        </div>
      </Fragment>
    );
  }
};

/**
 * Component showing a single instruction step. The component shows the step number, a textarea for inputting the step
 * description, a 'X' button for removing the current (= this component) instruction step and a image uploader that can
 * be used to upload a instructional image for the current instruction step.
 * 
 * @param {string}  this.props.number  The step number that should be shown to the left of the textarea
 * @param {string}  this.props.description  The step description that should be shown in the textarea
 * @param {function}  this.props.deleteInstructionStep  A function passed as a prop to delete the current instruction step
 * 
 * When the description textarea is changed, the component does a callback to the InstructionsInput component where the
 * change is handled.
 */
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
          <textarea className="form-control" rows="1" placeholder="Enter the description for this step..." value={this.props.description} onChange={this.handleInstructionChange}></textarea>
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

/**
 * Component for displaying a header with the text 'Instructions' and a list of instructions.
 * Each instruction step is shown using the InstructionsStep component defined above.
 * 
 * The component stores a list of current step descriptions inputted in its own state.
 * 
 * When the user presses the button '+ Add a new step' to add an additional instruction step,
 * addInstructionStep(e) is called. The function stores an additional step with an empty description
 * in the component state.
 * 
 * When the instruction step descriptions are changed, handleInstructionChange(e, idx) is called. 
 * The function updates the new description to its own state and does a callback back to the RecipeForm
 * component to update its state for instruction steps. The name for RecipeForm's instructions attribute
 * name (='instructions') and an object of steps in the following way is passed to the RecipeForm component 
 * in the callback:
 * 
 * {
 *    [step index + 1]: [description]
 * }
 * 
 * When the user removes steps by pressing the 'X' button next to a step, deleteInstructionStep(idx) is called.
 * The function splices out the removed description and updates the component's state to match this deletion.
 * The function also makes a callback to the RecipeForm component to update its state as well in the same format
 * as described for instruction step description updating.
 */
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

    let stepObj = steps.reduce((obj, step) => ({...obj, [steps.indexOf(step) + 1]: step.description}), {});
    this.props.handleInputChange("instructions", stepObj);
  }

  deleteInstructionStep(idx) {
    let steps = [...this.state.steps];
    steps.splice(idx, 1);

    this.setState({
      steps: steps
    });
    let stepObj = steps.reduce((obj, step) => ({...obj, [steps.indexOf(step) + 1]: step.description}), {});
    this.props.handleInputChange("instructions", stepObj);
    this.forceUpdate()
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

/**
 * Component for displaying a header with the text 'Additional Instructions' and a textarea.
 * 
 * When the textarea content is changed, handleInputChange(e) is called. The textarea name 
 * (='addInstructions') and its value are passed up to the RecipeForm component to be stored 
 * in its state.
 */
class AdditionalInstructionsInput extends React.Component {
  constructor() {
    super();

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    this.props.handleInputChange(e.target.name, e.target.value);
  }

  render() {
    return (
      <Fragment>
        <div className="form-group recipe-element">
          <label htmlFor="additionalInstructionsInput"><h5>Additional Instructions</h5></label>
          <textarea className="form-control" id="additionalInstructionsInput" rows="2" placeholder="Enter any additional instructions for preparing the dish here..." name="addInstructions" onChange={this.handleInputChange}></textarea>
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for displaying a header with the text 'Tags' and an input field.
 * 
 * When the input field content is changed, handleInputChange(e) is called.
 * The component parses the tags by splitting the input field content at ';'s. 
 * If the split tags contain content after trimming trailing whitespaces, they 
 * are added to an array 'tagList'. The input field name (='tags') and the list 
 * of tags are passed up to the RecipeForm component to be stored in its state.
 */
class TagInput extends React.Component {
  constructor() {
    super();

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(e) {
    let tagList = [];
    e.target.value.split(";").forEach(tag => {
      if (tag.trim().length > 0) tagList.push(tag.trim());
    });
    this.props.handleInputChange(e.target.name, tagList);
  }

  render() {
    return (
      <Fragment>
        <div className="form-group recipe-element">
          <label htmlFor="recipeTagInput"><h5>Tags</h5></label>
          <input type="text" className="form-control" id="recipeTagInput" placeholder="Enter the tags of the dish separated by ';' ..." name="tags" onChange={this.handleInputChange}/>
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for the recipe adding form itself.
 */
class RecipeForm extends React.Component {
  constructor() {
    super();

    this.state = {
      title: "",
      category: "",
      groups: {
        Default: []
      },
      instructions: {},
      addInstructions: "",
      tags: []
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(name, value) {
    this.setState({
      [name]: value,
    });
  };

  handleSubmit(e) {
    // TODO: Handle possible malicious content in the inputs in the child components
    // TODO: Add validation to the input in the child components (require input, prevent duplicate subgroups)
    // TODO: Come up with better keys instead of using indexing to prevent problems
    // TODO: Proper comments/documentation for some of the components
    // TODO: Formulate the POST request and verify everything is working
    // TODO: Implement image uploading and storing
    e.preventDefault();
    console.log(this.state);

    const data = this.state;
    console.log(data);
    /*        
    fetch('http://localhost:5000/recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });*/
  }

  render() {
    return (
      <Fragment>
        <div className="recipe-form-container text-center">
          <h1>Add a new recipe</h1>
          <form onSubmit={this.handleSubmit}>
              <NameInput handleInputChange={this.handleInputChange} />
              <CategorySelection handleInputChange={this.handleInputChange} />
              <ImageUploader />
              <IngredientInput handleInputChange={this.handleInputChange} />
              <InstructionsInput handleInputChange={this.handleInputChange} />
              <AdditionalInstructionsInput handleInputChange={this.handleInputChange} />
              <TagInput handleInputChange={this.handleInputChange} />
              <button type="submit" className="btn btn-primary btn-custom mt-3">Submit recipe</button>
          </form>
        </div>
      </Fragment>
    );
  }
};

export default RecipeForm;