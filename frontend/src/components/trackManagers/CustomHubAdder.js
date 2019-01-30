import React from 'react';
import PropTypes from 'prop-types';
import JSON5 from 'json5';
import Json5Fetcher from '../../model/Json5Fetcher';
import DataHubParser from '../../model/DataHubParser';
import { readFileAsText } from "../../util";

/**
 * custom hub add UI
 * @author Silas Hsu and Daofeng Li
 */

function CustomHubAdder(props) {
    return (
    <div>
        <RemoteHubAdder onTracksAdded={props.onTracksAdded} onAddTracksToPool={props.onAddTracksToPool} />
        <FileHubAdder onTracksAdded={props.onTracksAdded} onAddTracksToPool={props.onAddTracksToPool} />
    </div>
    );
}

class RemoteHubAdder extends React.Component {
    static propTypes = {
        onTracksAdded: PropTypes.func,
        onAddTracksToPool: PropTypes.func,
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
            this.props.onAddTracksToPool(tracks, false);
            const tracksToShow = tracks.filter(track => track.showOnHubLoad);
            if (tracksToShow.length > 0) {
                this.props.onTracksAdded(tracksToShow);
            }
            this.setState({isLoading: false, error: ""});
        }
    }

    render() {
        return (
        <form>
            <h1>Add custom data hub</h1>
            <div className="form-group">
                <label>
                    Custom hub URL
                </label>
                <span style={{marginLeft: "10px", fontStyle: "italic"}}>
                    <a href="https://epigenomegateway.readthedocs.io/en/latest/datahub.html" target="_blank">data hub documentation</a>
                </span>
                <input
                        type="text"
                        className="form-control"
                        value={this.state.inputUrl}
                        onChange={event => this.setState({inputUrl: event.target.value})}
                />
            </div>
            <button onClick={this.loadHub} disabled={this.state.isLoading || !this.state.inputUrl} 
                    className="btn btn-success">
                    Load from URL
            </button>
            <p style={{color: "red"}} >{this.state.error}</p>
        </form>
        
        );
    }
}

class FileHubAdder extends React.Component {
    constructor(props) {
        super(props);
        this.handleFileUpload = this.handleFileUpload.bind(this);
    }

    async handleFileUpload(event) {
        if (!this.props.onTracksAdded) {
            return;
        }
        const contents = await readFileAsText(event.target.files[0]);
        const json = JSON5.parse(contents);
        const parser = new DataHubParser(0);
        const tracks = await parser.getTracksInHub(json, "Custom hub");
        if (tracks) {
            this.props.onAddTracksToPool(tracks, false);
            const tracksToShow = tracks.filter(track => track.showOnHubLoad);
            if (tracksToShow.length > 0) {
                this.props.onTracksAdded(tracksToShow);
            }
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
