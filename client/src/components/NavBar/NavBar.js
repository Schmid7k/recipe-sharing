import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./NavBar.css";
import searchSvg from "../../images/search_svg.svg";
import searchTogglerSvg from "../../images/search_toggler.svg";
import homeSvg from "../../images/home_svg.svg";
import filterSvg from "../../images/filter_svg.svg";
import recipeSvg from "../../images/recipe_svg.svg";
import dummyIcon from "../../images/dummy_icon.svg";

const NavBrand = () => {
  return (
    <Fragment>
      <a className="navbar-brand handwritten-text" href="/">
        Recipe Sharing
      </a>
    </Fragment>
  )
}

const NavToggler = () => {
  return (
    <Fragment>
      <button className="navbar-toggler nav-item" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle search bar">
        <img className="navbar-toggler-icon nav-icon" src={searchTogglerSvg} alt="Search" />
      </button>
    </Fragment>
  )
}

const NavItem = ({ text, href, active, source }) => {
  return (
    <Fragment>
      <li className={`nav-item nav-icon-item ${active === true ? "active" : ""}`}>
        <a className="d-md-none" href={href}>
          <img className="nav-icon" src={source} alt={`${text} icon`} />
        </a>
        <a className="nav-link d-none d-md-block" href={href}>
          {text}
        </a>
      </li>
    </Fragment>
  )
}

NavItem.propTypes = {
  text: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  source: PropTypes.node.isRequired,
}

const FilterToggler = ({ text, active, source }) => {
  return (
    <Fragment>
      <li className={`nav-item nav-icon-item ${active === true ? "active" : ""}`}>
        <div className="d-md-none" data-bs-toggle="collapse" data-bs-target="#filtering-menu" aria-expanded="false" aria-controls="filtering-menu" id='filter-button-icon'>
          <img className="nav-icon" src={source} alt={`${text} icon`} />
        </div>
        <div className="nav-link d-none d-md-block" data-bs-toggle="collapse" data-bs-target="#filtering-menu" aria-expanded="false" aria-controls="filtering-menu" id='filter-button'>
          {text}
        </div>
      </li>
    </Fragment>
  )
}

const NavItems = () => {
  return (
    <Fragment>
      <ul className="navbar-nav mr-auto">
        <NavItem text="Home" href="/" active={true} source={homeSvg} />
        <FilterToggler text="Filter" href="/" active={false} source={filterSvg} />
        {/* <NavItem text="Filter" href="/" active={false} source={filterSvg} /> */}
        <NavItem text="Add a recipe" href="/addrecipe" active={false} source={recipeSvg} />
      </ul>
    </Fragment>
  )
}

// TODO: maybe hitting search on the search page should not redirect
const SearchForm = () => {
  return (
    <Fragment>
      <form className="d-flex my-2 my-lg-0 flex-grow-1">
        <div className="input-group">
          <input
            className="form-control mr-sm-2 search-bar"
            type="search"
            placeholder="Enter a search term..."
            aria-label="Search term input"
          ></input>
          <button className="btn btn-search" type="submit" id="button-addon2">
            <img className="nav-icon" src={searchSvg} alt="Search" />
          </button>
        </div>
      </form>
    </Fragment>
  )
}

const NavUserInfo = ({ loggedIn }) => {
  if (loggedIn) {
    return (
    <Fragment>
      <ul className="navbar-nav mr-auto">
        <li id="user-info">
          <a href="/user">
            <img id="user-icon" src={dummyIcon} alt="User icon" />
          </a>
          <a id="username-link" className="nav-link d-none d-md-block" href="/user">
            <span className="navbar-text">Username</span>
          </a>
        </li>
      </ul>
    </Fragment>
    )
  }
  return (
    <Fragment>
      <ul className="navbar-nav mr-auto">
        <li className="nav-item">
          <a className="nav-link" href="/login">
            <span className="navbar-text">Login</span>
          </a>
        </li>
      </ul>
    </Fragment>
  )
}

NavUserInfo.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
}

const NavigationBar = () => {
  return (
    <Fragment>
      <nav className="navbar fixed-top navbar-expand-sm navbar-custom" id="main-navbar">
        <NavBrand />
        <div className="navbar-nav-items">
          <NavItems />
          <NavToggler />
        </div>
        <div className="navbar-collapse collapse w-100 order-1 order-sm-0 dual-collapse2" id="navbarSupportedContent">
          <SearchForm />
        </div>
        <div className="float-end">
          <NavUserInfo loggedIn={false} />
        </div>
      </nav>
    </Fragment>
  );
};

export default NavigationBar;
