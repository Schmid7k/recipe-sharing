import React, { Fragment } from "react";

//components
import NavigationBar from "../components/NavBar/NavBar";
import RegistrationForm from "../components/RegistrationForm/RegistrationForm";

const Registration = () => {
  return (
    <Fragment>
      <NavigationBar />
      <div className="container-fluid">
        <RegistrationForm />
      </div>
    </Fragment>
  );
}

export default Registration;