import React, { Component } from 'react';
import Peer from 'simple-peer'
import io from 'socket.io-client'

const debug = require('debug')('screen-share:app')

const ioUrl = 'http://localhost:3000/'
const enableTrickle = true

class App extends Component {

  state = {
    peers: {},
    stream: null
  }

  constructor() {
    super()
    this.onMedia = this.onMedia.bind(this)
    this.createPeer = this.createPeer.bind(this)
    this.getMedia(this.onMedia, err => {
      this.setState({
        mediaErr: 'Could not access webcam'
      })
      debug('getMedia error', err)
    })
  }

  componentDidUpdate() {
    console.log('ComponentDidUpdate');
    if (this.stream && this.video && !this.video.srcObject) {
      console.log('set video stream', this.video, this.stream)
      this.video.srcObject = this.stream
    }
    this.attachPeerVideos()
  }

  attachPeerVideos() {
    Object.entries(this.state.peers).forEach(entry => {
      const [peerId, peer] = entry
      if (peer.video && !peer.video.srcObject && peer.stream) {
        console.log('setting peer video stream', peerId, peer.stream)
        peer.video.setAttribute('data-peer-id', peerId)
        peer.video.srcObject = peer.stream
        peer.video.play();
      }
    })
  }

  getMedia(callback, err) {
    const options = { video: true, audio: true }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(options)
        .then(stream => callback(stream))
        .catch(e => err(e))
    }
    return navigator.getUserMedia(options, callback,  err)
  }

  onMedia(stream) {
    this.stream = stream
    this.forceUpdate() // we have stream
    console.log('On media');
    this.socket = io(ioUrl)
    this.socket.on('peer', msg => {
      const peerId = msg.peerId
      debug('new peer poof!', peerId)
      if (peerId === this.socket.id) {
        return debug('Peer is me :D', peerId)
      }
      this.createPeer(peerId, true, stream)
    })
    this.socket.on('signal', data => {
      const peerId = data.from
      const peer = this.state.peers[peerId]
      if (!peer) {
        this.createPeer(peerId, false, stream)
      }
      debug('Setting signal', peerId, data)
      this.signalPeer(this.state.peers[peerId], data.signal)
    })
    this.socket.on('unpeer', msg => {
      debug('Unpeer', msg)
      this.destroyPeer(msg.peerId)
    })
  }

  createPeer(peerId, initiator, stream) {
    debug('creating new peer', peerId, initiator)

    const peer = new Peer({initiator: initiator, trickle: enableTrickle, stream})

    peer.on('signal', (signal) => {
      const msgId = (new Date().getTime())
      const msg = { msgId, signal, to: peerId }
      debug('peer signal sent', msg)
      this.socket.emit('signal', msg)
    })

    peer.on('stream', (stream) => {
      console.log('Got peer stream!!!', peerId, stream)
      peer.stream = stream
      this.setPeerState(peerId, peer)
    })

    peer.on('connect', () => {
      console.log('Connected to peer', peerId)
      peer.connected = true
      this.setPeerState(peerId, peer)
      peer.send(this.serialize({
        msg: 'hey man!'
      }))
    })

    peer.on('data', data => {
      console.log('Data from peer', peerId, this.unserialize(data))
    })

    peer.on('error', (e) => {
      console.log('Peer error %s:', peerId, e);
    })

    this.setPeerState(peerId, peer)

    return peer
  }

  destroyPeer(peerId) {
    const peers = {...this.state.peers}
    delete peers[peerId]
    this.setState({
      peers
    })
  }

  serialize(data) {
    return JSON.stringify(data)
  }

  unserialize(data) {
    try {
      return JSON.parse(data.toString())
    } catch(e) {
      return undefined
    }
  }

  setPeerState(peerId, peer) {
    console.log('SetPeerState');
    console.log(peerId, peer);
    const peers = {...this.state.peers}
    peers[peerId] = peer
    this.setState({
      peers
    })
  }

  signalPeer(peer, data) {
    try {
      peer.signal(data)
    } catch(e) {
      console.log('sigal error', e)
    }
  }

  renderPeers() {
    return Object.entries(this.state.peers).map(entry => {
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
    return (
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
        <div id="peers">{this.renderPeers()}</div>
      </div>
    );
  }
}

export { App };