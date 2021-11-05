import React, { Fragment } from "react";
import PropTypes from 'prop-types';

import "./ContentGridCard.css";

const ContentGridCard = ({title, img}) => {
    return (
       <Fragment>
            <div className="content-grid-card-container">
                <img className="content-grid-card-img" src={img}/>
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