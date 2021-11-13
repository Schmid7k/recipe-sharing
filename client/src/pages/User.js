import React, { Fragment } from "react";

//components
import NavigationBar from "../components/NavBar/NavBar";
import ContentGrid from "../components/ContentGrid/ContentGrid";
import UserHeader from "../components/UserHeader/UserHeader";

const User = () => {
  return (
    <Fragment>
      <NavigationBar />
      <div className="container-fluid">
        <div className="container pt-3">
            <UserHeader />
            <ContentGrid />
        </div>
      </div>
    </Fragment>
  );
}

export default User;