import React from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
 
export class CopyToClip extends React.Component {
  state = {
    copied: false,
  };
 
  render() {
    return (
      <span>
        <CopyToClipboard text={this.props.value}
          onCopy={() => this.setState({copied: true})}>
          <button title="Copy to clipboard">Copy</button>
        </CopyToClipboard> {this.state.copied ? <span style={{color: 'red'}}>Copied</span> : null}
      </span>
    );
  };
};