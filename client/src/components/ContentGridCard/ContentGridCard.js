import React, { Fragment } from "react";
import PropTypes from 'prop-types';

import "./ContentGridCard.css";

/**
 * Component for rendering a single content grid card that has a recipe image and the title on it.
 * @param   {string}    title    Recipe title to be displayed on the content grid card in string format
 * @param   {string}    img    Image path to the image to be shown on the content grid card in string format
 * @param   {function}    cardCallback  A callback function to be executed when the user clicks on a content
 *                                      grid card
 * @param   {string}    id    Recipe id of the recipe in string format
 * @returns A <Fragment> element with a .content-grid-card-container div containing a recipe image <img> element
 *          and a div containing the recipe title inside it.
 */
const ContentGridCard = ({ title, img, cardCallback, id }) => {
    return (
       <Fragment>
            <div className="content-grid-card-container" onClick={() => cardCallback(id)}>
                <img className="content-grid-card-img" src={img} alt={title} />
                <div className="content-grid-card-title">{title}</div>
            </div>
      </Fragment>
    )
}

ContentGridCard.propTypes = {
    title: PropTypes.string.isRequired,
    img: PropTypes.string.isRequired
}

export default ContentGridCard;