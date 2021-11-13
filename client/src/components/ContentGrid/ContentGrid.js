import React from "react";

import "./ContentGrid.css"

class ContentGrid extends React.Component {
    render(){
        return (
            <div className="content-grid-container" id='content-grid-container'>
                {this.props.content}
            </div>    
        )
    } 
}

export default ContentGrid;