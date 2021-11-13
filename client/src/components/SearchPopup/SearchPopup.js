import React, {Fragment} from "react";
import "./SearchPopup.css";

import closeBtnIcon from "../../images/close-round-btn.svg";

// TODO: not sure if these should be functional to allow rating here or saving
const PopupRating = ({number, icon}) => {
    return(
        <Fragment>
            <div className="popup-rating-container">
                <div className="popup-number">{number}</div>
                <img className="popup-rating-icon" src={icon}></img>
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

const SearchPopupContent = ({callback}) => {
    //TODO: all this should be sent to the popup from retrieved data
    let title = "Sample Title";
    let username = "@Username";

    let tagText = ['tag1', 'sampleTag2', 'tag3', 'tag4', 'sampleTag5', 'tag1', 'sampleTag2', 'tag3', 'tag4', 'sampleTag5'];
    let tags = [];

    tagText.forEach(t => {
        tags.push(<PopupTag tagText={t}/>);
    });

    let ingredientsRaw = [['ingredient1', '45 g'], ['ingredient1', '45 g'], ['ingredient1', '45 g'], ['ingredient1', '45 g'], ['ingredient1', '45 g']];
    let ingredients = [];

    ingredientsRaw.forEach(ingredient => {
        ingredients.push(<PopupIngredient ingredientName={ingredient[0]} quantity={ingredient[1]}/>);
    });

    let step1 = <PopupInstructionStep stepNumber={1} stepText={"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ornare, sem nec mattis sodales, mauris eros tincidunt mi, a eleifend nibh felis at tortor. Nam semper maximus lorem ac ultrices. Donec maximus dui sed rhoncus hendrerit."} />
    let step2 = <PopupInstructionStep stepNumber={2} stepText={"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ornare, sem nec mattis sodales, mauris eros tincidunt mi, a eleifend nibh felis at tortor. Nam semper maximus lorem ac ultrices. Donec maximus dui sed rhoncus hendrerit."} />
    
    let steps = [step1, step2];

    return (
        <Fragment>
            <img className="popup-close-btn" src={closeBtnIcon} onClick={callback}></img>
            <img className="search-popup-img" src='./../../images/snowskin_mooncakes.jpg'/>
            <div className="popup-body">
                <div className="popup-header-container">
                    <div className="popup-title-and-username-container">
                        <h1 className="popup-title">{title}</h1>
                        {/* TODO: on click should redirect to the user page */}
                        <div className="popup-username">{username}</div>
                    </div>
                    {/* TODO: replace icons */}
                    <div className="popup-rating-and-bookmark-container">
                        <PopupRating number={7} icon={closeBtnIcon}/>
                        <PopupRating number={5} icon={closeBtnIcon}/>
                    </div>
                </div>

                <div className="popup-tags-container">{tags}</div>

                <div className="ingredients-instructions-container">
                    <div className="ingredients-container">
                        <div style={{fontWeight: 'bold'}}>Ingredients</div>
                        {ingredients}
                    </div>
                    <div className="instructions-container">
                        <div style={{fontWeight: 'bold'}}>Instructions</div>
                        <div>{steps}</div>
                    </div>
                </div>

                {/* TODO: redirect to individual recipe page */}
                <button className="popup-more-btn">More</button>
                
                </div>
        </Fragment>
    )
}

class SearchPopup extends React.Component {
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
                        <SearchPopupContent callback={callback}/>      
                    </div> 
                </div>
            </Fragment>
        );
    }
}

export default SearchPopup;
