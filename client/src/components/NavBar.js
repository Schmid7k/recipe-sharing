import React, { Fragment } from "react";

const NavigationBar = () => {
  return (
    <Fragment>
      <nav class="navbar navbar-expand-md navbar-custom">
        <a class="navbar-brand" href="/">
          Recipe Sharing
        </a>
        <div class="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <a class="nav-link" href="/">
                Home
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/">
                Filter
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/">
                Add a recipe
              </a>
            </li>
          </ul>
        </div>
        <div class="mx-auto order-0 position-absolute start-50">
          <form class="d-flex my-2 my-lg-0">
            <input
              class="form-control mr-sm-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            ></input>
            <button class="btn btn-outline-light my-2 my-sm-0" type="submit">
              Search
            </button>
          </form>
        </div>
        <div class="float-end" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <a class="nav-link" href="/">
                <span class="navbar-text">Login</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </Fragment>
  );
};

export default NavigationBar;
