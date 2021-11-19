import React, { Fragment } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';
import "./RecipeForm.css";

/**
 * Component for displaying a red error box.
 * @param {Array} errors  List of errors to display 
 * @returns A ul element inside a div that contains Bootstrap's styled .list-group-item-danger li elements.
 */
const ErrorAlert = ({ errors }) => {
  return (
      <Fragment>
          <div className="m-2" role="alert" style={{ fontWeight: "bold" }}>
              <ul className="list-group">
                  {errors.map( (error, idx) => <li className="list-group-item list-group-item-danger" key={idx}>{error}</li>)}
              </ul>
          </div>
      </Fragment>
  );
}

/**
 * Component for displaying a header with the text 'Name of the dish' and an input field.
 * 
 * @param {Function}  this.props.handleInputChange  Function that passes input changes to RecipeForm
 * @param {Array} this.props.errors Array of errors related to name input
 * 
 * When the input field content is changed, handleInputChange(e) is called. The input field 
 * name (='title') and its value are passed up to the RecipeForm component to be stored 
 * in its state.
 */
class NameInput extends React.Component {
  constructor() {
    super();

    this.state = {
      errors: []
    }

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this.setState({ errors: this.props.errors })
  }

  handleInputChange(e) {
    this.props.handleInputChange(e.target.name, e.target.value.trim());
  }

