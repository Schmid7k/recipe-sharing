import React, { Fragment } from "react";
import "./App.css";

//components
import NavigationBar from "./components/NavBar/NavBar";
import ContentGrid from "./components/ContentGrid/ContentGrid";

function App() {
  return (
    <Fragment>
      <NavigationBar />
      <div className="container">
        <ContentGrid />
      </div>
    </Fragment>
  );
}

export default App;
