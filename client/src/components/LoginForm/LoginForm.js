import React, { Fragment } from "react";
import "./LoginForm.css";

const LoginForm = () => {
  return (
    <Fragment>
      <div className="login-container">
        <form>
            <h1>Log in</h1>
            <div className="form-group">
              <label htmlFor="loginUsernameInput"><h5>Username</h5></label>
              <div className="input-group mb-3">
                  <span className="input-group-text" id="basic-addon1">@</span>
                  <input type="text" className="form-control" id="loginUsernameInput" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1" />
              </div>
            </div>
            <div className="form-group">
                <label htmlFor="loginPasswordInput"><h5>Password</h5></label>
                <input type="password" className="form-control" id="loginPasswordInput" placeholder="Password" />
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
};

export default LoginForm;