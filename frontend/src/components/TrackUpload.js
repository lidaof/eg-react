import React from "react";
import PropTypes from 'prop-types';
import { TrackModel } from "../model/TrackModel";
import { notify } from 'react-notify-toast';
import {Tabs, Tab} from 'react-bootstrap-tabs';
import JSON5 from 'json5';
import { readFileAsText, HELP_LINKS } from "../util";

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
            selectedTabIndex: 0,
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

    handleHubUpload = async (event) => {
        const tracks = [];
        const fileList = Array.from(event.target.files);
        const hubFile = fileList.filter(f => f.name === 'hub.config.json');
        const idxFiles = fileList.filter(f => f.name.endsWith('.tbi'));
        const idxHash = {};
        idxFiles.forEach(item => {
            idxHash[item.name] = item;
        })
        if (hubFile.length !== 1) {
            notify.show('Aborting, can not find `hub.config.json` file', 'error', 5000);
            return null;
        }
        const hubContent = await readFileAsText(hubFile[0]);
        const json = JSON5.parse(hubContent);
        const trackTypes = {};
        const trackNames = {};
        const trackOptions = {};
        json.forEach(item => {
            trackTypes[item.filename] = item.type;
        });
        json.forEach(item => {
            trackNames[item.filename] = item.name;
        });
        json.forEach(item => {
            trackOptions[item.filename] = item.options;
        });
        for (const file of fileList) {
            const fileName = file.name;
            // find a type in hub.config.json file
            if (fileName.startsWith('.')) {
                continue; // skip hidden files like .DS_Store
            }
            if (fileName.endsWith('.tbi')) {
                continue; // skip index files
            }
            if (fileName === 'hub.config.json') {
                continue;
            }
            if (trackTypes.hasOwnProperty(fileName) ) {
                const trackType = trackTypes[fileName];
                let track;
                if (ONE_TRACK_FILE_LIST.includes(trackType)) {
                    track = new TrackModel({
                        type: trackType,
                        url: null,
                        fileObj: file,
                        name: trackNames[fileName] || fileName,
                        label: trackNames[fileName] || fileName,
                        files: null,
                        options: trackOptions[fileName] || {},
                    });
                } else {
                    track = new TrackModel({
                        type: trackType,
                        url: null,
                        fileObj: file,
                        name: trackNames[fileName] || fileName,
                        label: trackNames[fileName] || fileName,
                        files: [file, idxHash[fileName+'.tbi']],
                        options: trackOptions[fileName] || {},
                    });
                }
                tracks.push(track);
            } else {
                notify.show('Skipping ' + file.name + ' not found in `hub.config.json`', 'warning', 3000);
            }
        }
        if (tracks.length > 0) {
            this.props.onTracksAdded(tracks);
        } else {
            notify.show('No local tracks could be found, please check your files and configuration', 'error', 5000);
            return null;
        }
    }

    renderTrackUpload = () => {
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
                            <option value="callingcard">callingcard</option>
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

    renderHubUpload = () => {
        return (
            <div>
                <label htmlFor="hubFile">
                    <p><strong>Choose a folder</strong> that contains a file named <strong>hub.config.json</strong>: (<span><a href={HELP_LINKS.localhub} target="_blank">local hub documentation</a></span>)</p> 
                    <input type="file" 
                        webkitdirectory="true" mozdirectory="true" directory="true" 
                        id="hubFile" onChange={this.handleHubUpload} />
                </label>
                <br/>
                <p className="lead">Or:</p>
                <label htmlFor="hubFile2">
                    <p><strong>Choose multiple files</strong>  (including <strong>hub.config.json</strong>):</p> 
                    <input type="file" 
                        id="hubFile2" multiple onChange={this.handleHubUpload} />
                </label>
            </div>
        );
    }

    render(){
        return (
            <div>
                <Tabs onSelect={(index, label) => this.setState({selectedTabIndex: index})} 
                    selected={this.state.selectedTabIndex}
                    headerStyle={{fontWeight: 'bold'}} activeHeaderStyle={{color: 'blue'}}
                >
                    <Tab label="Add Local Track">{this.renderTrackUpload()}</Tab>
                    <Tab label="Add Local Hub">{this.renderHubUpload()}</Tab>
                </Tabs>
            </div> 
        );
    }
}
