import React, { Fragment } from "react";
import "./App.css";

//components
import NavigationBar from "./components/NavBar/NavBar";
import ContentSearch from "./components/ContentSearch/ContentSearch";

function App() {
  return (
    <Fragment>
      {/* Navbar's position is now fixed so that the user can still navigate the site even if they've scrolled down. 
      Something was causing a small random padding to appear on mobile on the right side so I added "overflow-x: hidden" 
      for html and body (index.css) just in case. That seemed to fix the problem for me but if it appears again it's 
      probably caused by some element exceeding some width limits. */}
      <NavigationBar />
      {/* 1. Changed container to container-fluid to remove extra padding that affected filtering menu placement
          2. Added top padding for .container-fluid in index.css to account for fixed navbar
          3. Added .container-flex (css in index.css) so that filtering menu is shown next to the grid */}
      <ContentSearch />

    </Fragment>
  );
}

export default App;
