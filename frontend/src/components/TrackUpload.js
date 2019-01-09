import React from "react";
import PropTypes from 'prop-types';
import { TrackModel } from "../model/TrackModel";
import { notify } from 'react-notify-toast';

const ONE_TRACK_FILE_LIST = ["bigwig", "bigbed", "hic", "biginteract"]; // all lower case

/**
 * handles local track file upload using FileReader API
 * @author Daofeng Li
 */

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
        let tracks;
        const fileList = Array.from(event.target.files);
        if (ONE_TRACK_FILE_LIST.includes(this.state.fileType.toLocaleLowerCase())) {
            tracks = fileList.map(file =>
                new TrackModel({
                    type: this.state.fileType,
                    url: null,
                    fileObj: file,
                    name: file.name,
                    label: file.name,
                    files: null,
                })
            );
        } else {
            if (fileList.length !== 2) {
                notify.show('Aborting, please only select 2 files, the track file and the index file', 'error', 5000);
                return null;
            }
            if (fileList[0].name.replace(".tbi", "") !== fileList[1].name.replace(".tbi", "")) {
                notify.show('Aborting, track file not match index file', 'error', 5000);
                return null;
            }
            tracks = [new TrackModel({
                type: this.state.fileType,
                url: null,
                fileObj: fileList[0],
                name: fileList[0].name,
                label: fileList[0].name,
                files: fileList,
            })];
        }
        this.props.onTracksAdded(tracks);
    }

    render() {
        return (
            <div>
                <label>
                    <h3>1. Choose track file type:</h3> 
                    <select value={this.state.fileType} onChange={this.handleTypeChange}>
                        <optgroup label="select only the track file (can select many of same type)">
                            <option value="bigWig">bigWig</option>
                            <option value="bigBed">bigBed</option>
                            <option value="hic">HiC</option>
                            <option value="bigInteract">bigInteract</option>
                        </optgroup>
                        <optgroup label="select both the track file and index file (only select 1 pair)">    
                            <option value="bedGraph">bedGraph</option>
                            <option value="methylC">methylC</option>
                            <option value="categorical">categorical</option>
                            <option value="bed">bed</option>
                            <option value="refBed">refBed</option>
                            <option value="longrange">longrange</option>
                        </optgroup>
                    </select>
                </label>
                <br />
                <label htmlFor="trackFile">
                    <h3>2. Choose track file:</h3> 
                    <input type="file" id="trackFile" multiple onChange={this.handleFileUpload} />
                </label>
            </div>
        );
    }
}
