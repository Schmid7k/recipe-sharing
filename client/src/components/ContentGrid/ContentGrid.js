import React, { Fragment } from "react";

import "./ContentGrid.css"

/**
 * Component for displaying a content grid. If a search phrase has been entered, the search phrase
 * is show to the user with text 'Searching for: [search phrase]' above the content grid cards.
 * @param   {string}    this.props.searchPhrase The possible search phrase used in string format
 * @param   {array}   this.props.content    Array of <ContentGridCard> elements
 * @returns A <Fragment> with a conditionally added <h4> header and a .content-grid-container div
 *          filled with <ContentGridCard> elements
 */
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