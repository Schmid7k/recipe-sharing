import React, { Fragment } from "react";

import "./ContentGrid.css"

class ContentGrid extends React.Component {
    render(){
        return (
            <Fragment>
                {this.props.searchPhrase && this.props.searchPhrase !== '' ? <h4 className="text-center" style={{ fontWeight: 'bold' }}>Searching for: '{this.props.searchPhrase}'</h4> : null}
                <div className="content-grid-container" id='content-grid-container'>
                    {this.props.content}
                </div>
            </Fragment> 
        )
    } 
}

export default ContentGrid;