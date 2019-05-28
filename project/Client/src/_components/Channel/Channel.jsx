import React, { Component } from "react";

export class Channel extends Component {
  constructor(props) {
      super(props);

      this.state = {
          channel: '',
      };
  }

  handleChannelChange = event => {
    console.log(event);
    // const { name, value } = event;
    const { target } = event;
    console.log(target.name, target.value);
    this.setState({ [target.name]: target.value });
  }

  handleSubmit = event => {
      event.preventDefault();
      const { setChannel } = this.props;
      const { channel } = this.state;
      setChannel(channel);
      console.log(channel);
      this.setState({ channel: '' });
  }

  render() {
    const { channel } = this.state;
    console.log('Chanel', channel);
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Channel Name</label>
          <input placeholder="Channel Name"
            name="channel" 
            value={channel}
            onChange={this.handleChannelChange}
          />
          <input type="submit" value="Join Channel" />
        </form>
      </div>
    );
  }
}
