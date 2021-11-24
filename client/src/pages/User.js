import React, { Fragment } from "react";
import ContentGridCard from "../components/ContentGridCard/ContentGridCard";
import SearchPopup from "../components/SearchPopup/SearchPopup";
import NavigationBar from "../components/NavBar/NavBar";
import ContentGrid from "../components/ContentGrid/ContentGrid";
import UserHeader from "../components/UserHeader/UserHeader";
import {withRouter} from 'react-router-dom';

class User extends React.Component {
  constructor(){
    super();

    this.state = {
      popupDisplay: false,
      scrollbarWidth: 0,
      overflow: '',
      display: 'none',
      currentOption: 'all', // 0 - All, 1 - Reviewed, 2 - Saved, 3 - Uploaded
      header : {
        username: 'author',
        bio: 'lorem pispum dolor sit amet, consectetur adipiscing elit, Nunc ut sapien vel nisl fermentum malesuada.',
        img: '/some/path'
      },
      recipes: {
        all: [],
        reviewed: [],
        saved: [],
        uploaded: []
      }
    }

    this.popup = React.createRef();
    
    this.handleUserData = this.handleUserData.bind(this);
    this.tabHandler = this.tabHandler.bind(this);
    this.popupToggleHandler = this.popupToggleHandler.bind(this);
    // this.filteringHandler = this.filteringHandler.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.buildCards = this.buildCards.bind(this);
    this.updateBio = this.updateBio.bind(this);
  }

  updateBio(newBio) {
    fetch(`/userdata/${this.state.header.username}`, {method: 'GET'})
    .then(res => res.json())
    .then(res => {
      this.setState({
        header : {
          username: this.state.header.username,
          bio: res.bio,
          img: res.image
        }
      });
    })
    .catch(err => this.props.history.push('/browse')); 
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

  tabHandler(tabID){
    this.setState({
      currentOption: tabID.toLowerCase()
    });
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

  buildCards(data){
    let ids = [];
    let all = [];

    let reviewed = [];
    data.recipes.reviewed.forEach((recipe) => {
      reviewed.push(<ContentGridCard title={recipe.title} img={`/${recipe.mainimage}`} key={`reviewed-${recipe.recipeid}`} cardCallback={this.popupToggleHandler} id={recipe.recipeid}/>);
      if(!ids.includes(recipe.recipeid)){
        ids.push(recipe.recipeid);
        all.push(<ContentGridCard title={recipe.title} img={`/${recipe.mainimage}`} key={`reviewed-${recipe.recipeid}`} cardCallback={this.popupToggleHandler} id={recipe.recipeid}/>);
      }
    });

    let saved = [];
    data.recipes.saved.forEach((recipe) => {
      saved.push(<ContentGridCard title={recipe.title} img={`/${recipe.mainimage}`} key={`saved-${recipe.recipeid}`} cardCallback={this.popupToggleHandler} id={recipe.recipeid}/>);
      if(!ids.includes(recipe.recipeid)){
        ids.push(recipe.recipeid);
        all.push(<ContentGridCard title={recipe.title} img={`/${recipe.mainimage}`} key={`reviewed-${recipe.recipeid}`} cardCallback={this.popupToggleHandler} id={recipe.recipeid}/>);
      }
    });

    let uploaded = [];
    data.recipes.uploaded.forEach((recipe) => {
      uploaded.push(<ContentGridCard title={recipe.title} img={`/${recipe.mainimage}`} key={`uploaded-${recipe.recipeid}`} cardCallback={this.popupToggleHandler} id={recipe.recipeid}/>);
      if(!ids.includes(recipe.recipeid)){
        ids.push(recipe.recipeid);
        all.push(<ContentGridCard title={recipe.title} img={`/${recipe.mainimage}`} key={`reviewed-${recipe.recipeid}`} cardCallback={this.popupToggleHandler} id={recipe.recipeid}/>);
      }
    });

    this.setState({
      recipes: {
        all: all,
        reviewed: reviewed,
        saved: saved,
        uploaded: uploaded
      }
    });
  }

  handleUserData(data){
    console.log(data);

    this.setState({
      header: {
        username: this.props.match.params.username,
        bio: data.headerData.bio,
        img: data.headerData.image
      }
    }, () => {
      this.buildCards(data);
    })
  }

  componentDidMount(){
    window.addEventListener('resize', () => this.handleResize());
      
    let gridResizeObserver = new ResizeObserver(() => this.handleResize());
    gridResizeObserver.observe(document.getElementById('grid-container'));

    const username = this.props.match.params.username;

    fetch(`/user/${username}`, {method: 'GET'})
    .then(res => res.json())
    .then(res => this.handleUserData(res))
    .catch(err => this.props.history.push('/browse'))
  }

  render(){
    return (
      <Fragment>
        <NavigationBar />
        <div className="container-fluid" id='grid-container'>
          <div className="container pt-3">        
              <UserHeader data={this.state.header} callback={this.tabHandler} updateBio={this.updateBio}/>
              <SearchPopup display={this.state.popupDisplay} closeCallback={this.popupToggleHandler} ref={this.popup}/>
              <ContentGrid content={this.state.recipes[this.state.currentOption]}/>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(User);