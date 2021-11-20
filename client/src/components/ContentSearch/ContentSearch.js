import React, { Fragment } from "react";
import "./ContentSearch.css";

import FilteringMenu from "../FilterMenu/FilterMenu"
import ContentGrid from "../ContentGrid/ContentGrid";
import SearchPopup from "../SearchPopup/SearchPopup";
import ContentGridCard from "../ContentGridCard/ContentGridCard";
import recipes from "../../grid-placeholder-data.json";

class ContentSearch extends React.Component {
    constructor(){
        super();

        this.state = {
            recipeCards: [],
            popupDisplay: false, // modifying display directly, but still need to keep track of state here
            scrollbarWidth: 0 // stashed value
        }

        this.popupToggleHandler = this.popupToggleHandler.bind(this);
        this.filteringHandler = this.filteringHandler.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }

    handleResize() {
        let gridContainer = document.getElementById('grid-container');
        let popup = document.getElementById('search-popup-container-bg');

        // position the popup to start at the top left corner of the grid
        if(gridContainer && popup) {
            let rect = document.getElementById('grid-container').getBoundingClientRect();
            
            popup.style.left = `${rect.left}px`;  
            popup.style.width = `${rect.width + this.state.scrollbarWidth}px`; 
        }  
    }
    
    // NOTE: this is very much not a React way of doing things, but the best I can cook up for the popup card
    popupToggleHandler(){ 
        let gridContainer = document.getElementById('grid-container');
        let navbar = document.getElementById('main-navbar');
        let popup = document.getElementById('search-popup-container-bg');

        if (!gridContainer || !navbar || !popup) return;

        let rect = gridContainer.getBoundingClientRect();
        let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        if(!this.state.popupDisplay){
            // hide the body scrollbar and preserve offset of elements due to scrollbar being removed
            document.body.style.overflowY = 'hidden';  
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            navbar.style.marginRight = `${scrollbarWidth}px`;  

            // position and display the popup, it will add a new scrollbar that will take the place of the old one
            popup.style.left = `${rect.left}px`;  
            popup.style.width = `${rect.width + scrollbarWidth}px`;  
            popup.style.display = 'inline';

            // reset scroll to top
            gridContainer.scrollTop = 0;
        } else {
            // return to default state
            document.body.style.overflowY = 'scroll';
            document.body.style.paddingRight = '0px';
            navbar.style.marginRight = '0px'; 
            popup.style.display = 'none';
        }

        this.setState({
            popupDisplay: !this.state.popupDisplay,
            scrollbarWidth: scrollbarWidth
        });
    }

    filteringHandler(e) {
        e.preventDefault();
        console.log('applying filters');
        //TODO: should make a fetch request here with new filters to rebuild the cards, then scroll to top

        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    componentDidMount(){
        window.addEventListener('resize', () => this.handleResize());
       
        // ResizeObserver should be supported by all major browsers, we need this to work with the filtering menu collapsing
        let gridResizeObserver = new ResizeObserver(() => this.handleResize());
        gridResizeObserver.observe(document.getElementById('grid-container'));

        fetch('http://localhost:5000/recipes', {method: 'GET'}).then(res => res.json()).then(res => console.log(res));
        fetch('http://localhost:5000/filters', {method: 'GET'}).then(res => res.json()).then(res => console.log(res));
        // TODO: fetch some recipe data when loading the grid for the first time, construct the recipe cards
        let recipeCards = [];

        recipes.recipes.forEach((recipe, idx) => {
            recipeCards.push(<ContentGridCard title={recipe.title} img={recipe.img} key={idx} cardCallback={this.popupToggleHandler}/>);
        });

        this.setState({
            recipeCards: recipeCards
        });
    }

    render(){
        return (
            <Fragment>
                <div className="container-fluid container-flex">
                    <FilteringMenu filteringCallback={this.filteringHandler} />

                    <div className="content-search-grid-container" id='grid-container'>
                        <SearchPopup display={this.state.popupDisplay} closeCallback={this.popupToggleHandler} />
                        <ContentGrid content={this.state.recipeCards} />
                    </div>        
                </div>
            </Fragment>
        );
    }
}

export default ContentSearch;
