import React, { Fragment } from "react";
import "./FilterMenu.css";
import {ReactComponent as StarIcon} from "../../images/star_icon.svg";

/**
 * Component for rendering a 'Category' header and a select with different categories as options.
 * A placeholder option with the text 'Select a category' is chosen by default but is hidden whe
 * a new category option is chosen.
 * @param {Array} categories  Array of categories to be displayed as options in the select
 * @returns A <Fragment> element with a <h5> header and a select component
 */
const CategorySelection = ({categories}) => {
  let catOptions = [];
  categories.forEach(cat => {
    catOptions.push(<option value={cat} key={cat}>{cat}</option>)
  })

  return (
    <Fragment>
      <h5><label htmlFor="categories-select">Category</label></h5>
      <select name="categories" id="categories-select" className="form-select" defaultValue="placeholder">
        <option value="placeholder" disabled hidden>Select a category</option>
        {catOptions}
      </select>
    </Fragment>
  );
}

/**
 * Component for rendering a single checkbox and its label. It keeps track of whether it is checked
 * or not in its state.
 * @param {string}  this.props.checklistName  Name of the checklist where this checkbox is included
 * @param {string}  this.props.value  Value for the checkbox
 * @param {string}  this.props.name Name for the checkbox value that is shown on its label
 * @returns A <Fragment> element with a .form-check div with a checkbox input and label inside it.
 */
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
          <label className="form-check-label filter-checkbox-item" htmlFor={`checkbox-${this.props.checklistName}-${this.props.value}`}> {this.props.name}</label>
        </div>
      </Fragment>
    );
  }
}

/**
 * Component for rendering a list of <ChecklistCheckbox> elements.
 * @param {Array}  items  An array of <ChecklistCheckbox> elements to be displayed
 * @returns A <Fragment> element with <ChecklistCheckbox> elements inside it.
 */
const Checklist = ({ items }) => {
  return (
    <Fragment>
      {items}
    </Fragment>
  );
}

/**
 * Component for rendering a dropdown title 'Ingredients' with a spinning arrow to indicate
 * whether pressing it expands or collapses the thing and the dropdown contents.
 * @param {Array}  include  An array of popular ingredients to render under 'Popular' in 'Include'
 * @param {Array}  exclude  An array of popular ingredients to render under 'Popular' in 'Exclude'
 * @param {Array}  ingredients  An array of all ingredients in the database
 * @param {Function}  callbackExlude  A callback function for dealing with ingredient exclusion
 * @param {Function}  callbackInclude  A callback function for dealing with ingredient inclusion
 * @param {Array}  customExcludeIngredients  An array of custom ingredients to render under 'Custom' in 'Exclude'
 * @param {Array}  customIncludeIngredients  An array of custom ingredients to render under 'Custom' in 'Include'
 * @returns A <Fragment> element with a button and a collapsible div containing <FilterSearch> and <Checklist> elements
 */
const IngredientSelection = ({ include, exclude, ingredients, callbackExlude, callbackInclude, customExcludeIngredients, customIncludeIngredients }) => {
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
          <Checklist items={include} />
        </div>

        <h6 style={{marginTop: '20px'}}>Exclude</h6>
        <FilterSearch placeholder="Search for an ingredient..." items={ingredients} id={"ingredients-exclude-drowpdown-options"} callback={callbackExlude} customSet={customExcludeIngredients} checklistName={'exclude'}/>
       
        <div className="popular-item-container">
          <h6>Popular</h6>
          <Checklist items={exclude} />
        </div>
      </div>
    </Fragment>
  );
}

/**
 * Component for rendering a dropdown title 'Tags' with a spinning arrow to indicate
 * whether pressing it expands or collapses the thing and the dropdown contents.
 * @param {Array}  topTags  An array of popular tags to render under 'Popular'
 * @param {Array}  tags  An array of custom tags to render under 'Custom'
 * @param {Function}  callback  A callback function for dealing with tag inclusion
 * @param {Array}  customTags  An array of custom tags to render under 'Custom'
 * @returns A <Fragment> element with a button and a collapsible div containing <FilterSearch> and <Checklist> elements
 */
