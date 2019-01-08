import React from "react";
import PropTypes from 'prop-types';
import { TrackModel } from "../model/TrackModel";

export class TrackUpload extends React.Component {
    static propTypes = {
        onTracksAdded: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            fileType: "bigWig",
        }
    }

    handleTypeChange = (event) => {
        this.setState({fileType: event.target.value});
    }

    handleFileUpload = async (event) => {
        const track = new TrackModel({
            type: this.state.fileType,
            url: null,
            fileObj: event.target.files[0],
            name: event.target.files[0].name,
            label: event.target.files[0].name,
            files: event.target.files,
        });
        this.props.onTracksAdded(track);
    }

    render() {
        return (
            <div>
                <label>
                    <h3>Choose track file type:</h3> 
                    <select value={this.state.fileType} onChange={this.handleTypeChange}>
                        <option value="bigWig">bigWig</option>
                        <option value="hic">HiC</option>
                        <option value="bedGraph">bedGraph</option>
                    </select>
                </label>
                <br />
                <label htmlFor="trackFile">
                    <h3>Choose track file:</h3> 
                    <input type="file" id="trackFile" multiple onChange={this.handleFileUpload} />
                </label>
            </div>
        );
    }
}
