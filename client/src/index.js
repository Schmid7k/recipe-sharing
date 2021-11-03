import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

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

        {/* <Route path="/about">
          <About />
        </Route>  */}

        <Redirect to='/' />

      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
