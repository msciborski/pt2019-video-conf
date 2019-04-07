import React, { Component } from 'react';
import { Paper, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';

class VideoList extends Component {
    constructor(props) {
        super(props);
    }

    componentDidUpdate() {
        const { localStream } = this.props;
        if (localStream && this.video && !this.video.srcObject) {
            this.video.srcObject = localStream;
        }
    }

    renderPeers = () => {
        const { peers } = this.props;
        const peerCount = Object.keys(peers).length;
        let size;
        
        if (12 / peerCount < 4) {
            size = 4;
        } else {
            size = 12 / peerCount;
        }
        console.log('Size:', size);

        return Object.entries(peers).map(entry => {
          console.log(entry);
          const [peerId, peer] = entry
          console.log('render peer', peerId, peer, entry)
          console.log('Peer', peer);
          return <Grid item xs={size} key={peerId}>
            <video ref={video => peer.video = video}></video>
          </Grid>
        })
      }


    render() {
        return (
            <Paper>
                <Grid container>
                    <Grid item xs={12}>
                        <video id="localStream" ref={video => this.video = video} controls></video>
                    </Grid>
                    {this.renderPeers()}
                </Grid>
            </Paper>
        );
    }
}

export { VideoList };