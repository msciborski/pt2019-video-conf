import React, { Component} from 'react';
import logo from './logo.svg';
import './App.css';
import { Channel } from './_components/Channel';
import { Call } from './_components/Call';
import { Container, AppBar, Toolbar, Typography } from '@material-ui/core';

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
    const { channel } = this.state;
    return (
      <div>
      <AppBar position="static" color="secondary">
        <Toolbar>
          <Typography>Nodeference</Typography>
          <Channel setChannel={this.setChannel} />
        </Toolbar>
      </AppBar>
      <Container maxWidth="md">
        <Call channel={channel} />
      </Container>
      </div>
    );
  }
}