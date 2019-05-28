import React, { Component} from 'react';
import logo from './logo.svg';
import './App.css';
import { Channel } from './_components/Channel';
import { Call } from './_components/Call';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      channel: '',
    }
  }

  setChannel = channel => {
    this.setState({ channel });
  }
  render() {
    return (
      <div className="App">
        <Channel setChannel={this.setChannel} />
        <Call />
      </div>
    );
  }
}