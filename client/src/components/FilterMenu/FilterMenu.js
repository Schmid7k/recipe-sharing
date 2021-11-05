import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./FilterMenu.css";
import {ReactComponent as StarIcon} from "../../images/star_icon.svg";

/* Creates a dropdown select menu for the categories. "Select a category" is shown as a placeholder
  but is hidden in the actual dropdown menu and can't be chosen. */
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

/*Creates a checkbox for "name" and with a value of"*value". Used for the dummy lists below. */
const ChecklistCheckbox = ({ name, value }) => {
  return (
    <Fragment>
      <div className="form-check">
        <input className="form-check-input" type="checkbox" id={value} name={value} value={value} />
        <label className="form-check-label" htmlFor={value}> {name}</label>
      </div>
    </Fragment>
  );
}

ChecklistCheckbox.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

/*Creates a dummy list of checkboxes for the ingredient selection*/
const IngredientChecklist = () => {
  return (
    <Fragment>
      <ChecklistCheckbox name="Ingredient" value="ingredient1" />
      <ChecklistCheckbox name="Ingredient" value="ingredient2" />
      <ChecklistCheckbox name="Ingredient" value="ingredient3" />
      <ChecklistCheckbox name="Ingredient" value="ingredient4" />
      <ChecklistCheckbox name="Ingredient" value="ingredient5" />
      <ChecklistCheckbox name="Ingredient" value="ingredient6" />
      <ChecklistCheckbox name="Ingredient" value="ingredient7" />
    </Fragment>
  );
}

/*Creates a dummy list of checkboxes for the tag selection*/
const TagChecklist = () => {
  return (
    <Fragment>
      <ChecklistCheckbox name="Tag" value="tag1" />
      <ChecklistCheckbox name="Tag" value="tag2" />
      <ChecklistCheckbox name="Tag" value="tag3" />
    </Fragment>
  );
}

/* Dropdown title "Ingredients" with a spinning arrow to indicate whether pressing it expands or collapses the thing.
  Has "Include" and "Exclude" headers and a list of checkboxes currently. To match the layout sketches, it still should have some
  kind of "see more.." button for showing more ingredient checkboxes and limit the initial amount of ingredient checkboxes shown.
  Since both the include and exclude lists just include a dummy checkbox list component currently, clicking on the exclude
  checkbox labels fills in the include ones due to shared id's.*/
const IngredientSelection = () => {
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
        <IngredientChecklist />
        <h6>Exclude</h6>
        <IngredientChecklist />
      </div>
    </Fragment>
  );
}

/* Dropdown title "Tags" with a spinning arrow to indicate whether pressing it expands or collapses the thing.
  Has a dummy search bar and list of checkboxes currently. To match the layout sketches, it still should have some
  kind of "see more.." button for showing more tag checkboxes and limit the initial amount of tag checkboxes shown.*/
const TagSelection = () => {
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
        <input className="form-control mr-sm-2" type="search" placeholder="Search for a tag..." />
        <TagChecklist />
      </div>
    </Fragment>
  );
}

/* Input (type radio) with stars as labels. Inputs are hidden so you choose by clicking the label (the star icon). 
  The order should now be so that when you click the last star on the page, it clicks the star with value 5.
  The clicked and previous stars are filled with black using CSS (.star-rating, .star-rating input etc. in FilterMenu.css) */
const RatingSelection = () => {
  return (
    <Fragment>
      <h5>Minimum rating</h5>
      <div className="star-rating">
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

const FilteringMenuContents = () => {
  return (
    <Fragment>
      <h3 id="filtersHeader">Filters</h3>
      <form>
        <div className="filter-menu-contents">
          <CategorySelection />
          <IngredientSelection />
          <TagSelection />
          <RatingSelection />
        </div>
        <div className="text-center mt-2">
          <button id="apply-filters-btn"type="submit">Apply filters</button>
        </div>
      </form>
    </Fragment>
  );
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
const FilteringMenu = () => {
    return (
      <Fragment>
        <nav id="filtering-menu" className="collapse">
          <div className="filter-menu-container">
            <FilteringMenuContents />
          </div>
        </nav>
      </Fragment>
    );
  };

  export default FilteringMenu;