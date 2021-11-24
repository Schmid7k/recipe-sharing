import React, { Fragment } from "react";
import { Redirect } from "react-router-dom";
import "./RegistrationForm.css";

const usernameValidation = (value) => {
    if (value.trim().length < 1) {
      return "Username is required";
    } 
    if (value.trim().length < 2) {
      return "Username has to contain at least 2 characters";
    }
    if (value.trim().length > 32) {
        return "Username has to contain less than 32 characters";
    }
    return null;
};

const passwordValidation = (value) => {
    if (value.trim().length < 1) {
      return "Password is required";
    } 
    if (value.trim().length < 8) {
      return "Password has to contain at least 8 characters";
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

class RegistrationForm extends React.Component {
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

        let redirect = false;
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
            
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            })
            .then(response => { 
                if (response.ok) { 
                    redirect = true;
                    this.setState({ redirect: redirect });
                    return response;
                }
                throw new Error('Something went wrong...');
            })
            .catch((error) => {
                console.error(error);
                errors.push("Can't create an account with these credentials");
                this.setState({ errors: errors });
            });
        }
    }

    render() {
        return (
            <Fragment>
                {this.state.redirect ? <Redirect push to="/login?regRedirect=true" /> : null}
                <div className="registration-container">
                    <form onSubmit={this.handleSubmit}>
                        <h1>Register</h1>
                        {this.state.errors.length > 0 ? <ErrorAlert errors={this.state.errors} /> : null}
                        <div className="form-group">
                            <label htmlFor="registrationUsernameInput"><h5>Username</h5></label>
                            <div className="input-group">
                                <span className="input-group-text" id="registration-basic-addon1">@</span>
                                <input type="text" className="form-control" id="registrationUsernameInput" 
                                        placeholder="Username" aria-label="Username" aria-describedby="registration-basic-addon1 usernameHelp" 
                                        name="username" value={this.state.username} onChange={this.handleInputChange} 
                                        minLength="2" maxLength="32" required />
                            </div>
                            <small id="usernameHelp" className="form-text text-muted">The username should be between 2-32 characters in length.</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="registrationPasswordInput"><h5>Password</h5></label>
                            <input type="password" className="form-control" id="registrationPasswordInput" aria-describedby="passwordHelp" 
                                    placeholder="Password" name="password" value={this.state.password} onChange={this.handleInputChange} 
                                    minLength="8" required />
                            <small id="passwordHelp" className="form-text text-muted">The password should be at least 8 characters in length.</small>
                        </div>
                        <button type="submit" className="btn btn-primary btn-custom mt-3">Submit</button>
                    </form>
                    <div className="registration-tip">
                    <span>Already registered?</span><br />
                    <a href="/login">Login</a>
                    </div>
                </div>
            </Fragment>
        );
    }
};

export default RegistrationForm;