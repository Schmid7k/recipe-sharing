import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./UserHeader.css";
import dummyIcon from "../../images/dummy_icon.svg";

const UserInfo = ({ username, icon }) => {
  return (
    <Fragment>
      <div className="user-info-container">
        <img className="user-icon" src={icon} alt="User icon" />
        <div className="user-info-text">
          <h5>{username}</h5>
          <div className="user-info-description">
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc ut sapien vel nisl fermentum malesuada.</p>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

UserInfo.propTypes = {
  username: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
};

const UserHeaderButton = ({ text, active, handleClick }) => {
  return (
    <Fragment>
      <button className={`btn btn-primary btn-custom m-1 ${active === true ? "active" : ""}`} onClick={handleClick}>{text}</button>
    </Fragment>
  );
};

UserHeaderButton.propTypes = {
  text: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

class UserHeaderButtons extends React.Component {
  constructor() {
    super();

    this.state = {
      active: "All"
    }

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.setState({ active: e.target.outerText});
  }

  render() {
    return (
      <Fragment>
        <div className="user-button-container text-center">
          <UserHeaderButton text="All" active={this.state.active === "All"} handleClick={this.handleClick} />
          <UserHeaderButton text="Reviewed" active={this.state.active === "Reviewed"} handleClick={this.handleClick} />
          <UserHeaderButton text="Saved" active={this.state.active === "Saved"} handleClick={this.handleClick} />
          <UserHeaderButton text="Uploaded" active={this.state.active === "Uploaded"} handleClick={this.handleClick} />
        </div>
      </Fragment>
    );
  }    
};

const UserHeader = () => {
  return (
    <Fragment>
      <div className="user-header-container">
        <UserInfo username="Username" icon={dummyIcon} />
        <UserHeaderButtons />
      </div>
    </Fragment>
  );
};

export default UserHeader;