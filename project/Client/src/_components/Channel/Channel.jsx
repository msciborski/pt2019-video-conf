import React, { Component } from "react";
import { Box, FormControl, Button, TextField } from "@material-ui/core";
import { withStyles } from '@material-ui/styles';

const styles = {
  root: {
    margin: '0 0 0 auto',
  },
  form: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    margin: '0 0 0 10px'
  },
  button: {
    margin: '0 0 0 10px'
  }
};

class Channel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      channel: "",
      joinedChannel: ''
    };
  }

  componentDidMount() {
    const { channel } = this.state;
    
  }

  handleChannelChange = event => {
    console.log(event);
    // const { name, value } = event;
    const { target } = event;
    console.log(target.name, target.value);
    this.setState({ [target.name]: target.value });
  };

  handleSubmit = event => {
    event.preventDefault();
    const { setChannel } = this.props;
    const { channel } = this.state;
    setChannel(channel);
    console.log('Submit');
    this.setState({ channel: "" });
    this.setState({ joinedChannel: channel });
  };

  render() {
    const { channel, joinedChannel } = this.state;
    const { classes } = this.props;
    console.log("Chanel", channel);
    return (
      <Box className={classes.root}>
        <form className={classes.form} onSubmit={this.handleSubmit}>
          <label>{`Channel: ${joinedChannel}`}</label>
          <TextField
            className={classes.input}
            id="outlined-name"
            label="Channel"
            name="channel"
            value={channel}
            onChange={this.handleChannelChange}
            margin="dense"
            variant="outlined"
            color=""
          />
          <Button className={classes.button} size="large" variant="outlined" color="primary" type="submit">
            Join
          </Button>
        </form>
      </Box>
    );
  }
}

const styledChannel = withStyles(styles)(Channel);

export { styledChannel as Channel }
