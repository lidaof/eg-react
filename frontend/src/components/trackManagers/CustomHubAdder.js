import React from 'react';
import PropTypes from 'prop-types';
import DataHubParser from '../../DataHubParser';

class CustomHubAdder extends React.Component {
    static propTypes = {
        onTracksAdded: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            inputUrl: "",
            isLoading: false,
            error: ""
        };
        this.loadHub = this.loadHub.bind(this);
    }

    async loadHub() {
        if (!this.props.onTracksAdded) {
            return;
        }

        const parser = new DataHubParser(0);
        let tracks = null;
        this.setState({isLoading: true});
        try {
            tracks = await parser.getTracksInHub({
                name: "Custom hub",
                url: this.state.inputUrl
            });
        } catch (error) {
            this.setState({isLoading: false, error: error.toString()});
        }

        if (tracks) {
            this.props.onTracksAdded(tracks);
            this.setState({isLoading: false, error: ""});
        }
    }

    render() {
        return (
        <div>
            <h4>Custom hub</h4>
            <label>
                Custom hub URL
                <input
                    type="text"
                    value={this.state.inputUrl}
                    onChange={event => this.setState({inputUrl: event.target.value})}
                />
            </label>
            <button onClick={this.loadHub} disabled={this.state.isLoading || !this.state.inputUrl} >
                Load custom hub
            </button>
            <p style={{color: "red"}} >{this.state.error}</p>
        </div>
        );
    }
}

export default CustomHubAdder;
