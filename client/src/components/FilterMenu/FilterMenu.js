import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./FilterMenu.css";
import {ReactComponent as StarIcon} from "../../images/star_icon.svg";

/* Creates a dropdown select menu for the categories. "Select a category" is shown as a placeholder
  but is hidden in the actual dropdown menu and can't be chosen. */
  // NOTE: I suppose category selection can be hardcoded rather than try fetching values from DB, since it's only few
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
const IngredientSelection = ({include, exclude, ingredients, callbackExlude, callbackInclude, customExcludeIngredients, customIncludeIngredients}) => {
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
    this. constructFilters = this.constructFilters.bind(this);
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
    let selectedCategory = document.getElementById('categories-select').value;

    let minRating = 0;
    for(let i = 1; i <= 5; i++){
      if(document.getElementById(`star-${i}`).checked)
        minRating = i;
    }

    let checkedCustomIncludeIngredients = this.getCheckedElements(this.state.customIncludeIngredients, 'include');
    let checkedCustomExcludeIngredients = this.getCheckedElements(this.state.customExcludeIngredients, 'exclude');
    let checkedCustomTags = this.getCheckedElements(this.state.customTags, 'tag-list');
    let checkedTopTags = this.getCheckedElements(this.props.popTagNames, 'top-tag-list');
    let checkedTopIngredientsInclude = this.getCheckedElements(this.props.popIngredientNames, 'top-ingredient-include-list')
    let checkedTopIngredientsExclude = this.getCheckedElements(this.props.popIngredientNames, 'top-ingredient-exclude-list')

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
    });

    return {
      include : checkedTopIngredientsInclude.concat(this.state.customIncludeIngredients),
      exclude: checkedTopIngredientsExclude.concat(this.state.customExcludeIngredients),
      tags: checkedTopTags.concat(this.state.customTags),
      category: selectedCategory,
      rating: minRating
    }
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
              // console.log(filters);
              this.props.filteringCallback(filters);      
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
    // console.log(data)
    let topIngredientListInclude = [];
    let topIngredientListExclude = [];
    data.popIngredients.forEach(ingredient => {
      topIngredientListInclude.push(<ChecklistCheckbox name={ingredient} value={ingredient} checklistName={'top-ingredient-include-list'} key={`${ingredient}-include`}/>);
      topIngredientListExclude.push(<ChecklistCheckbox name={ingredient} value={ingredient} checklistName={'top-ingredient-exclude-list'} key={`${ingredient}-exclude`}/>);
    });

    // console.log(topIngredientListInclude);
    // console.log(topIngredientListExclude)

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
    fetch('http://localhost:5000/filters', {method: 'GET'})
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
            />
          </div>
        </nav>
      </Fragment>
    )
  }
}

  export default FilteringMenu;