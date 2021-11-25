import React, { Fragment } from "react";
import { withRouter } from 'react-router-dom';
import "./App.css";

//components
import NavigationBar from "./components/NavBar/NavBar";
import ContentSearch from "./components/ContentSearch/ContentSearch";

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      searchTerm: "",
    }

    this.contentSearch = React.createRef();
    this.filterSearch = React.createRef();
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.searchTerm) {
      let filter = { searchPhrase: this.props.location.state.searchTerm };
      this.contentSearch.current.filteringHandler(filter);
      this.setState({ searchTerm: this.props.location.state.searchTerm })
      this.props.history.replace({'pathname': '/browse/', state: {}})
    }
  }

  render() {
    return (
      <Fragment>
        <NavigationBar contentSearch={this.contentSearch} filterSearch={this.filterSearch}/>
        <ContentSearch ref={this.contentSearch} filterSearch={this.filterSearch}/>
      </Fragment>
    );
  }
}

export default withRouter(App);
