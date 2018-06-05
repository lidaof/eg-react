import React from 'react';
import PropTypes from 'prop-types';
import JSON5 from 'json5';
import Json5Fetcher from '../../model/Json5Fetcher';
import DataHubParser from '../../model/DataHubParser';

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
            console.error(error);
            this.setState({isLoading: false, error: "Error: HTTP " + error.status});
        }

        if (tracks) {
            this.props.onTracksAdded(tracks);
            this.setState({isLoading: false, error: ""});
        }
    }

    render() {
        return (
        <div>
            <RemoteHubAdder onTracksAdded={this.props.onTracksAdded} />
            <FileHubAdder onTracksAdded={this.props.onTracksAdded} />
        </div>
        );
    }
}

class RemoteHubAdder extends React.Component {
    static propTypes = {
        onTracksAdded: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            inputUrl: ""
        };
        this.loadHub = this.loadHub.bind(this);
    }

    async loadHub() {
        if (!this.props.onTracksAdded) {
            return;
        }

        this.setState({isLoading: true});
        let json;
        try {
            json = await new Json5Fetcher().get(this.state.inputUrl);
        } catch (error) {
            console.error(error);
            this.setState({isLoading: false, error: "Error: HTTP " + error.status});
            return;
        }

        const parser = new DataHubParser(0);
        const tracks = await parser.getTracksInHub(json, "Custom hub");
        if (tracks) {
            this.props.onTracksAdded(tracks);
            this.setState({isLoading: false, error: ""});
        }
    }

    render() {
        return (
        <div>
            <label>
                Custom hub URL
                <input
                    type="text"
                    value={this.state.inputUrl}
                    onChange={event => this.setState({inputUrl: event.target.value})}
                />
            </label>
            <button onClick={this.loadHub} disabled={this.state.isLoading || !this.state.inputUrl} >
                Load from URL
            </button>
            <p style={{color: "red"}} >{this.state.error}</p>
        </div>
        );
    }
}

class FileHubAdder extends React.Component {
    constructor(props) {
        super(props);
        this.handleFileUpload = this.handleFileUpload.bind(this);
    }

    readFileAsText(file) {
        const reader = new FileReader();
        let promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
        });
        reader.readAsText(file);
        return promise;
    }

    async handleFileUpload(event) {
        if (!this.props.onTracksAdded) {
            return;
        }
        const contents = await this.readFileAsText(event.target.files[0]);
        const json = JSON5.parse(contents);
        const parser = new DataHubParser(0);
        const tracks = await parser.getTracksInHub(json, "Custom hub");
        if (tracks) {
            this.props.onTracksAdded(tracks);
        }
    }

    render() {
        return <div>Or <input type="file" onChange={this.handleFileUpload} /></div>;
    }
}

export default CustomHubAdder;
