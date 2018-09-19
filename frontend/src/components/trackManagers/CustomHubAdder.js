import React from 'react';
import PropTypes from 'prop-types';
import JSON5 from 'json5';
import Json5Fetcher from '../../model/Json5Fetcher';
import DataHubParser from '../../model/DataHubParser';

function CustomHubAdder(props) {
    return (
    <div>
        <RemoteHubAdder onTracksAdded={props.onTracksAdded} />
        <FileHubAdder onTracksAdded={props.onTracksAdded} />
    </div>
    );
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
        <form>
            <div className="form-group">
                <label>
                    Custom hub URL
                </label>
                <input
                        type="text"
                        className="form-control"
                        value={this.state.inputUrl}
                        onChange={event => this.setState({inputUrl: event.target.value})}
                />
                <button onClick={this.loadHub} disabled={this.state.isLoading || !this.state.inputUrl} >
                    Load from URL
                </button>
                <p style={{color: "red"}} >{this.state.error}</p>
            </div>
        </form>
        
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
        return (
            <div>Or <br />
            <div className="custom-file">
                <input type="file" className="custom-file-input" id="inputGroupFile01" onChange={this.handleFileUpload} />
                <label className="custom-file-label" htmlFor="inputGroupFile01">Choose datahub file</label>
            </div>
            </div>
        );
    }
}

export default CustomHubAdder;
