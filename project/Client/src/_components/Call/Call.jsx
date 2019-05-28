import React, { Component } from 'react';
import AgoraRTC from 'agora-rtc-sdk';
import uuid from 'uuid';
import config from '../../config';

const USER_ID = uuid.v4();
let client = AgoraRTC.createClient({ mode: 'live', codec:'h264' }); 

export class Call extends Component {
    constructor(props) {
        super(props);

        this.state = {
            localStream: AgoraRTC.createStream({
                streamID: USER_ID,
                audio: true,
                video: true,
                screen: false,
            })
        }
    }

    componentDidMount() {
        this.initLocalStream();
        this.initClient();
    }

    initLocalStream = () => {
        let me = this;
        me.localStream.init(() => me.localStream.play('agora_local'), err => console.log(err));
    }

    initClient = () => {
        client.init(
            config.appId, 
            () =>  console.log('AgoraRTC initialzied'),
            (err) => console.log(err),
        );

    }

    render() {
        return (
            <div id="agora_local" style={{ width: "400px", height: "400px" }} />
        )
    }
}