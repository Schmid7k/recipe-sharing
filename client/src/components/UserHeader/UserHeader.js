import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./UserHeader.css";

const UserInfo = ({ username, icon, bio }) => {
  return (
    <Fragment>
      <div className="user-info-container">
        <img className="user-icon" src={icon} alt="User icon" />
        <div className="user-info-text">
          <h5>{username}</h5>
          <div className="user-info-description">
              <p>{bio}</p>
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

const UserHeaderButton = ({ text, active, handleClick, id }) => {
  return (
    <Fragment>
      <button className={`btn btn-primary btn-custom m-1 ${active === true ? "active" : ""}`} onClick={handleClick} id={id}>{text}</button>
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
    // this.props.callback(e.target.id[e.target.id.length - 1])
    this.props.callback(e.target.id)
    this.setState({ active: e.target.outerText});
  }

  render() {
    return (
      <Fragment>
        <div className="user-button-container text-center">
          <UserHeaderButton text="All" active={this.state.active === "All"} handleClick={this.handleClick} id={'All'}/>
          <UserHeaderButton text="Reviewed" active={this.state.active === "Reviewed"} handleClick={this.handleClick} id={'Reviewed'}/>
          <UserHeaderButton text="Saved" active={this.state.active === "Saved"} handleClick={this.handleClick} id={'Saved'}/>
          <UserHeaderButton text="Uploaded" active={this.state.active === "Uploaded"} handleClick={this.handleClick} id={'Uploaded'}/>
        </div>
      </Fragment>
    );
  }    
};

const UserHeader = ({data, callback}) => {
  return (
    <Fragment>
      <div className="user-header-container" style={{marginBottom: '50px'}}>
        <UserInfo username={data.username} icon={data.img} bio={data.bio}/>
        <UserHeaderButtons callback={callback}/>
      </div>
    </Fragment>
  );
};

export default UserHeader;