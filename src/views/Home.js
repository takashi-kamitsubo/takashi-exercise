import React, { Fragment } from "react";

import Content from "../components/Content";

class Home extends React.Component {
  constructor(params) {
    super()
    console.log("Home screen")
    console.log(params)
    this._orderHandler = params.orderHandler
  }

  render() {
    return (
        <Fragment>
        <Content orderHandler={this._orderHandler} />
      </Fragment>
      )
  }
}

export default Home;
