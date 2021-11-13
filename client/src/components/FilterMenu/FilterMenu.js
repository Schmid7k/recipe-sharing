import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./FilterMenu.css";
import {ReactComponent as StarIcon} from "../../images/star_icon.svg";

/* Creates a dropdown select menu for the categories. "Select a category" is shown as a placeholder
  but is hidden in the actual dropdown menu and can't be chosen. */
  // NOTE: I suppose category selection can be hardcoded rather than try fetching values from DB, since it's only few
const CategorySelection = () => {
  return (
    <Fragment>
      <h5><label htmlFor="categories-select">Category</label></h5>
      <select name="categories" id="categories-select" className="form-select" defaultValue="placeholder">
        <option value="placeholder" disabled hidden>Select a category</option>
        <option value="appetizers">Appetizers</option>
        <option value="maindishes">Main Dishes</option>
        <option value="snacks">Snacks</option>
        <option value="sidedishes">Side Dishes</option>
        <option value="desserts">Desserts</option>
      </select>
    </Fragment>
  );
}

// TODO: there might be issues with the id, ensuring a unique one would be better
class ChecklistCheckbox extends React.Component {
  constructor(){
    super();
    this.state = { checked: false }
  }

  // used for adding checked elements from dropdown menu
  componentDidMount(){
    if(this.props.startChecked)
      this.setState({ checked: true });
  }

  render(){
    return (
      <Fragment>
        <div className="form-check">
          <input className="form-check-input" type="checkbox" id={`checkbox-${this.props.checklistName}-${this.props.value}`} name={this.props.value} value={this.props.value} checked={this.state.checked} onChange={e => {this.setState({checked: !this.state.checked})}}/>
          <label className="form-check-label filter-checkbox-item" htmlFor={this.props.value}> {this.props.name}</label>
        </div>
      </Fragment>
    );
  }
}

const Checklist = ({items}) => {
  return (
    <Fragment>
      {items}
    </Fragment>
  );
}

/* Dropdown title "Ingredients" with a spinning arrow to indicate whether pressing it expands or collapses the thing.
  Has "Include" and "Exclude" headers and a list of checkboxes currently. To match the layout sketches, it still should have some
  kind of "see more.." button for showing more ingredient checkboxes and limit the initial amount of ingredient checkboxes shown.
  Since both the include and exclude lists just include a dummy checkbox list component currently, clicking on the exclude
  checkbox labels fills in the include ones due to shared id's.*/
// TODO: "see more" could be added if the lists are very long
const IngredientSelection = ({topIngredients, ingredients, callbackExlude, callbackInclude, customExcludeIngredients, customIncludeIngredients}) => {
  return (
    <Fragment>
      <h5>
        <button className="drop-select-btn dropdown-toggle" type="button" data-bs-toggle="collapse" 
                  data-bs-target="#filterIngredientsContent" aria-controls="filterIngredientsContent" 
                  aria-expanded="false" aria-label="Toggle ingredient filters"
        >
          Ingredients
        </button>
      </h5>
      <div id="filterIngredientsContent" className="collapse">
        <h6>Include</h6>
        <FilterSearch placeholder="Search for an ingredient..." items={ingredients} id={"ingredients-include-drowpdown-options"} callback={callbackInclude} customSet={customIncludeIngredients} checklistName={'include'}/>

        <div className="popular-item-container">
          <h6>Popular</h6>
          <Checklist items={topIngredients} />
        </div>

        <h6 style={{marginTop: '20px'}}>Exclude</h6>
        <FilterSearch placeholder="Search for an ingredient..." items={ingredients} id={"ingredients-exclude-drowpdown-options"} callback={callbackExlude} customSet={customExcludeIngredients} checklistName={'exclude'}/>
       
        <div className="popular-item-container">
          <h6>Popular</h6>
          <Checklist items={topIngredients} />
        </div>
      </div>
    </Fragment>
  );
}

const TagSelection = ({topTags, tags, callback, customTags}) => {
  return (
    <Fragment>
      <h5>
        <button className="drop-select-btn dropdown-toggle" type="button" data-bs-toggle="collapse" 
                data-bs-target="#filterTagsContent" aria-controls="filterTagsContent" 
                aria-expanded="false" aria-label="Toggle tag filters"
        >
          Tags
        </button>
      </h5>
      <div id="filterTagsContent" className="collapse">
        <FilterSearch placeholder="Search for a tag..." items={tags} id={"tag-drowpdown-options"} callback={callback} customSet={customTags} checklistName={'tag-list'}/>
        <div className="popular-item-container">
          <h6>Popular</h6>
          <Checklist items={topTags} checklistName={'top-tag-list'}/>
        </div>
      </div>
    </Fragment>
  );
}

// TODO: datalist allows for repeated entries
// this leads to having shared ids of elements so could cause odd behaviour
// it'd be best to either not add duplicates (easiest)
// or update the dropdown items available
class FilterSearch extends React.Component {
  constructor() {
    super();
    this.handleAddingItems = this.handleAddingItems.bind(this);
  }

