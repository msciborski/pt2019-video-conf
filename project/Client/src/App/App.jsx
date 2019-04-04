import React, { Component } from 'react';
import openSocket from "socket.io-client";

let socket;
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: '',
    }

  }
  socket = openSocket('http://localhost:3000');

  componentDidMount() {

  }

  render() {
    return <div>Test</div>;
  }
}

export { App };