import React from 'react';
import {isSupported} from 'u2f-api';
import {isChrome, isOpera} from 'react-device-detect';
import Modal from './Modal';

class WarnU2fCompatibility extends React.Component {
  state = {
    u2fSupported: null,
    isChrome: null,
    isOpera,
  };

  async componentDidMount() {
    this.setState({
      u2fSupported: await isSupported(),
      isChrome,
      isOpera,
    });
  }

  render() {
    return (
      <Modal
        title="Warning: U2F/WEBUSB Not Supported in This Browser"
        show={
          (this.state.u2fSupported === false && this.state.isChrome === false) ||
          this.state.isOpera === true
        }>
        <p>The U2F/WEBUSB API is required for the web browser to communicate with the <span className="ucfirst">{this.state.vendor}</span> device.</p>
        <p>Try using Chrome, Chromium or Brave instead.</p>
        <p>You can view a list of U2F/WEBUSB supporting browsers at <a target="_blank" rel="noopener noreferrer" href="https://caniuse.com/#feat=u2f">U2F</a>, <a target="_blank" rel="noopener noreferrer" href="https://caniuse.com/#feat=webusb">WEBUSB</a>.</p>
      </Modal>
    );
  }
}

export default WarnU2fCompatibility;
