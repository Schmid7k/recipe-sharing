import React, { Fragment } from "react";
import { Redirect } from "react-router-dom";
import PropTypes from 'prop-types';
import "./NavBar.css";
import siteLogo from "../../images/logo.png";
import searchSvg from "../../images/search_svg.svg";
import searchTogglerSvg from "../../images/search_toggler.svg";
import gridSvg from "../../images/grid_svg.svg";
import filterSvg from "../../images/filter_svg.svg";
import recipeSvg from "../../images/recipe_svg.svg";
import dummyIcon from "../../images/dummy_icon.svg";

const NavBrand = () => {
  return (
    <Fragment>
      <a className="navbar-brand handwritten-text" href="/">
        <img id="logo-img" src={siteLogo} alt="Logo" />
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

const NavItem = ({ text, href, source }) => {
  return (
    <Fragment>
      <li className={`nav-item nav-icon-item ${href === window.location.pathname ? "active" : ""}`}>
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
  source: PropTypes.node.isRequired,
}

class FilterToggler extends React.Component {
  constructor() {
    super();

    this.state = {
      filterActive: false,
    }

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    let filterBtn = document.getElementById('filter-button');
    this.setState({ filterActive: (filterBtn && filterBtn.ariaExpanded === 'true') });
  }

  render() {
    return (
      <Fragment>
        {window.location.pathname === "/browse" ? 
          <li className={`nav-item nav-icon-item ${this.state.filterActive ? "active" : ""}`}>
            <div className="d-md-none" data-bs-toggle="collapse" data-bs-target="#filtering-menu" aria-expanded="false" aria-controls="filtering-menu" id='filter-button-icon' onClick={this.handleClick}>
              <img className="nav-icon" src={this.props.source} alt={`${this.props.text} icon`} />
            </div>
            <div className="nav-link d-none d-md-block" data-bs-toggle="collapse" data-bs-target="#filtering-menu" aria-expanded="false" aria-controls="filtering-menu" id='filter-button' onClick={this.handleClick}>
              {this.props.text}
            </div>
          </li>
        :
          <li className="nav-item nav-icon-item disabled">
            <div className="d-md-none" id='filter-button-icon'>
              <img className="nav-icon" src={this.props.source} alt={`${this.props.text} icon`} />
            </div>
            <div className="nav-link d-none d-md-block" id='filter-button'>
              {this.props.text}
            </div>
          </li>
        }
      </Fragment>
    );
  }
};

const NavItems = ({loggedIn}) => {
  return (
    <Fragment>
      <ul className="navbar-nav mr-auto">
        <NavItem text="Browse" href="/browse" source={gridSvg} />
        <FilterToggler text="Filter" href="/browse" source={filterSvg} />
        { loggedIn
          && window.localStorage.getItem('user') !== null 
          ? <NavItem text="Add a recipe" href="/addrecipe" source={recipeSvg} /> : null}
      </ul>
    </Fragment>
  );
};

class SearchForm extends React.Component {
  constructor() {
    super();

    this.state = {
      searchTerm: "",
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    this.setState({ searchTerm: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.handleSearchChange(this.state.searchTerm);
  }

  render() {
    return (
      <Fragment>
        <form className="d-flex my-2 my-lg-0 flex-grow-1" onSubmit={this.handleSubmit}>
          <div className="input-group">
            <input
              className="form-control mr-sm-2 search-bar"
              id='navbar-searchbar'
              type="search"
              placeholder="Enter a search term..."
              aria-label="Search term input"
              onChange={this.handleInputChange}
            required />
            <button className="btn btn-search" type="submit" id="button-addon2">
              <img className="nav-icon" src={searchSvg} alt="Search" />
            </button>
          </div>
        </form>
      </Fragment>
    );
  }
};

const NavUserInfo = ({ loggedIn, userIcon }) => {
  if (loggedIn) {
    let username = JSON.parse(window.localStorage.getItem('user')).username;
    return (
    <Fragment>
      <ul className="navbar-nav mr-auto">
        <li id="user-info">
          <a href={`/user/${username}`}>
            <img id="user-icon" src={userIcon} alt="User icon" />
          </a>
          <a id="username-link" className={`nav-link d-none d-md-block ${window.location.pathname === `/user/${username}` ? "active" : ""}`} href={`/user/${username}`}>
            <span className="navbar-text">{username}</span>
          </a>
        </li>
      </ul>
    </Fragment>
    );
  }
  return (
    <Fragment>
      <ul className="navbar-nav mr-auto">
        <li className={`nav-item ${window.location.pathname === "/login" ? "active" : ""}`}>
          <a className="nav-link" href="/login">
            <span className="navbar-text">Login</span>
          </a>
        </li>
      </ul>
    </Fragment>
  );
};

NavUserInfo.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  userIcon: PropTypes.string.isRequired,
};

class NavigationBar extends React.Component {
  constructor() {
    super();

    this.state = {
      searchTerm: "",
      searchRedirect: false,
      loggedIn: false,
      userIcon: dummyIcon
    }

    this.handleSearchChange = this.handleSearchChange.bind(this);
  }

  componentDidMount() {
    let cookie =  document.cookie.split(";").map(cookie => cookie.split("=")[0]);

    for( let i = 0; i < cookie.length; i++)
      cookie[i] = cookie[i].trim();

    this.setState({loggedIn: cookie.includes("authentication")});
    
    if (cookie.includes("authentication")) {
      let username = JSON.parse(window.localStorage.getItem('user')).username;
      fetch(`/userdata/${username}`, {
        method: 'GET'
      })
      .then(result => {
        if (result.ok) {
          return result.json();
        }
        throw new Error('Something went wrong...');
      })
      .then(userData => {
        if (userData.image) {
          this.setState({ userIcon: `/${userData.image.replace(/\\/g, '/').replace('../client/public/', '')}` });
        }
      })
      .catch((error) => {
          console.error(error);
      });
    }

  }

  handleSearchChange(searchTerm) {
    this.setState({ searchTerm: searchTerm });
    if (window.location.pathname === "/browse") {
      let filterMenuFilters = this.props.filterSearch.current.constructFilters();
      filterMenuFilters.searchPhrase = searchTerm;
      this.props.contentSearch.current.filteringHandler(filterMenuFilters);
    } else {
      this.setState({ searchRedirect: true });
    }
  }

  render() {
    return (
      <Fragment>
        {this.state.searchRedirect ? 
          <Redirect to={{ pathname: "/browse", state: { searchTerm: this.state.searchTerm }, }} /> 
          : null}
        <nav className="navbar fixed-top navbar-expand-sm navbar-custom" id="main-navbar">
          <NavBrand />
          <div className="navbar-nav-items">
            <NavItems loggedIn={this.state.loggedIn}/>
            <NavToggler />
          </div>
          <div className="navbar-collapse collapse w-100 order-1 order-sm-0 dual-collapse2" id="navbarSupportedContent">
            <SearchForm handleSearchChange={this.handleSearchChange} />
          </div>
          <div className="float-end">
            <NavUserInfo loggedIn={this.state.loggedIn} userIcon={this.state.userIcon} />
          </div>
        </nav>
      </Fragment>
    );
  }
};

export default NavigationBar;
