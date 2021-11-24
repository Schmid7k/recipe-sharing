import React, { Fragment } from "react";
import { Redirect } from "react-router-dom";
import "./LoginForm.css";

const usernameValidation = (value) => {
  if (value.trim().length < 1) {
    return "You must input a username";
  }
  return null;
};

const passwordValidation = (value) => {
  if (value.trim().length < 1) {
    return "You must input a password";
  }
  return null;
};

const ErrorAlert = ({ errors }) => {
  return (
      <Fragment>
          <div className="m-2" role="alert">
              <ul className="list-group">
                  {errors.map( (error, idx) => <li className="list-group-item list-group-item-danger" key={idx}>{error}</li>)}
              </ul>
          </div>
      </Fragment>
  );
}

class LoginForm extends React.Component {
  constructor() {
    super();

    this.state = {
      username: "",
      password: "",
      errors: [],
      redirect: false
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(e) {
    this.setState({
        [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    let errors = [];
    let usernameVal = usernameValidation(this.state.username);
    let passwordVal = passwordValidation(this.state.password);
    if (usernameVal) errors.push(usernameVal);
    if (passwordVal) errors.push(passwordVal);

    this.setState({
      errors: errors
    })

    if (errors.length === 0) {
      const user = { username: this.state.username, password: this.state.password };
      fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(user),
        })
        .then(response => { 
            if (response.ok) { 
              let userData = {
                username: this.state.username,
              }
              window.localStorage.setItem('user', JSON.stringify(userData))
              this.setState({ redirect: true });
              return response;
            }
            throw new Error('Something went wrong...');
        })
        .catch((error) => {
            console.error(error);
            errors.push("Incorrect username and/or password");
            this.setState({ errors: errors });
        }
      );
    }
  }

  render() {
    const windowUrl = window.location.search;
    const params = new URLSearchParams(windowUrl);
    return (
      <Fragment>
        { this.state.redirect ? <Redirect push to="/browse"/> : null }
        <div className="login-container">
          <form onSubmit={this.handleSubmit}>
              <h1>Log in</h1>
              {params.get("regRedirect") ? <div className="alert alert-success" role="alert">Your account has been succesfully created.<br /> You can now log in using the form below.</div> : null}
              {this.state.errors.length > 0 ? <ErrorAlert errors={this.state.errors} /> : null}
              <div className="form-group">
                <label htmlFor="loginUsernameInput"><h5>Username</h5></label>
                <div className="input-group mb-3">
                    <span className="input-group-text" id="basic-addon1">@</span>
                    <input type="text" className="form-control" id="loginUsernameInput" 
                            placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" 
                            name="username" value={this.state.username} onChange={this.handleInputChange} required />
                </div>
              </div>
              <div className="form-group">
                  <label htmlFor="loginPasswordInput"><h5>Password</h5></label>
                  <input type="password" className="form-control" id="loginPasswordInput" placeholder="Password" 
                          name="password" value={this.state.password} onChange={this.handleInputChange} required />
              </div>
              <button type="submit" className="btn btn-primary btn-custom mt-3">Submit</button>
          </form>
          <div className="login-tip">
            <span>Haven't registered yet?</span><br />
            <a href="/registration">Register</a>
          </div>
        </div>
      </Fragment>
    );
  }
};

export default LoginForm;