  handleAddingItems(e) {
    e.preventDefault();
    let value = document.getElementById(this.props.id).value;

    if (value === '') return; // TODO: check against silly/malicious input

    let items = this.props.customSet;
    items.push(value);

    document.getElementById(this.props.id).value = '';

    this.props.callback(items)
  }

  render() {
    let items = [];
    this.props.customSet.forEach(item => {
      items.push(<ChecklistCheckbox checklistName={this.props.checklistName} name={item} value={item} startChecked={true}/>);
    });

    return (
      <Fragment>
          <div className="search-container">
            <div className="search-dropdown-container">

              <div className="form-search-container">
                <input className="form-control" id={this.props.id} list={`items-${this.props.id}`} placeholder={ this.props.placeholder }/>
                <datalist id={`items-${this.props.id}`}> 
                  { this.props.items }
                </datalist>
              </div>
              
              <button className="btn-checklist-add" onClick={(e) => this.handleAddingItems(e)}>Add</button>
            </div>
            
            <div className="chosen-items-container">
              {this.props.customSet.length > 0 ? <h6>Custom</h6> : null}
              {items}
            </div>     
          </div>
      </Fragment>
    )
  }
}

/* Input (type radio) with stars as labels. Inputs are hidden so you choose by clicking the label (the star icon). 
  The order should now be so that when you click the last star on the page, it clicks the star with value 5.
  The clicked and previous stars are filled with black using CSS (.star-rating, .star-rating input etc. in FilterMenu.css) */
const RatingSelection = () => {
  return (
    <Fragment>
      <h5 style={{marginTop: '10px'}}>Minimum rating</h5>
      <div className="star-rating" id="star-rating">
        <input type="radio" name="stars" id="star-5" value="5"/>
        <label className="form-check-label" htmlFor="star-5"><StarIcon className="star-rating-icon" alt="star" /></label>
        <input type="radio" name="stars" id="star-4" value="4"/>
        <label className="form-check-label" htmlFor="star-4"><StarIcon className="star-rating-icon" alt="star" /></label>
        <input type="radio" name="stars" id="star-3" value="3"/>
        <label className="form-check-label" htmlFor="star-3"><StarIcon className="star-rating-icon" alt="star" /></label>
        <input type="radio" name="stars" id="star-2" value="2"/>
        <label className="form-check-label" htmlFor="star-2"><StarIcon className="star-rating-icon" alt="star" /></label>
        <input type="radio" name="stars" id="star-1" value=" 1"/>
        <label className="form-check-label" htmlFor="star-1"><StarIcon className="star-rating-icon" alt="star" /></label>
      </div>
    </Fragment>
  );
}

// TODO: data handling here is pretty bad due to passing data long multiple components
// code also badly needs refactoring because a lot of things are being repeated - I was tracking one bug down
class FilteringMenuContents extends React.Component {
  constructor(){
    super();

    this.state = {
      customExcludeIngredients: [],
      customIncludeIngredients: [],
      customTags: []
    }

    this.updateCustomExcludeIngredients = this.updateCustomExcludeIngredients.bind(this);
    this.updateCustomIncludeIngredients = this.updateCustomIncludeIngredients.bind(this);
    this.updateCustomTags = this.updateCustomTags.bind(this);
    this.getCheckedElements = this.getCheckedElements.bind(this);
    this.checkAll = this.checkAll.bind(this);
  }

  updateCustomExcludeIngredients(items) {
    this.setState({ customExcludeIngredients: items });
  }

  updateCustomIncludeIngredients(items) {
    this.setState({ customIncludeIngredients: items });
  }

  updateCustomTags(items) {
    this.setState({ customTags: items });
  }

  getCheckedElements(elements, id) {
    let checkedElements = [];
    elements.forEach(item => {
      if(document.getElementById(`checkbox-${id}-${item}`).checked)
        checkedElements.push(item);
    });
    return checkedElements;
  }

  checkAll(elements, id) {
    elements.forEach(item => {
      document.getElementById(`checkbox-${id}-${item}`).checked = true;
    });
  }

