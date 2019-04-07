import React, { Component } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";


const ioUrl = 'http://localhost:3000/';
const enableTrickle = true;

class WebRTCHandler extends Component {
  constructor(props) {
    super(props);
    this.getMedia(this.onMedia, err => console.log(err));
  }

  getMedia = (callback, err) => {
    const options = { 
      video: true, 
      audio: true, 
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      return navigator.mediaDevices.getUserMedia(options)
        .then(stream => callback(stream))
        .catch(e => err(e));
    }
    return navigator.getUserMedia(options, callback,  err);
  }

  onMedia = (stream) => {
    const { setStream, destroyPeer } = this.props;
    setStream(stream);
    this.stream = stream;

    this.socket = io(ioUrl);

    this.socket.on('peer', msg => {
      const peerId = msg.peerId;
      console.log('new peer poof!', peerId);
      
      if (peerId === this.socket.id) {
        return console.log('Peer is me :D', peerId);
      }
      
      this.createPeer(peerId, true, stream);
    });

    this.socket.on('signal', data => {
      const peerId = data.from;
      const { peers, signalPeer } = this.props;
      const peer = peers[peerId];

      if (!peer) {
        this.createPeer(peerId, false, stream);
      }
      console.log('Setting signal', peerId, data);

      signalPeer(peerId, data.signal);
    });

    this.socket.on('unpeer', msg => {
      console.log('Unpeer', msg);
      destroyPeer(msg.peerId);
    });
  }

  createPeer = (peerId, initiator, stream) => {

    const peer = new Peer({initiator: initiator, trickle: enableTrickle, stream});

    peer.on('signal', (signal) => {
      const msgId = (new Date().getTime());
      const msg = { msgId, signal, to: peerId };
      
      console.log('Peer signal:', msg);
      this.socket.emit('signal', msg);
    })

    peer.on('stream', (stream) => {
      const { setPeerState } = this.props;
      console.log('Got peer stream!!!', peerId, stream)
      peer.stream = stream;
      setPeerState(peerId, peer);
    });

    peer.on('connect', () => {
      console.log('Connected to peer', peerId);
      peer.connected = true;

      const { setPeerState } = this.props;
      setPeerState(peerId, peer)
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

    const { setPeerState } = this.props;
    setPeerState(peerId, peer)

    return peer;
  }

  serialize = data => {
    return JSON.stringify(data)
  }

  unserialize = data => {
    try {
      return JSON.parse(data.toString())
    } catch(e) {
      return undefined
    }
  }

  render() {
    return null;
  }
}

export { WebRTCHandler };