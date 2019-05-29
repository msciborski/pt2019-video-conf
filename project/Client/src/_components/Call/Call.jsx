import React, { Component } from "react";
import AgoraRTC from "agora-rtc-sdk";
import uuid from "uuid";
import config from "../../config";
import { Box, FormControl, Button, TextField } from "@material-ui/core";

const USER_ID = uuid.v4();
let client = AgoraRTC.createClient({ mode: "live", codec: "h264" });

export class Call extends Component {
  constructor(props) {
    super(props);

    this.state = {
      localStream: AgoraRTC.createStream({
        streamID: USER_ID,
        audio: true,
        video: true,
        screen: false
      }),
      remoteStreams: []
    };
  }

  componentDidMount() {
    this.initLocalStream();
    this.initClient();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.channel !== this.props.channel && this.props.channel !== "") {
        console.log('Join channel');
      this.joinChannel();
    }
  }

  joinChannel = () => {
    let me = this;
    const { channel } = this.props;
    client.join(
      null,
      channel,
      USER_ID,
      uid => {
        console.log(`${uid} joined channel`);
        client.publish(me.state.localStream, err => {
          console.log(err);
        });

        client.on("stream-published", evt => {
          console.log("Publish local stream successful.");
        });
      },
      err => console.log(err)
    );
  };

  leaveChannel = () => {
      console.log('Leave');
      client.leave(
          () => {
              console.log('User left');
          },
          (err) => console.log(err),
      );
      this.setState({ channel: '' });
  }

  initLocalStream = () => {
    let me = this;
    me.state.localStream.init(
      () => me.state.localStream.play("agora_local"),
      err => console.log(err)
    );
  };

  initClient = () => {
    client.init(
      config.appId,
      () => console.log("AgoraRTC initialzied"),
      err => console.log(err)
    );

    this.subscribeToClient();
  };

  subscribeToClient = () => {
    let me = this;
    client.on("stream-added", me.onStreamAdded);
    client.on("stream-subscribed", me.onRemoteClientAdded);
    client.on("stream-removed", me.onStreamRemoved);
    client.on("peer-leave", me.onPeerLeave);
  };

  onStreamAdded = evt => {
    let me = this;
    let { stream } = evt;
    console.log("New stream added: " + stream.getId());
    me.setState(
      {
        remoteStreams: {
          ...me.state.remoteStream,
          [stream.getId()]: stream
        }
      },
      () => {
        client.subscribe(stream, function(err) {
          console.log("Subscribe stream failed", err);
        });
      }
    );
  };

  onStreamRemoved = evt => {
    let me = this;
    let stream = evt.stream;
    if (stream) {
      let streamId = stream.getId();
      let { remoteStreams } = me.state;

      stream.stop();
      delete remoteStreams[streamId];

      me.setState({ remoteStreams });

      console.log("Remote stream is removed " + stream.getId());
    }
  };

  onRemoteClientAdded = evt => {
    let me = this;
    let remoteStream = evt.stream;
    me.state.remoteStreams[remoteStream.getId()].play(
      "agora_remote " + remoteStream.getId()
    );
  };

  onPeerLeave = evt => {
    let me = this;
    let stream = evt.stream;
    if (stream) {
      let streamId = stream.getId();
      let { remoteStreams } = me.state;

      stream.stop();
      delete remoteStreams[streamId];

      me.setState({ remoteStreams });

      console.log("Remote stream is removed " + stream.getId());
    }
  };

  render() {
    return (
        <div>
        <div>
        <Button onClick={this.leaveChannel} size="large" variant="outlined" color="secondary" type="submit"
            style={{
              position: "absolute",
              top: "25%",
              left: "25%",
              zIndex: 10
            }}>
            Leave
        </Button>
          <div id="agora_local" style={{ width: "400px", height: "400px" }} />
          {Object.keys(this.state.remoteStreams).map(key => {
            let stream = this.state.remoteStreams[key];
            let streamId = stream.getId();
            return (
              <div
                key={streamId}
                id={`agora_remote ${streamId}`}
                style={{ width: "400px", height: "400px" }}
              />
            );
          })}
        </div>
        </div>
      );
  }
}