  render() {
    return (
      <Fragment>
        <h3 id="filtersHeader">Filters</h3>
        <form>
          <div className="filter-menu-contents">
            <CategorySelection />
            
            <IngredientSelection 
              topIngredients={this.props.topIngredients} 
              ingredients={this.props.allIngredients} 
              callbackExlude={this.updateCustomExcludeIngredients} 
              callbackInclude={this.updateCustomIncludeIngredients}
              customExcludeIngredients={this.state.customExcludeIngredients}
              customIncludeIngredients={this.state.customIncludeIngredients}
            />
            
            <TagSelection 
              topTags={this.props.topTags} 
              tags={this.props.allTags} 
              callback={this.updateCustomTags} 
              customTags={this.state.customTags}
            />
            
            <RatingSelection />
          </div>
          <div className="text-center mt-2">
            <button id="apply-filters-btn" onClick={(e) => {
              e.preventDefault();

              let selectedCategory = document.getElementById('categories-select').value;

              let minRating = 0;
              for(let i = 1; i <= 5; i++){
                if(document.getElementById(`star-${i}`).checked)
                  minRating = i;
              }

              let checkedCustomIncludeIngredients = this.getCheckedElements(this.state.customIncludeIngredients, 'include');
              // let checkedCustomIncludeIngredients = [];
              // this.state.customIncludeIngredients.forEach(item => {
              //   if(document.getElementById(`checkbox-include-${item}`).checked)
              //     checkedCustomIncludeIngredients.push(item);
              // })

              let checkedCustomExcludeIngredients = this.getCheckedElements(this.state.customExcludeIngredients, 'exclude');
              // let checkedCustomExcludeIngredients = [];
              // this.state.customExcludeIngredients.forEach(item => {
              //   if(document.getElementById(`checkbox-exclude-${item}`).checked)
              //     checkedCustomExcludeIngredients.push(item);
              // })

              let checkedCustomTags = this.getCheckedElements(this.state.customTags, 'tag-list');
              // let checkedCustomTags = [];
              // this.state.customTags.forEach(item => {
              //   if(document.getElementById(`checkbox-tag-list-${item}`).checked)
              //   checkedCustomTags.push(item);
              // })

              this.setState({
                customIncludeIngredients: checkedCustomIncludeIngredients,
                customExcludeIngredients: checkedCustomExcludeIngredients,
                customTags: checkedCustomTags

              }, () => {
                // BUG: removing unchecked item turns the following item into unchecked too
                // setting it to checked manually (still gets correct set state)
                this.checkAll(this.state.customIncludeIngredients, 'include');
                this.checkAll(this.state.customExcludeIngredients, 'exclude');
                this.checkAll(this.state.customTags, 'tag-list');
                // this.state.customIncludeIngredients.forEach(item => {
                //   document.getElementById(`checkbox-include-${item}`).checked = true;
                // });
                // this.state.customExcludeIngredients.forEach(item => {
                //   document.getElementById(`checkbox-exclude-${item}`).checked = true;
                // })
                // this.state.customTags.forEach(item => {
                //   document.getElementById(`checkbox-tag-list-${item}`).checked = true;
                // })
              });

              //TODO: can get the popular selections by looking up them by ID from the original arrays rather than passing state
              // assemble everything into a nice json for callback to then make the recipe query

              this.props.filteringCallback(e);      
            }}>Apply filters</button>
          </div>
        </form>
      </Fragment>
    );
  }
}

/* The nav is set to just collapse instead of collapse-horizontal to make it look better on mobile, 
  but now the PC collapse transition looks a bit janky (setting min-width for the menu could also play a part in that)... 
  
  .filter-menu-container fixes the filtering menu in place when on PC, but when the screen is small enough 
  its position is changed to static so mobile users can scroll past it while the filtering menu is open. 
  
  The contents in the filtering menu are set to overflow-y scroll so if you have a lot of content you have a scrollbar
  inside the filtering menu. This way the header "Filters" and the applying button are always show to the user
  and the filtering menu can be set to fixed so that you can apply filters even if you've scrolled far down on the page.
  
  The checkboxes etc. still use Bootstrap's default colors. In the prototype those checkboxes were colored with a color
  from the color palette so that's still missing.*/
class FilteringMenu extends React.Component {
  constructor() {
    super();
  }

  render(){
    // TODO: these should be fetched when the component mounts and stored
    let topIngredients = ['ingredient1', 'ingredient2', 'ingredient3', 'ingredient4', 'ingredient5', 'ingredient6', 'ingredient7', 'ingredient8', 'ingredient9'];

    let topIngredientList = [];
    topIngredients.forEach(ingredient => {
      topIngredientList.push(<ChecklistCheckbox name={ingredient} value={ingredient} checklistName={'top-ingredient-list'}/>);
    });

    let topTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

    let topTagList = [];
    topTags.forEach(tag => {
      topTagList.push(<ChecklistCheckbox name={tag} value={tag} checklistName={'top-tag-list'}/>);
    });

    let allIngredients = ['apples', 'milk', 'butter', 'eggs', 'wheat', 'pears', 'cheese', 'sugar', 'bread'];
    
    let ingredientOptions = [];
    allIngredients.forEach(item => {
      ingredientOptions.push(<option value={item}/>);
    });

    let allTags = ['novelty', 'easy', 'diet', 'low-carb', 'sweet', 'healthy', 'illegal', 'hard', 'fast'];

    let tagOptions = [];
    allTags.forEach(item => {
      tagOptions.push(<option value={item}/>);
    });

    return (
      <Fragment>
        <nav id="filtering-menu" className="collapse">
          <div className="filter-menu-container">
            <FilteringMenuContents 
              filteringCallback={this.props.filteringCallback} 
              topTags={topTagList}
              topIngredients={topIngredientList}
              allIngredients={ingredientOptions}
              allTags={tagOptions}
            />
          </div>
        </nav>
      </Fragment>
    )
  }
}

  export default FilteringMenu;