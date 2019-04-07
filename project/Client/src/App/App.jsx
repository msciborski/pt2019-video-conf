import React, { Component } from 'react';
import Peer from 'simple-peer'
import io from 'socket.io-client'
import { WebRTCHandler } from '../_components/WebRTCHandler/WebRTCHandler';

const debug = require('debug')('screen-share:app')



class App extends Component {

  constructor() {
    super();
    this.state = {
      peers: {},
      stream: null,
    }
  }

  componentDidUpdate() {
    const { stream } = this.state;
    console.log('ComponentDidUpdate');
    if (stream && this.video && !this.video.srcObject) {
      console.log('set video stream', this.video, stream)
      this.video.srcObject = stream
    }
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
    } catch(e) {
      console.log('sigal error', e)
    }
  }

  destroyPeer = peerId => {
    const peers = {...this.state.peers}
    delete peers[peerId]
    this.setState({
      peers
    })
  }

  setPeerState = (peerId, peer) => {
    console.log('SetPeerState');
    console.log(peerId, peer);
    const peers = {...this.state.peers}
    peers[peerId] = peer
    this.setState({
      peers
    })
  }

  setStream = stream => {
    this.setState({ stream });
    this.forceUpdate();
  }

  renderPeers = () => {
    const { peers } = this.state;
    return Object.entries(peers).map(entry => {
      console.log(entry);
      const [peerId, peer] = entry
      console.log('render peer', peerId, peer, entry)
      console.log('Peer', peer);
      return <div key={peerId}>
        <video ref={video => peer.video = video}></video>
      </div>
    })
  }

  render() {
    const { peers } = this.state;
    return (
      <>
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">WebRTC Video Chat</h1>
        </header>
        {this.state.mediaErr && (
          <p className="error">{this.state.mediaErr}</p>
        )}
        <div id="me">
          <video id="myVideo" ref={video => this.video = video} controls></video>
        </div>
        {
          peers &&
            <div id="peers">{this.renderPeers()}</div>
        }
      </div>
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

export { App };