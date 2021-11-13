import React, { Fragment } from "react";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  return (
    <Fragment>
        <div className="registration-container">
            <form>
                <h1>Register</h1>
                <div className="form-group">
                    <label htmlFor="registrationUsernameInput"><h5>Username</h5></label>
                    <div className="input-group">
                        <span className="input-group-text" id="registration-basic-addon1">@</span>
                        <input type="text" className="form-control" id="registrationUsernameInput" placeholder="Username" aria-label="Username" aria-describedby="registration-basic-addon1 usernameHelp" />
                    </div>
                    <small id="usernameHelp" className="form-text text-muted">The username should be between X-Y characters in length.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="registrationPasswordInput"><h5>Password</h5></label>
                    <input type="password" className="form-control" id="registrationPasswordInput" aria-describedby="passwordHelp" placeholder="Password" />
                    <small id="passwordHelp" className="form-text text-muted">The password should be between X-Y characters in length.</small>
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
};

export default RegistrationForm;