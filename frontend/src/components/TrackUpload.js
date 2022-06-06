import React from "react";
import PropTypes from "prop-types";
import { TrackModel } from "../model/TrackModel";
import { notify } from "react-notify-toast";
import { Tabs, Tab } from "react-bootstrap-tabs";
import JSON5 from "json5";
import { readFileAsText, HELP_LINKS } from "../util";
import { TrackOptionsUI } from "./trackManagers/TrackOptionsUI";
import { TYPES_DESC } from "./trackManagers/CustomTrackAdder";

const ONE_TRACK_FILE_LIST = ["bigwig", "bigbed", "hic", "biginteract", "g3d", "dynseq", "rgbpeak"]; // all lower case

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
            indexSuffix: ".tbi",
            msg: "",
            options: null,
        };
    }

    handleTypeChange = (event) => {
        const fileType = event.target.value;
        const indexSuffix = fileType === "bam" ? ".bai" : ".tbi";
        this.setState({ fileType, indexSuffix });
    };

    handleFileUpload = async (event) => {
        this.setState({ msg: "Uploading track..." });
        let tracks;
        const { options } = this.state;
        const fileList = Array.from(event.target.files);
        const { indexSuffix } = this.state;

        console.log(event, fileList, this.state);
        console.log(await fileList[0].text());

        if (ONE_TRACK_FILE_LIST.includes(this.state.fileType.toLocaleLowerCase())) {
            tracks = fileList.map(
                (file) =>
                    new TrackModel({
                        type: this.state.fileType,
                        url: file.path,
                        fileObj: file,
                        // fileObj: false,
                        name: file.name,
                        label: file.name,
                        files: null,
                        size: file.size,
                        // all files uploaded from this component are local
                        isLocalFile: true,
                        options,
                    })
            );
        } else {
            if (fileList.length !== 2) {
                notify.show("Aborting, please only select 2 files, the track file and the index file", "error", 5000);
                return null;
            }
            if (fileList[0].name.replace(indexSuffix, "") !== fileList[1].name.replace(indexSuffix, "")) {
                notify.show("Aborting, track file not match index file", "error", 5000);
                return null;
            }
            tracks = [
                new TrackModel({
                    type: this.state.fileType,
                    url: fileList[0].path,
                    // fileObj: fileList[0],
                    fileObj: null,
                    name: fileList[0].name,
                    label: fileList[0].name,
                    files: fileList,
                    isLocalFile: true,
                    options,
                }),
            ];
        }
        this.props.onTracksAdded(tracks);

        // save track local file paths to Redux
        console.log(this.props);

        this.setState({ msg: "Track added." });
    };

    handleHubUpload = async (event) => {
        this.setState({ msg: "Uploading hub..." });
        const tracks = [];
        const fileList = Array.from(event.target.files);
        const hubFile = fileList.filter((f) => f.name === "hub.config.json");
        if (hubFile.length !== 1) {
            notify.show("Aborting, can not find `hub.config.json` file", "error", 5000);
            return null;
        }
        const idxFiles = fileList.filter((f) => f.name.endsWith(".tbi") || f.name.endsWith(".bai"));
        const idxHash = {};
        const fileHash = {};
        idxFiles.forEach((item) => {
            idxHash[item.name] = item;
        });
        for (const file of fileList) {
            const fileName = file.name;
            // find a type in hub.config.json file
            if (fileName.startsWith(".")) {
                continue; // skip hidden files like .DS_Store
            }
            if (fileName.endsWith(".tbi") || fileName.endsWith(".bai")) {
                continue; // skip index files
            }
            if (fileName === "hub.config.json") {
                continue;
            }
            fileHash[fileName] = file;
        }
        const hubContent = await readFileAsText(hubFile[0]);
        const json = JSON5.parse(hubContent);
        for (const item of json) {
            if (fileHash.hasOwnProperty(item.filename)) {
                const trackType = item.type.toLocaleLowerCase();
                const indexSuffix = trackType === "bam" ? ".bai" : ".tbi";
                let track;
                if (ONE_TRACK_FILE_LIST.includes(trackType)) {
                    track = new TrackModel({
                        type: trackType,
                        url: null,
                        fileObj: fileHash[item.filename],
                        name: item.name || item.filename,
                        label: item.label || item.name || item.filename,
                        files: null,
                        options: item.options || {},
                        metadata: item.metadata || {},
                        isLocalFile: true,
                    });
                } else {
                    track = new TrackModel({
                        type: trackType,
                        url: null,
                        fileObj: fileHash[item.filename],
                        name: item.name || item.filename,
                        label: item.label || item.name || item.filename,
                        files: [fileHash[item.filename], idxHash[item.filename + indexSuffix]],
                        options: item.options || {},
                        metadata: item.metadata || {},
                        isLocalFile: true,
                    });
                }
                tracks.push(track);
            } else {
                notify.show("Skipping " + item.filename + " not found in `hub.config.json`", "warning", 3000);
            }
        }
        if (tracks.length > 0) {
            this.props.onTracksAdded(tracks);
        } else {
            notify.show("No local tracks could be found, please check your files and configuration", "error", 5000);
            return null;
        }
        this.setState({ msg: "Hub uploaded." });
    };

    getOptions = (value) => {
        let options = null;
        try {
            options = JSON5.parse(value);
        } catch (error) {
            // notify.show('Option syntax is not correct, ignored', 'error', 3000);
        }
        this.setState({ options });
    };

    renderTrackUpload = () => {
        return (
            <div>
                <label>
                    <h3>1. Choose track file type:</h3>
                    <select value={this.state.fileType} onChange={this.handleTypeChange}>
                        <optgroup label="select only the track file (can select many of same type)">
                            <option value="bigWig">bigWig - {TYPES_DESC.bigWig}</option>
                            <option value="bigBed">bigBed - {TYPES_DESC.bigBed}</option>
                            <option value="rgbpeak">RgbPeak - {TYPES_DESC.rgbpeak}</option>
                            <option value="hic">HiC - {TYPES_DESC.hic}</option>
                            <option value="bigInteract">bigInteract - {TYPES_DESC.bigInteract}</option>
                            <option value="dynseq">dynseq - {TYPES_DESC.dynseq}</option>
                            <option value="g3d">G3D - {TYPES_DESC.g3d}</option>
                            {/* <option value="jaspar">Jaspar - {TYPES_DESC.jaspar}</option> */}
                        </optgroup>
                        <optgroup label="select both the track file and index file (only select 1 pair)">
                            <option value="bedGraph">bedGraph - {TYPES_DESC.bedGraph}</option>
                            <option value="methylC">methylC - {TYPES_DESC.methylC}</option>
                            <option value="categorical">categorical - {TYPES_DESC.categorical}</option>
                            <option value="bed">bed - {TYPES_DESC.bed}</option>
                            <option value="vcf">vcf - {TYPES_DESC.vcf}</option>
                            <option value="refBed">refBed - {TYPES_DESC.refBed}</option>
                            <option value="longrange">longrange - {TYPES_DESC.longrange}</option>
                            <option value="longrangecolor">longrange - {TYPES_DESC.longrangecolor}</option>
                            <option value="qbed">qBED - {TYPES_DESC.qBED}</option>
                            <option value="bam">BAM - {TYPES_DESC.bam}</option>
                        </optgroup>
                    </select>
                </label>
                <br />
                <TrackOptionsUI onGetOptions={(value) => this.getOptions(value)} />
                <label htmlFor="trackFile">
                    <h3>2. Choose track file:</h3>
                    <input type="file" id="trackFile" multiple onChange={this.handleFileUpload} />
                    {/* <button id="trackFile" onClick={this.handleFileUpload}>Choose Files</button> */}
                </label>
            </div>
        );
    };

    renderHubUpload = () => {
        return (
            <div>
                <label htmlFor="hubFile">
                    <p>
                        <strong>Choose a folder</strong> that contains a file named <strong>hub.config.json</strong>: (
                        <span>
                            <a href={HELP_LINKS.localhub} target="_blank" rel="noopener noreferrer">
                                local hub documentation
                            </a>
                        </span>
                        )
                    </p>
                    <input
                        type="file"
                        webkitdirectory="true"
                        mozdirectory="true"
                        directory="true"
                        id="hubFile"
                        onChange={this.handleHubUpload}
                    />
                </label>
                <br />
                <p className="lead">Or:</p>
                <label htmlFor="hubFile2">
                    <p>
                        <strong>Choose multiple files</strong> (including <strong>hub.config.json</strong>):
                    </p>
                    <input type="file" id="hubFile2" multiple onChange={this.handleHubUpload} />
                </label>
            </div>
        );
    };

    render() {
        return (
            <div>
                <Tabs
                    onSelect={(index, label) => this.setState({ selectedTabIndex: index })}
                    selected={this.state.selectedTabIndex}
                    headerStyle={{ fontWeight: "bold" }}
                    activeHeaderStyle={{ color: "blue" }}
                >
                    <Tab label="Add Local Track">{this.renderTrackUpload()}</Tab>
                    <Tab label="Add Local Hub">{this.renderHubUpload()}</Tab>
                </Tabs>
                <div className="text-danger font-italic">{this.state.msg}</div>
            </div>
        );
    }
}
