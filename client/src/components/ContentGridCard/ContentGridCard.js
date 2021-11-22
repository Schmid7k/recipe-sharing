import React, { Fragment } from "react";
import PropTypes from 'prop-types';

import "./ContentGridCard.css";

const ContentGridCard = ({title, img, cardCallback, id}) => {
    return (
       <Fragment>
            <div className="content-grid-card-container" onClick={() => cardCallback(id)}>
                <img className="content-grid-card-img" src={img.replace(/\\/g, '/').replace('../client/public/', '')}/>
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