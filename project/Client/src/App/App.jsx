import React, { Component } from 'react';
import { WebRTCHandler } from '../_components/WebRTCHandler/WebRTCHandler';
import { Grid, AppBar, Toolbar, Typography } from '@material-ui/core';
import { VideoList } from '../_components/VideoList';
import { withStyles } from '@material-ui/styles';

const styles = {
  root: {
    maxWidth: '1500px !important',
    margin: '20px 0 20px 0 !important', 
    display: 'flex',
    alignItems: 'center',
  },
};

class App extends Component {

  constructor() {
    super();
    this.state = {
      peers: {},
      localStream: null,
    }
  }

  componentDidUpdate() {
    this.attachPeerVideos()
  }

  attachPeerVideos = () => {
    const { peers } = this.state;
    Object.entries(peers).forEach(entry => {
      const [peerId, peer] = entry
      if (peer.video && !peer.video.srcObject && peer.stream) {
        console.log('setting peer video stream', peerId, peer.stream)
        peer.video.setAttribute('data-peer-id', peerId)
        peer.video.srcObject = peer.stream
        peer.video.play();
      }
    })
  }

  signalPeer = (peerId, data) => {
    try {
      const { peers } = this.state;
      const peer = peers[peerId];

      console.log('Signal peer', peer);
      peer.signal(data)
    } catch (e) {
      console.log('sigal error', e)
    }
  }

  destroyPeer = peerId => {
    const peers = { ...this.state.peers }
    delete peers[peerId]
    this.setState({
      peers
    })
  }

  setPeerState = (peerId, peer) => {
    console.log('SetPeerState');
    console.log(peerId, peer);
    const peers = { ...this.state.peers }
    peers[peerId] = peer
    this.setState({
      peers
    })
  }

  setStream = stream => {
    this.setState({ localStream: stream });
    this.forceUpdate();
  }

  render() {
    const { peers, localStream } = this.state;
    const { classes } = this.props;
    return (
      <>
        <Grid container>
          <Grid item xs={12}>
            <AppBar>
              <Toolbar>
                <Typography>
                  Video conference
                </Typography>
              </Toolbar>
            </AppBar>
          </Grid>
          <Grid item xs={12} className={classes.root}>
            <VideoList 
              peers={peers}
              localStream={localStream} 
            />
          </Grid>
        </Grid>
        <WebRTCHandler
          setPeerState={this.setPeerState}
          setStream={this.setStream}
          destroyPeer={this.destroyPeer}
          signalPeer={this.signalPeer}
          peers={peers}
        />
      </>
    );
  }
}
const styledApp = withStyles(styles)(App);
export { styledApp as App };