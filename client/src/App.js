import React, { Fragment } from "react";
import "./App.css";

//components
import NavigationBar from "./components/NavBar/NavBar";
import Grid from "./components/Grid";

function App() {
  return (
    <Fragment>
      <NavigationBar />
      <div className="container">
        <Grid />
      </div>
    </Fragment>
  );
}

export default App;
