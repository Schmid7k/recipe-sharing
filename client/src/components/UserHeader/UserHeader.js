import React, { Fragment } from "react";
import PropTypes from 'prop-types';
import "./UserHeader.css";
import editIcons from '../../images/edit-icon.svg'
import uploadIcon from '../../images/upload-icon.svg'

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
  
    fetch('http://localhost:5000/userdata', {
        method: 'POST',
        credentials: 'include',
        // contentType: 'multipart/form-data',
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
    this.setState({ file: e.target.files[0]});
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
              <img className="user-icon" src={this.props.icon} alt="User icon"/>
            :
              <Fragment>
              <input  type="file" className="form-control-file" id="pfp-input" accept="image/*" style={{display: 'none'}} onChange={this.handleFileChange} required />
              <img className="upload-icon" src={uploadIcon} alt="upload icon" onClick={() => {
                document.getElementById('pfp-input').click();
              }}/>
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
                <textarea id="bio-textarea" name="bio-textarea" placeholder="" style={{minWidth: '23rem'}} onChange={(e) => this.handleEditingBioText(e)} value={this.state.editBio}></textarea>
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

const UserHeader = ({data, callback, updateBio}) => {
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