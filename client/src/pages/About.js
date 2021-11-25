import React, { Fragment } from "react";
import { withRouter } from 'react-router-dom';

//components
import NavigationBar from "../components/NavBar/NavBar";
import ContentGridCard from "../components/ContentGridCard/ContentGridCard";

class About extends React.Component {
  constructor() {
    super();

    this.state = {
      recipes: []
    }

    this.handleSettingRecipeData = this.handleSettingRecipeData.bind(this);
    this.handleRedirect = this.handleRedirect.bind(this);
  }

  handleSettingRecipeData(recipes) {
    this.setState({ recipes: recipes });
  }

  componentDidMount() {
    // fetch some recommended recipes
    fetch(`/api/recommendations`, {
                method: 'GET',
                credentials: 'include',
            })
            .then(result => {
              if (result.ok) {
                return result.json();
              }
              throw new Error('Something went wrong...');
            })
            .then(recipes => this.handleSettingRecipeData(recipes))
            .catch(error => console.error(error)
        );
  }

  handleRedirect(destination) {
    let url = `/recipes/${destination}/`;
    this.props.history.push(url);
  }

  render() {
    return (
      <Fragment>
        <NavigationBar />
        <div className="container-fluid">
          <div className="container pt-3 pb-5" style={{width: "60%", minWidth: "22rem" }}>
              <h1 className="text-center">Welcome to Recipe Sharing</h1>
              <div style={{textAlign: "justify"}}>
                <h5 className="text-center" style={{fontWeight: "bold"}}>What is recipe sharing?</h5>
                <p>Our web service aims to be a streamlined and easy-to-use recipe sharing and discovery platform where people 
                  can share their recipes with each other. Anyone can browse and search for recipes posted on the web service. 
                  We also offer filters for things like included and excluded recipes to facilitate finding recipes that are just 
                  perfect for your allergies and/or pantry situation.
                </p>
                <p>Our design philosophy for creating this website was to create a web service with large pictues showcasing the
                  creations of our users matched with warm colors and accessible fonts to make it easier for all kinds of people 
                  to use. We hope you enjoy using our web service as much as we enjoyed creating it!
                </p>
              </div>
              <div style={{textAlign: "justify"}}>
                <h5 className="text-center" style={{fontWeight: "bold"}}>Do I need to register for an account? What more can I do with an account?</h5>
                <p>Adding new recipes to the web service is limited to registered users only. If you only want to look at the
                  recipes posted by other people, you don't need to feel pressure to register! However, registered users can also 
                  bookmark and rate recipes and easily access those recipes later from their account page if they so wish.
                </p>
              </div>
              <div style={{textAlign: "justify"}}>
                <h5 className="text-center" style={{fontWeight: "bold"}}>How do I get started?</h5>
                <p>You can start searching for recipes by first either entering a search term into the search bar or start by 
                  going to the browse page and browsing. Both your search results and all the recipes shown on the browse page can be
                  filtered by opening up the filtering menu on those pages. Just press the 'Filter' button or icon on the navigation 
                  bar when you're on those pages and voilà! If you want to close the filtering menu, just press the filtering button
                  or icon again and it's gone &#8212; your filtering results will still be there.
                </p>
              </div>
              <div className="text-center mt-4">
                <a href="/browse/" 
                  style={{ 
                    fontWeight: 'bold', 
                    backgroundColor: '#DF7861', 
                    textDecoration: 'none',
                    padding: '0.5rem 6rem', 
                    fontSize: 'large',
                    color: '#FFFFFF',
                    borderRadius: '5px',
                  }}
                >Start browsing</a>
                <div className="mt-5">
                  <h5 className="text-center mb-3" style={{fontWeight: "bold"}}>Need some recommendations to get started?</h5>
                  <div className="container-flex" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gridGap: '15px' }}>
                    {this.state.recipes.map(recipe => 
                      <ContentGridCard  title={recipe.title} img={recipe.mainimage} 
                                        cardCallback={() => { this.handleRedirect(recipe.recipeid); } } id={recipe.recipeid} 
                                        key={recipe.recipeid} />
                    )}
                  </div>
                </div>
              </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default withRouter(About);