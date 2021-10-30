import React, { Fragment } from "react";
import "./App.css";

//components
import NavigationBar from "./components/NavBar";
import Grid from "./components/Grid";

function App() {
  return (
    <Fragment>
      <div className="container">
        <NavigationBar />
        <Grid />
      </div>
    </Fragment>
  );
}

export default App;
