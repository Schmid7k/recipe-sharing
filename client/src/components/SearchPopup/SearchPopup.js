import React, {Fragment} from "react";
import "./SearchPopup.css";
import recipeInfo from "../../recipe-placeholder-data.json";
import closeBtnIcon from "../../images/close-round-btn.svg";
import bookmarkIcon from "../../images/bookmark_svg.svg";
import starIcon from "../../images/star_svg.svg";

import { Link } from 'react-router-dom'

// TODO: not sure if these should be functional to allow rating here or saving
const PopupRating = ({number, icon}) => {
    return(
        <Fragment>
            <div className="popup-rating-container">
                <div className="popup-number" style={{fontWeight: 'bold', fontSize: '1.5em'}}>{number}</div>
                <img className="popup-rating-icon" style={{ filter: 'brightness(0)' }} src={icon}></img>
            </div>
        </Fragment>
    )
}

const PopupInstructionStep = ({stepNumber, stepText}) => {
    return(
        <Fragment>
            <div className="popup-step-container">
                <div style={{fontWeight: 'bold'}}>Step {stepNumber}</div>
                <div>{stepText}</div>
            </div>
        </Fragment>
    )
}

const PopupIngredient = ({ingredientName, quantity}) => {
    return(
        <Fragment>
            <div className="popup-ingredient-item-container">
                <div className="popup-ingredient-name">{ingredientName}</div>
                <div className="popup-ingredient-quantity">{quantity}</div>
            </div>
        </Fragment>
    )
}

const PopupTag = ({tagText}) => {
    // TODO: selecting a tag should redirect to a search with tag as the only filter
    return(
        <Fragment>
            <div className="popup-tag">{tagText}</div>
        </Fragment>
    )
}

const IngredientList = ({title, items}) => {
    return(
        <div style={{marginBottom: '20px'}}>
            <div style={{fontWeight: 'bold'}}>{title}</div>
            {items}
        </div>
    )
}

const SearchPopupContent = ({callback, data}) => {
    let tags = [];
    data.tags.forEach(t => {
        tags.push(<PopupTag tagText={t} key={t}/>);
    });

    return (
        <Fragment>
            <img className="popup-close-btn" src={closeBtnIcon} onClick={callback}></img>
            <img className="search-popup-img" src={data.image}/>
            <div className="popup-body">
                <div className="popup-header-container">
                    <div className="popup-title-and-username-container">
                        <h1 className="popup-title">{data.title}</h1>
                        <Link className="popup-username" to={`users/${data.author}`}>@{data.author}</Link>
                    </div>
                    <div className="popup-rating-and-bookmark-container">
                        <PopupRating number={data.bookmarks} icon={bookmarkIcon}/>
                        <PopupRating number={data.stars} icon={starIcon}/>
                    </div>
                </div>

                <div className="popup-tags-container">{tags}</div>

                <div className="ingredients-instructions-container">
                    <div className="ingredients-container">
                        {data.ingredients}
                    </div>
                    <div className="instructions-container">
                        <div style={{fontWeight: 'bold'}}>Instructions</div>
                        <div>{data.instructions}</div>
                    </div>
                </div>
                <Link className="popup-more-btn" to={`recipes/${data.id}`}>More</Link>             
                </div>
        </Fragment>
    )
}

class SearchPopup extends React.Component {

    constructor(){
        super();

        this.state = {
            title: '',
            author: '',
            tags: [],
            id: ''
        }
    }

    updateData(id){
        if(this.state.id === id) return;

        fetch(`http://localhost:5000/recipes/${id}`, {method: 'GET'})
       .then(res => res.json())
       .then(data => {
            data.main = data.main.replace(/\\\\/g, '\\');

            // extract tags
            let tags = [];
            data.tags.forEach(element => {
                tags.push(element.name);
            });

            // tags would never return null but current enpoint returns [null]
            if(tags[0] === null)
                tags = [];

            // extract and format ingredient groups
            let dataGroups = [];
            Object.keys(data.groups).forEach(key => {
                dataGroups.push({
                    name: key === 'Default' ? 'Ingredients' : key,
                    ingredients: data.groups[key]
                });
            });

            let ingredientGroups =[];
            dataGroups.forEach(group => {
                let ingredients = [];
                group.ingredients.forEach(ingredient => {
                    ingredients.push(<PopupIngredient ingredientName={ingredient.ingredient} quantity={ingredient.amount} key={`ingredient-${ingredient.ingredient}`}/>);
                });
                ingredientGroups.push(<IngredientList title={group.name} items={ingredients} key={`group-${group.name}`}/>);
            })

            let instructions = [];
            data.instructions.forEach(step => {
                instructions.push(<PopupInstructionStep stepNumber={step.step} stepText={step.instruction} key={`instruction-${step.step}`}/>);
            });

            // only show the first two steps of instructions/ingredients
            if(instructions.length > 2)
                instructions.length = 2

            if(ingredientGroups.length > 2)
                ingredientGroups.length = 2

            this.setState({       
                title: data.title,
                author: recipeInfo.recipeInfo.username,
                
                // TODO: replace with fetching actual data
                bookmarks: recipeInfo.recipeInfo.bookmarks,
                stars: recipeInfo.recipeInfo.stars,
         
                image: data.main, 
                tags: tags,
                ingredients: ingredientGroups,
                instructions: instructions,
                id: id
            });
       });
    }

    render() {
        let display = this.props.display ? 'inline' : 'none';
        let callback = () => this.props.closeCallback();

        return (
            <Fragment>
                <div className="search-popup-container-bg"
                    id='search-popup-container-bg'
                    style={{ display: display }}
                    onClick={callback}      
                >
                   <div className="search-popup-container" style={{ display: display }} onClick={e => e.stopPropagation()}>
                        <SearchPopupContent callback={callback} data={this.state}/>      
                    </div> 
                </div>
            </Fragment>
        );
    }
}

export default SearchPopup;