const TagSelection = ({ topTags, tags, callback, customTags }) => {
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

/**
 * Component for rendering a input field with a datalist for new items and a list showing items created 
 * based on the user's inputs.
 * @param {String}  this.props.id  A ID for this FilterSearch
 * @param {String}  this.props.placeholder  A placeholder to show in the input field in string format
 * @param {Array}  this.props.items  An array of items to display in the input datalist
 * @param {Function}  this.props.callback  A callback function for dealing with added items
 * @param {Array}  this.props.customSet  A set of items to be shown under 'Custom'
 * @param {String}  this.props.checklistName  The name to be given to the created checklists
 * @returns A <Fragment> element with a .search-container div that contains divs for element inputting
 *          and showing a list of elements based on the inputted values
 */
class FilterSearch extends React.Component {
  constructor() {
    super();

    this.state = { error: null }

    this.handleAddingItems = this.handleAddingItems.bind(this);
  }

  handleAddingItems(e) {
    e.preventDefault();
    // get value from input field
    let value = document.getElementById(this.props.id).value.toLowerCase().trim();

    // check that the value isn't empty
    if (value === '') return;

    let items = this.props.customSet;
    // check for duplicates
    if (!items.includes(value)) {
      // add item
      items.push(value);
      document.getElementById(this.props.id).value = '';
      this.props.callback(items);
      this.setState({ error: null });
    } else {
      let error = "Ingredient already added";
      this.setState({ error: error });
    }
  }

  render() {
    let items = [];
    this.props.customSet.forEach(item => {
      items.push(<ChecklistCheckbox checklistName={this.props.checklistName} name={item} value={item} startChecked={true} key={`checklist-${item}`} />);
    });

    return (
      <Fragment>
          <div className="search-container">
            {this.state.error ? <div className="alert alert-danger" role="alert">{this.state.error}</div> : null}
            <div className="search-dropdown-container">
              <div className="form-search-container">
                <input className="form-control" id={this.props.id} list={`items-${this.props.id}`} placeholder={ this.props.placeholder } autoComplete="off"/>
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

/**
 * Component for rendering a 'Minimum rating' header and a radio-type input for minimum star rating input.
 * @returns A <Fragment> element with a <h5> header and a div containing inputs and labels for the stars.
 */
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

/**
 * Component for rendering filtering menu contents.
 * @param {Array}  this.props.categories  An array of all categories in the database
 * @param {Function}  this.props.filteringCallback  A callback function for dealing with filtering functionality
 * @param {Array}  this.props.topTags  An array of <ChecklistCheckbox> elements of most popular tags
 * @param {Array}  this.props.topIngredientsInclude  An array of <ChecklistCheckbox> elements of most popular 
 *                                                   ingredients to be listed under 'Include'
 * @param {Array}  this.props.topIngredientsExclude  An array of <ChecklistCheckbox> elements of most popular 
 *                                                   ingredients to be listed under 'Exclude'
 * @param {Array}  this.props.allIngredients  An array of all ingredients in the database
 * @param {Array}  this.props.allTags  An array of all tags in the database
 * @param {Array}  this.props.popIngredientNames  An array of popular ingredients in the database
 * @param {Array}  this.props.popTagNames  An array of popular tags in the database
 * @returns A <Fragment> element with a <h3> header and a <form> element.
 */
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
    this.constructFilters = this.constructFilters.bind(this);
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

  constructFilters() {
    // get selected category
    let selectedCategory = document.getElementById('categories-select').value;

    // get selected minimum rating
    let minRating = 0;
    for(let i = 1; i <= 5; i++){
      if(document.getElementById(`star-${i}`).checked)
        minRating = i;
    }

    // get checked custom ingredients
    let checkedCustomIncludeIngredients = this.getCheckedElements(this.state.customIncludeIngredients, 'include');
    let checkedCustomExcludeIngredients = this.getCheckedElements(this.state.customExcludeIngredients, 'exclude');
    // get checked custom tags
    let checkedCustomTags = this.getCheckedElements(this.state.customTags, 'tag-list');
    // get checked popular tags
    let checkedTopTags = this.getCheckedElements(this.props.popTagNames, 'top-tag-list');
    // get checked popular ingredients
    let checkedTopIngredientsInclude = this.getCheckedElements(this.props.popIngredientNames, 'top-ingredient-include-list')
    let checkedTopIngredientsExclude = this.getCheckedElements(this.props.popIngredientNames, 'top-ingredient-exclude-list')

    this.setState({
      customIncludeIngredients: checkedCustomIncludeIngredients,
      customExcludeIngredients: checkedCustomExcludeIngredients,
      customTags: checkedCustomTags

    }, () => {
      this.checkAll(this.state.customIncludeIngredients, 'include');
      this.checkAll(this.state.customExcludeIngredients, 'exclude');
      this.checkAll(this.state.customTags, 'tag-list');
    });

    // construct filter
    let filter = {
      inIngredients: checkedTopIngredientsInclude.concat(this.state.customIncludeIngredients),
      outIngredients: checkedTopIngredientsExclude.concat(this.state.customExcludeIngredients),
      tags: checkedTopTags.concat(this.state.customTags),
      category: selectedCategory,
      rating: minRating,
      searchPhrase: document.getElementById('navbar-searchbar').value
    }

    return filter;
  }

  render() {
    return (
      <Fragment>
        <h3 id="filtersHeader">Filters</h3>
        <form>
          <div className="filter-menu-contents">
            <CategorySelection categories={this.props.categories}/>
            
            <IngredientSelection 
              include={this.props.topIngredientsInclude} 
              exclude={this.props.topIngredientsExclude} 
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
              let filters = this.constructFilters();
              this.props.filteringCallback(filters);      
            }}>Apply filters</button>
          </div>
        </form>
      </Fragment>
    );
  }
}

/**
 * Component for rendering the filtering menu.
 * @returns A <Fragment> element with a collapsable <nav> element inside it.
 */
class FilteringMenu extends React.Component {
  constructor() {
    super();

    this.state = {
      categories: [],
      topTags: [],
      topIngredientsInclude: [],
      topIngredientsExclude: [],
      ingredientOptions: [],
      tagOptions: [],
      popIngredientNames: [],
      popTagNames: []
    }

    this.handleFetchingFilters = this.handleFetchingFilters.bind(this);
  }

  handleFetchingFilters(data) {
    // populate the filtering menu with fetched filters data
    let topIngredientListInclude = [];
    let topIngredientListExclude = [];
    data.popIngredients.forEach(ingredient => {
      topIngredientListInclude.push(<ChecklistCheckbox name={ingredient} value={ingredient} checklistName={'top-ingredient-include-list'} key={`${ingredient}-include`}/>);
      topIngredientListExclude.push(<ChecklistCheckbox name={ingredient} value={ingredient} checklistName={'top-ingredient-exclude-list'} key={`${ingredient}-exclude`}/>);
    });

    let ingredientOptions = [];
    data.allIngredients.forEach(item => {
      ingredientOptions.push(<option value={item} key={item}/>);
    });

    let topTagList = [];
    data.popTags.forEach(tag => {
      topTagList.push(<ChecklistCheckbox name={tag} value={tag} checklistName={'top-tag-list'} key={`${tag}-top`}/>);
    });

    let tagOptions = [];
    data.allTags.forEach(item => {
      tagOptions.push(<option value={item} key={`${item}-option`}/>);
    });

    this.setState({
      categories: data.allCategories,
      topTags: topTagList,
      topIngredientsInclude: topIngredientListInclude,
      topIngredientsExclude: topIngredientListExclude,
      ingredientOptions: ingredientOptions,
      tagOptions: tagOptions,
      popIngredientNames: data.popIngredients,
      popTagNames: data.popTags
    });
  }

  componentDidMount(){
    // fetch filters to be used in the filtering menu
    fetch('/filters', {method: 'GET'})
    .then(res => res.json())
    .then(res => this.handleFetchingFilters(res));
  }

  render(){
    return (
      <Fragment>
        <nav id="filtering-menu" className="collapse">
          <div className="filter-menu-container">
            <FilteringMenuContents 
              categories={this.state.categories}
              filteringCallback={this.props.filteringCallback} 
              topTags={this.state.topTags}
              topIngredientsInclude={this.state.topIngredientsInclude}
              topIngredientsExclude={this.state.topIngredientsExclude}
              allIngredients={this.state.ingredientOptions}
              allTags={this.state.tagOptions}
              popIngredientNames={this.state.popIngredientNames}
              popTagNames={this.state.popTagNames}
              ref={this.props.filterSearch}
            />
          </div>
        </nav>
      </Fragment>
    )
  }
}

export default FilteringMenu;