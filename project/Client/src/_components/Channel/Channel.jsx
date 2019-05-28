import React, { Component } from "react";

export class Channel extends Component {
  constructor(props) {
      super(props);

      this.state = {
          channel: '',
      };
  }

  handleChannelChange = event => {
    const { name, value } = event;
    this.setState({ [name]: value });
  }

  handleSubmit = event => {
      event.preventDefault();

      const { setChannel } = this.props;
      const { channel } = this.state;
      setChannel(channel);
      this.setState({ channel: '' });
  }

  render() {
    const { channel } = this.state;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Channel Name</label>
          <input placeholder="Channel Name" 
            value={channel}
            onChange={this.handleChannelChange}
          />
          <input type="submit" value="Join Channel" />
        </form>
      </div>
    );
  }
}
