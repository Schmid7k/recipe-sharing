import React, { Fragment } from "react";
import "./ContentSearch.css";

import FilteringMenu from "../FilterMenu/FilterMenu"
import ContentGrid from "../ContentGrid/ContentGrid";
import SearchPopup from "../SearchPopup/SearchPopup";
import ContentGridCard from "../ContentGridCard/ContentGridCard";

/**
 * Component containing the recipe grid (ContentGrid), the recipe popup (SearchPopup) and the filtering menu (FilteringMenu).
 */
class ContentSearch extends React.Component {
    constructor(){
        super();

        this.state = {
            recipeCards: [],
            popupDisplay: false, // modifying display directly, but still need to keep track of state here
            scrollbarWidth: 0, // stashed value
            overflow: '',
            display: 'none', // modify display when building cards to not show empty items while data is being loaded
            searchPhrase: ''
        }

        this.popup = React.createRef();

        this.popupToggleHandler = this.popupToggleHandler.bind(this);
        this.filteringHandler = this.filteringHandler.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.buildCards = this.buildCards.bind(this);
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

    popupToggleHandler(id){ 
        let gridContainer = document.getElementById('grid-container');
        let navbar = document.getElementById('main-navbar');
        let popup = document.getElementById('search-popup-container-bg');

        if (!gridContainer || !navbar || !popup) return;

        let rect = gridContainer.getBoundingClientRect();
        let scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        if(!this.state.popupDisplay){
            this.setState({ overflow: document.body.style.overflowY });
            // hide the body scrollbar and preserve offset of elements due to scrollbar being removed
            document.body.style.overflowY = 'hidden';  
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            navbar.style.marginRight = `${scrollbarWidth}px`;  

            // position and display the popup, it will add a new scrollbar that will take the place of the old one
            popup.style.left = `${rect.left}px`;  
            popup.style.width = `${rect.width + scrollbarWidth}px`;  
            popup.style.display = 'inline';

            gridContainer.scrollTop = 0;

            this.popup.current.updateData(id);
        } else { // return to default state      
            document.body.style.overflowY = this.state.overflow;
            document.body.style.paddingRight = '0px';
            navbar.style.marginRight = '0px'; 
            popup.style.display = 'none';
        }

        this.setState({
            popupDisplay: !this.state.popupDisplay,
            scrollbarWidth: scrollbarWidth
        });
    }

    filteringHandler(filters) {
        // base url to build upon
        let url = '/recipes?';

        // search phrase is included in filters
        if (filters.searchPhrase) {
            this.setState({ searchPhrase: filters.searchPhrase });
        } 
        // new search phrase not included but previous search had a search phrase (= filtering search phrase results)
        // so include it in the filters
        else if (!filters.searchPhrase && this.state.searchPhrase !== '') {
            url = url.concat(`searchPhrase=${this.state.searchPhrase}&`);
        }

        // add filter values to the url
        Object.keys(filters).forEach(key => {
            // add non-array format filters that aren't placeholder values
            if (!Array.isArray(filters[key]) && filters[key] !== "placeholder") {
                url = url.concat(`${key}=${filters[key]}&`);
            } 
            // add array format filters
            else if (Array.isArray(filters[key]) && filters[key].length > 0) {
                let values = '';
                filters[key].forEach(value => values = values.concat(`%22${value.toLowerCase()}%22,`));
                values = values.slice(0, -1);
                url = url.concat(`${key}=[${values}]&`);
            }
        });

        // get rid of the last '&' and replace spaces with '+'
        url = url.slice(0, -1).replace(' ', '+');

        // get recipes with filters
        fetch(url, {
          method: 'GET',
        })
        .then(response => {
            if (response.ok) {
            return response.json();
            }
            throw new Error('Something went wrong...');
        })
        .then(recipes => {
            this.buildCards(recipes);
        })
        .catch((error) => {
            console.error(error);
        });

        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    buildCards(data){
        this.setState({
            display: 'none'
        }, () => {
            let recipeCards = [];

            data.forEach((recipe) => {
                recipeCards.push(<ContentGridCard title={recipe.title} img={recipe.mainimage} key={recipe.recipeid} cardCallback={this.popupToggleHandler} id={recipe.recipeid}/>);
            });

            this.setState({
                recipeCards: recipeCards,
                display: 'flex'
            });
        });   
    }

    componentDidMount(){
        window.addEventListener('resize', () => this.handleResize());
       
        // ResizeObserver should be supported by all major browsers, we need this to work with the filtering menu collapsing
        let gridResizeObserver = new ResizeObserver(() => this.handleResize());
        gridResizeObserver.observe(document.getElementById('grid-container'));

        //initial data, fetching with no filters
        fetch('/recipes', { method: 'GET' }).then(res => res.json()).then(res => { this.buildCards(res); });
    }

    render(){
        return (
            <Fragment>
                <div className="container-fluid container-flex" style={{display: this.state.display}}>
                    <FilteringMenu filteringCallback={this.filteringHandler} filterSearch={this.props.filterSearch}/>

                    <div className="content-search-grid-container" id='grid-container'>
                        <SearchPopup display={this.state.popupDisplay} closeCallback={this.popupToggleHandler} ref={this.popup}/>
                        <ContentGrid content={this.state.recipeCards} searchPhrase={this.state.searchPhrase} />
                    </div>        
                </div>
            </Fragment>
        );
    }
}

export default ContentSearch;
