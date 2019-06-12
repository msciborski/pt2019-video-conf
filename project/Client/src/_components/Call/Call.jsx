import React, { Component } from "react";
import AgoraRTC from "agora-rtc-sdk";
import uuid from "uuid";
import config from "../../config";
import { Box, FormControl, Button, TextField } from "@material-ui/core";

const USER_ID = uuid.v4();
const SCREEN_SHARE_USER_ID = uuid.v4();
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
      screenClient: undefined,
      localStreamScreenShare: undefined,
      remoteStreams: [],
      userJoined: false
    };
  }

  componentDidMount() {
    this.initLocalStream();
    this.initClient();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.channel !== this.props.channel && this.props.channel !== "") {
      console.log("Join channel");
      this.setState({ userJoined: true });
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
    console.log("Leave");
    client.leave(
      () => {
        this.setState({ userJoined: false });
        console.log("User left");
      },
      err => console.log(err)
    );
    this.setState({ channel: "" });
  };

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
          ...me.state.remoteStreams,
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
    console.log("Me", me);
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

  toggleAudio = () => {
    const { localStream } = this.state;

    if (localStream.isAudioOn()) {
      localStream.disableAudio();
    } else {
      localStream.enableAudio();
    }
  };

  toggleVideo = () => {
    const { localStream } = this.state;
    if (localStream.isVideoOn()) {
      localStream.disableVideo();
    } else {
      localStream.enableVideo();
    }
  };

  toggleScreenShare = () => {
    const { screenClient } = this.state;
    const { channel } = this.props;

    if (screenClient) {
    } else {
      const screenShareClient = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8"
      });

      screenShareClient.init(
        config.appId,
        () => console.log("screen share client initialize"),
        err => console.log(err)
      );
      this.setState({ screenClient: screenShareClient });

      const screenShareStream = AgoraRTC.createStream({
        streamID: SCREEN_SHARE_USER_ID,
        video: false,
        audio: false,
        screen: true,
        mediaSource: "window"
      });

      screenShareStream.init(
        () => {
          screenShareStream.play("agora_local_screen");

          screenShareClient.on("stream-added", evt => {
            const { stream } = evt;
            this.setState(
              {
                remoteStreams: {
                  ...this.state.remoteStreams,
                  [stream.getId()]: stream
                }
              },
              () => {
                screenShareClient.subscribe(stream, function(err) {
                  console.log("Subscribe stream failed", err);
                });
              }
            );
          });

          screenShareClient.on("stream-subscribed", this.onRemoteClientAdded);
          screenShareClient.on("stream-removed", this.onStreamRemoved);
          screenShareClient.on("peer-leave", this.onPeerLeave);

          if (channel !== "") {
            console.log(`Joining screen share: ${channel}`);
            screenShareClient.join(
              null,
              channel,
              SCREEN_SHARE_USER_ID,
              uid => {
                console.log(`Joining screen share: ${uid} `);
                screenShareClient.publish(screenShareStream, err =>
                  console.log(err)
                );
              },
              err => console.log(err)
            );
          }
        },
        err => console.log(err)
      );

      this.setState({ localStreamScreenShare: screenShareStream });
    }
  };

  render() {
    const { userJoined, screenClient } = this.state;
    return (
      <div>
        {userJoined && (
          <div>
            <Button
              onClick={this.leaveChannel}
              size="large"
              variant="outlined"
              color="secondary"
            >
              Leave
            </Button>
            <Button onClick={this.toggleVideo}>Toggle video</Button>
            <Button onClick={this.toggleAudio}>Toggle audio</Button>
            <Button onClick={this.toggleScreenShare}>Toggle screenshare</Button>
          </div>
        )}
        <div
          id="agora_local"
          style={{ width: "400px", height: "400px", position: "relative" }}
        />
        {screenClient && (
          <div
            id="agora_local_screen"
            style={{ width: "400px", height: "400px", position: "relative" }}
          />
        )}

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
        {/* <Button class="btn" onClick={this.leaveChannel} size="large" variant="outlined" color="secondary" type="submit"
            style={{
              position: "absolute",
              top: "25%",
              left: "25%",
              zIndex: 10
            }}>
            Leave
        </Button> */}
      </div>
    );
  }
}
