import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./NavBar.css";
import searchSvg from "../../images/search_svg.svg";
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
      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
    </Fragment>
  )
}

const NavItem = ({ text, href, active }) => {
  return (
    <Fragment>
      <li className={`nav-item ${active === true ? "active" : ""}`}>
        <a className="nav-link" href={href}>
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
}

const NavItems = () => {
  return (
    <Fragment>
      <ul className="navbar-nav mr-auto">
        <NavItem text="Home" href="/" active={true} />
        <NavItem text="Filter" href="/" active={false} />
        <NavItem text="Add a recipe" href="/" active={false} />
      </ul>
    </Fragment>
  )
}

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
            <img id="search-icon" src={searchSvg} alt="Search" />
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
        <li id="user-info" className="nav-item">
          <img id="user-icon" src={dummyIcon} alt="User icon" />
          <a className="nav-link" href="/">
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
          <a className="nav-link" href="/">
            <span className="navbar-text">Login</span>
          </a>
        </li>
      </ul>
    </Fragment>
  )
}

NavItem.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
}

const NavigationBar = () => {
  return (
    <Fragment>
      <nav className="navbar navbar-expand-md navbar-custom">
        <NavToggler />
        <NavBrand />
        <div className="navbar-collapse collapse w-100 order-1 order-md-0 dual-collapse2" id="navbarSupportedContent">
          <NavItems />
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