  render() {
    return (
      <Fragment>
        <div className="form-group recipe-element">
          <label htmlFor="recipeNameInput"><h5>Name of the dish</h5></label>
          {this.props.errors.length > 0 ? <ErrorAlert errors={this.props.errors} />: null}
          <input  type="text" className="form-control" id="recipeNameInput" placeholder="Enter the name of the dish..." 
                  name="title" onChange={this.handleInputChange} required />
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for displaying a header with the text 'Category' and a select dropdown menu.
 * The select menu's text is conditionally styled to be gray (matching other bootstrap input field 
 * placeholder texts) when the component's state has '' as the value for 'selected' and
 * is otherwise black when something has been chosen.
 * 
 * @param {Function}  this.props.handleInputChange  Function that passes selection changes to RecipeForm
 * @param {Array} this.props.errors Array of errors related to category selection
 * 
 * When the select drowndown's selected option is changed, handleInputChange(e) is called. 
 * The select name (='category') and the selected option's value are passed up to the 
 * RecipeForm component to be stored in its state.
 */
 class CategorySelection extends React.Component {
  constructor() {
    super();

    this.state = {
      selected: "",
      errors: []
    }

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this.setState({ errors: this.props.errors })
  }

  handleInputChange(e) {
    this.setState({ selected: e.target.value});
    this.props.handleInputChange(e.target.name, e.target.value);
  }

  render() {
    return (
      <Fragment>
        <div className="recipe-element">
          <h5><label htmlFor="categories-select">Category</label></h5>
          {this.props.errors.length > 0 ? <ErrorAlert errors={this.props.errors} />: null}
          <select name="category" id="categories-select" className="form-select" defaultValue="" 
                  style={{ color: this.state.selected === "" ? "#6C757D": "#000000"}} 
                  onChange={this.handleInputChange} required>
            <option value="" disabled hidden>Select a category</option>
            <option value="Appetizers">Appetizers</option>
            <option value="Main Dishes">Main Dishes</option>
            <option value="Snacks">Snacks</option>
            <option value="Side Dishes">Side Dishes</option>
            <option value="Desserts">Desserts</option>
          </select>
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for showing a header with the text 'Image of the dish' and a file uploader.
 * It stores the current uploaded file in its state and passes the new file to the main
 * RecipeForm component ('image' attribute in RecipeForm) when it's changed.
 * @param {Function}  this.props.handleInputChange  Function that passes input changes to RecipeForm
 * @param {Array} this.props.errors Array of image upload related errors
 */
class ImageUploader extends React.Component {
  constructor() {
    super();

    this.state = {
      file: null,
      errors: []
    }

    this.handleFileChange = this.handleFileChange.bind(this);
  }

  componentDidMount() {
    this.setState({ errors: this.props.errors })
  }

  handleFileChange(e) {
    this.setState({ file: e.target.files[0]})
    this.props.handleInputChange("image", e.target.files[0]);
  }

  render() {
    return (
      <Fragment>
        <div className="recipe-element">
          <h5>Image of the dish</h5>
          {this.props.errors.length > 0 ? <ErrorAlert errors={this.props.errors} />: null}
          <div className="form-group image-uploader-container">
            <input  type="file" className="form-control-file" id="dishImageFileInput" accept="image/*"
                    onChange={this.handleFileChange} required />
          </div>
        </div>
      </Fragment>
    );
  }
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
 * handleInputChange() is in charge of storing input field values in the component's state.
 * addIngredient() passes the name and amount values to the parent component to be validated there.
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
              <input  type="text" className="form-control" id="ingredientNameInput" placeholder="Enter the name of the ingredient" 
                      name="name" onChange={this.handleInputChange} />
            </div>
            <div className="add-ingredient-amount">
              Amount:
              <input  type="text" className="form-control" id="ingredientAmountInput" placeholder="Enter the amount" 
                      name="amount" onChange={this.handleInputChange} />
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
 * 
 * toggleIngredientInput() is in charge of toggling between '+ Add a new ingredient' button
 * and showing AddIngredientInput component (the ingredient input for name and amount and 
 * '+ Add the above ingredient').
 * 
 * addIngredient() validates the input received from the AddIngredientInput child component.
 * It checks that:
 * (1) name cannot be empty
 * (2) amount cannot be empty
 * (3) name cannot be a duplicate of any ingredients included in the same ingredient group
 * If all these requirements are met, it toggles the ingredient input, saves the new ingredient
 * and passes it to the parent component. If there are errors, the ingredient is not saved and
 * the errors are shown using the ErrorAlert component.
 * 
 * deleteIngredient() deletes an ingredient and passes this information along to parent components.
 */
class IngredientList extends React.Component {
  constructor() {
    super();

    this.state = {
      ingredients: [],
      showIngredientInput: false,
      errors: []
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
    let name = ingredientName.trim();
    let amount = ingredientAmount.trim();
    let errors = [];

    if (name.length < 1) {
      errors.push("Ingredient name can't be empty");
    }
    if (this.state.ingredients.map(ingredient => ingredient.ingredient).includes(name)) {
      errors.push("Ingredient can't be a duplicate of an ingredient already included in this same ingredient group");
    }
    if (amount.length < 1) {
      errors.push("Ingredient amount can't be empty");
    }

    if (errors.length === 0) {
      this.toggleIngredientInput();
      let ingredients = [...this.state.ingredients];
      ingredients.push( { ingredient: ingredientName, amount: ingredientAmount } );

      this.setState({
        ingredients: ingredients
      });

      this.props.handleIngredientChange(ingredients);
    }

    this.setState({ errors: errors});
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
                          key={`${ingredient.ingredient}-ingredient`} 
                          deleteIngredient={() => this.deleteIngredient(this.state.ingredients.indexOf(ingredient))} 
              />
            )}
          <li className="list-group-item list-button">
            { this.state.errors.length > 0 ? <ErrorAlert errors={this.state.errors} /> : null}
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
 * It stores the ingredients for default ingredient group in its state. For subgroups
 * it stores an array of subgroups. The subgroups in the array have the format:
 * subgroup[i] = {name: 'Subgroup name', ingredients: []}
 * The component also stores the value inserted into the text field for inputting a new
 * subgroup name in its state as well as an array of errors related to that input field.
 * 
 * When the value for the subgroup name input field is changed, handleInputChange() is called.
 * When a user submits a new subgroup name, addIngredientSubgroup() is called and it briefly
 * validates that the input meets the following requirements:
 * (1) input can't be empty (subgroup must have a name)
 * (2) input can't be a duplicate of existing subgroup name (no subgroup duplicates allowed for a single recipe)
 * When a user wants to delete a subgroup and presses the 'X' button, deleteIngredientSubgroup() is called.
 * 
 * handleIngredientChange() and handleSubgroupChange() store ingredient changes from child components
 * this component and passes them up to parent component. handleIngredientChange() handles ingredient
 * changes in the default ingredient group and handleSubgroupChange() handles the changes in subgroups.
 */
class IngredientInput extends React.Component {
  constructor() {
    super();

    this.state = {
      default: [],
      subgroups: [],
      newGroupName: "",
      errors: []
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

    let name = this.state.newGroupName.trim();
    let errors = []
    if (name.length < 1) {
      errors.push("Subgroup name can't be empty")
    } else if (this.state.subgroups.map(subgroup => subgroup.name).includes(name)) {
      errors.push("Subgroup name can't be a duplicate")
    }

    if (errors.length === 0) {
      let subgroups = [...this.state.subgroups];
      subgroups.push( { name: name, ingredients: [] } );
      this.setState({
        subgroups: subgroups,
        newGroupName: ""
      });

      let ingredientsObj = {
        Default: this.state.default
      }
      subgroups.forEach( subgroup => ingredientsObj = { ...ingredientsObj, [subgroup.name]: subgroup.ingredients });
      this.props.handleInputChange("groups", ingredientsObj);
    }

    this.setState({ errors: errors })
  }

  deleteIngredientSubgroup(idx) {
    let subgroups = [...this.state.subgroups];
    subgroups.splice(idx, 1);

    this.setState({
      subgroups: subgroups
    });

    let ingredientsObj = {
      Default: this.state.default
    }
    subgroups.forEach( subgroup => ingredientsObj = { ...ingredientsObj, [subgroup.name]: subgroup.ingredients });
    this.props.handleInputChange("groups", ingredientsObj);
  }

  handleIngredientChange(ingredients) {
    this.setState({
      default: ingredients
    });

    let ingredientsObj = {
      Default: ingredients
    }
    this.state.subgroups.forEach( subgroup => ingredientsObj = { ...ingredientsObj, [subgroup.name]: subgroup.ingredients });
    this.props.handleInputChange("groups", ingredientsObj);
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
    this.props.handleInputChange("groups", ingredientsObj);
  }

  render() {
    return (
      <Fragment>
        <div className="recipe-element">
          <h5>Ingredients</h5>
          {this.props.errors.length > 0 ? <ErrorAlert errors={this.props.errors} /> : null}
          <IngredientList key="default" initialIngredients={this.state.default} 
                          handleIngredientChange={this.handleIngredientChange} />
          {this.state.subgroups.map((subgroup, idx) => 
              <IngredientSubgroup name={subgroup.name} key={`${subgroup.name}-group`} idx={idx}
                                  initialIngredients={subgroup.ingredients}
                                  handleSubgroupChange={this.handleSubgroupChange} 
                                  deleteIngredientSubgroup={() => this.deleteIngredientSubgroup(idx)} />
            )}
          <div className="add-subgroup-container">
            {this.state.errors.length > 0 ? <ErrorAlert errors={this.state.errors} /> : null}
            <input  type="text" className="form-control" id="groupNameInput" placeholder="Name for a new ingredient group" 
                    name="newGroupName" value={this.state.newGroupName} onChange={this.handleInputChange} />
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

    this.state = {
      file: null
    }

    this.handleInstructionChange = this.handleInstructionChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  handleInstructionChange(e) {
    e.preventDefault();
    this.props.handleInstructionChange(e, this.props.number - 1);
  }

  handleFileChange(e) {
    this.setState({ file: e.target.files[0] });
    this.props.handleImageChange(this.props.number, e.target.files[0])
  }

  render() {
    return (
      <Fragment>
        <div className="list-instructions-step">
          <div className="instructions-step-start">{this.props.number}.</div>
          <textarea className="form-control" rows="1" placeholder="Enter the description for this step..." 
                    onChange={this.handleInstructionChange} required={this.props.number === "1"} ></textarea>
          <div className="instructions-step-end">
            <button type="button" className="btn-close btn-close-custom" aria-label="Close" 
                    onClick={this.props.deleteInstructionStep} 
                    style={{display: this.props.number === "1" ? "none" : "initial"}} ></button>
          </div>
        </div>
        <div className="form-group">
          Step {this.props.number} image (optional)<br />
          <input type="file" className="form-control-file" id="instructionImageFileInput" accept="image/*" onChange={this.handleFileChange} />
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
 * @param {Array} this.props.errors Array of errors related to instruction steps
 * 
 * The component stores a list of current step descriptions inputted in its own state. In addition
 * to that it also keeps track of how many steps have been added by incrementing the index variable
 * in its state. This is then used for step keys and is there to make sure they are all unique and
 * constant for the steps to prevent problems with React rerendering due to key changes when some 
 * instructions are deleted.
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
      steps: [],
      index: 0,
      errors: []
    }

    this.addInstructionStep = this.addInstructionStep.bind(this);
    this.handleInstructionChange = this.handleInstructionChange.bind(this);
    this.deleteInstructionStep = this.deleteInstructionStep.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
  }

  componentDidMount() {
    let steps = [];
    steps.push( { description: "", idx: this.state.index } );

    this.setState({
      steps: steps,
      index: this.state.index + 1,
      errors: this.props.errors
    });
  }

  addInstructionStep(e) {
    e.preventDefault();
    let steps = [...this.state.steps];
    steps.push( { description: "", idx: this.state.index } );

    this.setState({
      steps: steps,
      index: this.state.index + 1
    });
  }

  handleInstructionChange(e, idx) {
    let steps = [...this.state.steps];
    steps[idx].description = e.target.value.trim();

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
  }

  handleImageChange(step, file) {
    this.props.handleStepImageChange(step, file);
  }

  render() {
    return (
      <Fragment>
        <div className="recipe-element">
          <h5>Instructons</h5>
          {this.props.errors.length > 0 ? <ErrorAlert errors={this.props.errors} />: null}
          {this.state.steps.map(step => 
            <InstructionsStep number={String(this.state.steps.indexOf(step) + 1)} description={step.description} 
                              key={step.idx} handleInstructionChange={this.handleInstructionChange}
                              handleImageChange={this.handleImageChange} 
                              deleteInstructionStep={() => this.deleteInstructionStep(this.state.steps.indexOf(step))} />
          )}
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
    this.props.handleInputChange(e.target.name, e.target.value.trim());
  }

  render() {
    return (
      <Fragment>
        <div className="form-group recipe-element">
          <label htmlFor="additionalInstructionsInput"><h5>Additional Instructions</h5></label>
          <textarea className="form-control" id="additionalInstructionsInput" rows="2" 
                    placeholder="Enter any additional instructions for preparing the dish here..." 
                    name="addInstructions" onChange={this.handleInputChange}></textarea>
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for displaying a header with the text 'Tags' and an input field.
 * 
 * @param {Function}  this.props.handleInputChange  Function to pass up state changes to RecipeForm
 * @param {Array} this.props.errors Array listing possible errors arisen in last validation done during submit
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

    this.state = {
      errors: []
    }

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidMount() {
    this.setState({ errors: this.props.errors })
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
          {this.props.errors.length > 0 ? <ErrorAlert errors={this.props.errors} /> : null}
          <input  type="text" className="form-control" id="recipeTagInput" 
                  placeholder="Enter the tags of the dish separated by ';' ..." name="tags" 
                  onChange={this.handleInputChange} required />
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for the recipe adding form itself. 
 * Stores the recipe information in its state.
 * 
 * handleInputChange() is called by child components to update the state values based on the input field
 * values of the child components. handleStepImageChange() is used to pass instruction step images back
 * to the RecipeForm component and to store them there.
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
      tags: [],
      image: null,
      stepImages: {},
      errors: {
        nameErrors: [],
        categoryErrors: [],
        imageErrors: [],
        ingredientErrors: [],
        instructionErrors: [],
        tagErrors: []
      },
      createdID: 0
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleStepImageChange = this.handleStepImageChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(name, value) {
    this.setState({
      [name]: value,
    });
  };

  handleStepImageChange(step, image) {
    let currentImages = { ...this.state.stepImages, [step]: image };
    this.setState({ stepImages: currentImages })
  }

  handleSubmit(e) {
    e.preventDefault();
    let dataValidates = true;

    // validate name
    let nameErrors = [];
    if (this.state.title.length < 1) {
      dataValidates = false;
      nameErrors.push("Name can't be empty");
    }

    // validate category
    let categoryErrors = [];
    if (this.state.category === "") {
      dataValidates = false;
      categoryErrors.push("A category must be chosen");
    }

    // validate image
    let imageErrors = [];
    if (!this.state.image) {
      dataValidates = false;
      imageErrors.push("An image must be added");
    }

    // validate ingredients
    let ingredientErrors = [];
    if (Object.keys(this.state.groups).every(groupKey => this.state.groups[groupKey].length < 1)) {
      dataValidates = false;
      ingredientErrors.push("The recipe must contain at least one ingredient");
    }
    if (Object.keys(this.state.groups)
              .filter(groupKey => groupKey !== "Default")
              .some(groupKey => this.state.groups[groupKey].length < 1)) {
      dataValidates = false;
      ingredientErrors.push("Subgroups can't be empty");
    }

    // validate instructions
    let instructionErrors = [];
    if (this.state.instructions.length < 1 || !this.state.instructions['1']) {
      dataValidates = false;
      instructionErrors.push("The instructions must contain at least one step");
    }
    if (this.state.instructions['1'] && this.state.instructions['1'].length < 1) {
      dataValidates = false;
      instructionErrors.push("The first instruction step can't be empty");
    }
    if (Object.values(this.state.instructions).includes("") || Object.values(this.state.instructions).includes(undefined)) {
      dataValidates = false;
      instructionErrors.push("The instructions can't include empty instructions");
    }

    // validate tags
    let tagErrors = [];
    if (this.state.tags.length < 1) {
      dataValidates = false;
      tagErrors.push("Tags can't be empty");
    }

    let errors = {
      nameErrors: nameErrors,
      categoryErrors: categoryErrors,
      imageErrors: imageErrors,
      ingredientErrors: ingredientErrors,
      instructionErrors: instructionErrors,
      tagErrors: tagErrors
    }

    this.setState({ errors: errors });

    if (dataValidates) {
      const formData = new FormData();
      const recipe = {
        title: this.state.title,
        category: this.state.category,
        groups: this.state.groups,
        instructions: this.state.instructions,
        addInstructions: this.state.addInstructions,
        tags: this.state.tags,
      }

      formData.append('recipe', JSON.stringify(recipe));
      formData.append('main', this.state.image);
      
      fetch('http://localhost:5000/recipes', {
          method: 'POST',
          credentials: 'include',
          body: formData,
      })
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Something went wrong...');
      })
      .then(recipe => {
        this.setState({ createdID: recipe.recipeid });
      })
      .catch((error) => {
          console.error(error);
      });
    }
  }

  render() {
    return (
      <Fragment>
        { this.state.createdID !== 0 ? <Redirect push to={`/recipes/${this.state.createdID}`} /> : null }
        <div className="recipe-form-container text-center">
          <h1>Add a new recipe</h1>
          <form onSubmit={this.handleSubmit}>
              <NameInput handleInputChange={this.handleInputChange} errors={this.state.errors.nameErrors} />
              <CategorySelection handleInputChange={this.handleInputChange} errors={this.state.errors.categoryErrors} />
              <ImageUploader handleInputChange={this.handleInputChange} errors={this.state.errors.imageErrors} />
              <IngredientInput handleInputChange={this.handleInputChange} errors={this.state.errors.ingredientErrors} />
              <InstructionsInput  handleInputChange={this.handleInputChange} handleStepImageChange={this.handleStepImageChange}
                                  errors={this.state.errors.instructionErrors} />
              <AdditionalInstructionsInput handleInputChange={this.handleInputChange} />
              <TagInput handleInputChange={this.handleInputChange} errors={this.state.errors.tagErrors} />
              {Object.keys(this.state.errors).some(errorCategory => this.state.errors[errorCategory].length > 0) ? 
              <ErrorAlert errors={["Can't submit form due to failed requirements:"].concat(this.state.errors.nameErrors, 
                                  this.state.errors.categoryErrors, this.state.errors.imageErrors, 
                                  this.state.errors.ingredientErrors, this.state.errors.instructionErrors, 
                                  this.state.errors.tagErrors)} /> 
              : null}
              <button type="submit" className="btn btn-primary btn-custom mt-3">Submit recipe</button>
          </form>
        </div>
      </Fragment>
    );
  }
};

export default RecipeForm;