import React, { Fragment } from "react";

//components
import NavigationBar from "../components/NavBar/NavBar";
import LoginForm from "../components/LoginForm/LoginForm";

const Login = () => {
  return (
    <Fragment>
      <NavigationBar />
      <div className="container-fluid">
        <LoginForm />
      </div>
    </Fragment>
  );
}

export default Login;