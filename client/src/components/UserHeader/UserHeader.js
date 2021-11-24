import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./UserHeader.css";
import editIcons from '../../images/edit-icon.svg'
import uploadIcon from '../../images/upload-icon.svg'

/**
 * Component for rendering user info in the user header. The component either shows the current
 * user data or the user can choose to edit the data if its their own user page.
 * @param {String} username The username of the user
 * @param {String} icon A path to the user's icon image
 * @param {String} bio A string containing the user's bio
 * @param {Function} updateBio A callback function to fetch an updated user bio
 * @returns A <Fragment> element with a .user-info-container div inside it.
 */
class UserInfo extends React.Component {
  constructor(){
    super();

    this.state = {
      editing: false,
      editBio: '',
      file: null
    };

    this.handleEditingChange = this.handleEditingChange.bind(this);
    this.handleEditingBioText = this.handleEditingBioText.bind(this);
    this.handleSendingBio = this.handleSendingBio.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  handleEditingChange() {
    this.setState({
      editing: !this.state.editing,
      editBio: this.props.bio
    });
  }

  handleEditingBioText(event) {
    this.setState({
      editBio: event.target.value
    });
  }

  handleSendingBio() {
    let formData = new FormData();

    formData.append('bio', this.state.editBio);
    formData.append('image', this.state.file);
  
    fetch('/userdata', {
        method: 'PUT',
        credentials: 'include',
        body: formData,
    })
    .then(response => {
      if (response.ok) {
        
        this.setState({
          editing: false
        });

        this.props.updateBio(this.state.editBio);

        return response; 
      }
      throw new Error('Something went wrong...');
    })
    .catch((error) => {
        console.error(error);
    });
  }

  handleFileChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  render(){
    let loggedIn = false;
    if(window.localStorage.getItem('user') !== null )
      loggedIn = JSON.parse(window.localStorage.getItem('user')).username === this.props.username;

    return (
      <Fragment>
        <div className="user-info-container">
          {
            !this.state.editing ?
              <img className="user-icon" src={`/${this.props.icon.replace(/\\/g, '/').replace('../client/public/', '')}`} alt="User icon"/>
            :
              <Fragment>
              <input  type="file" className="form-control-file" id="pfp-input" accept="image/*" style={{display: 'none'}} onChange={this.handleFileChange} required />
              <div className="upload-icon-container"  onClick={() => { document.getElementById('pfp-input').click(); }}>
                <img className="upload-icon" src={uploadIcon} alt="upload icon" />
              </div>
              </Fragment>
          }
          <div className="user-info-text">
            <div className='bio-header-container'>
              <h5 style={{margin: '0px'}}>{this.props.username}</h5>
              {loggedIn ? <img src={editIcons} className='edit-icon' onClick={this.handleEditingChange} alt="Edit icon" /> : null}
            </div>
            {
              this.state.editing ?
              <Fragment>
                <textarea id="bio-textarea" name="bio-textarea" placeholder="" onChange={(e) => this.handleEditingBioText(e)} value={this.state.editBio}></textarea>
                <button className='bio-submit-button' onClick={this.handleSendingBio}>Submit</button>
              </Fragment>
              :
              <div className="user-info-description">
                  <p>{this.props.bio}</p>
              </div>
            }
          </div>
        </div>
      </Fragment>
    );
  }
};

/**
 * Component for rendering a single user header tab button.
 * @param {String} text The text to be displayed on the tab button
 * @param {Boolean} active A boolean indicating whether the current tab button is the active one
 * @param {Function} handleClick A callback function for handling clicks
 * @param {String} id A ID for the tab button
 * @returns A <Fragment> element with a button inside it.
 */
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

/**
 * Component for rendering the recipe tab buttons on user page.
 * @param {Function} callback A callback function
 * @returns A <Fragment> element containing a .user-button-container div 
 *          consisting of <UserHeaderButton> elements.
 */
class UserHeaderButtons extends React.Component {
  constructor() {
    super();

    this.state = {
      active: "All"
    }

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.callback(e.target.id)
    this.setState({ active: e.target.outerText });
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

/**
 * Component for rendering the user header.
 * @param {Object} data Object containing user data
 * @param {Function} callback A callback function
 * @param {Function} updateBio A callback function for new updated user bio fetching
 * @returns A <Fragment> element containing a .user-header-container div consisting of 
 *          a <UserInfo> and <UserHeaderButtons> elements.
 */
const UserHeader = ({ data, callback, updateBio }) => {
  return (
    <Fragment>
      <div className="user-header-container" style={{marginBottom: '50px'}}>
        <UserInfo username={data.username} icon={data.img} bio={data.bio} updateBio={updateBio}/>
        <UserHeaderButtons callback={callback}/>
      </div>
    </Fragment>
  );
};

export default UserHeader;