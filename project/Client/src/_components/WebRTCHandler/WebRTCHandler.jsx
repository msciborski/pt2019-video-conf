import React, { Component } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

class WebRTCHandler extends Component {
  constructor(props) {
    super(props);

    this.getMedia(this.onMedia, err => {
      console.log(err);
    })
  }

  componentDidMount() {
    const { video } = this.props;
    if (this.stream && video && !this.video.srcObject) {
    }
  }

  attachPeerVideos = () =>  {
    const { peers } = this.props;
    Object.entries(peers).forEach(entry => {
      const [peerId, peer] = entry
      if (peer.video && !peer.video.srcObject && peer.stream) {
        peer.video.setAttribute('data-peer-id', peerId)
        peer.video.srcObject = peer.stream
      }
    })
  }

  getMedia = (callback, err) => {
    const options = { video: true, audio: true }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(options)
        .then(stream => callback(stream))
        .catch(e => err(e))
    }
    return navigator.getUserMedia(options, callback,  err)
  }

  onMedia = stream => {
    const { ioUrl } = this.props;

    this.stream = stream
    this.forceUpdate() // we have stream
    this.socket = io(ioUrl)
    this.socket.on('peer', msg => {
      const peerId = msg.peerId
      if (peerId === this.socket.id) {
      }
      this.createPeer(peerId, true, stream)
    })
    this.socket.on('signal', data => {
      const peerId = data.from
      const peer = this.state.peers[peerId]
      if (!peer) {
        this.createPeer(peerId, false, stream)
      }

      this.signalPeer(this.state.peers[peerId], data.signal)
    })
    this.socket.on('unpeer', msg => {
      this.destroyPeer(msg.peerId)
    })
  }

  createPeer(peerId, initiator, stream) {
    const { setPeerState } = this.props;
    const peer = new Peer({initiator: initiator, trickle: true, stream})

    peer.on('signal', (signal) => {
      const msgId = (new Date().getTime())
      const msg = { msgId, signal, to: peerId }
      this.socket.emit('signal', msg)
    })

    peer.on('stream', (stream) => {
      peer.stream = stream
      setPeerState(peerId, peer)
    })

    peer.on('connect', () => {
      peer.connected = true
      setPeerState(peerId, peer)
      peer.send(JSON.stringify( { msg: 'connected user' }));
    })

    peer.on('data', data => {
    })

    peer.on('error', (e) => {
    })

    setPeerState(peerId, peer)

    return peer
  }

  signalPeer = (peer, data) => {
    try {
      peer.signal(data)
    } catch(e) {
    }
  }
}