import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import About from "./pages/About";
import User from "./pages/User";
import AddRecipe from "./pages/AddRecipe";
import Recipe from "./pages/Recipe";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>

        <Route exact path="/">
          <App />
        </Route>

        <Route exact path="/login">
          <Login />
        </Route>

        <Route exact path="/registration">
          <Registration />
        </Route>

        <Route path="/about">
          <About />
        </Route>

        <Route path="/user/:username">
          <User />
        </Route>

        <Route path="/addrecipe">
          <AddRecipe />
        </Route>

        <Route path="/recipes/:id">
          <Recipe />
        </Route>

        <Redirect to='/' />

      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
