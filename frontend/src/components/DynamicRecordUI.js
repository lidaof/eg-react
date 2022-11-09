import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
// import * as HME from "h264-mp4-encoder";
import withAutoDimensions from './withAutoDimensions';
import { withTrackData } from './trackContainers/TrackDataManager';
import { withTrackView } from './trackContainers/TrackViewManager';
import { TrackHandle } from './trackContainers/TrackHandle';
import { withTrackLegendWidth } from './withTrackLegendWidth';
import { getTrackConfig } from './trackConfig/getTrackConfig';

const HME = window.HME;

function mapStateToProps(state) {
    const presentState = state.browser.present;
    const [cidx, gidx] = presentState.editTarget;
    return {
        genome: presentState.containers[cidx].genomes[gidx].genomeName,
        viewRegion: presentState.containers[cidx].viewRegion,
        tracks: presentState.containers[cidx].genomes[gidx].tracks,
        metadataTerms: presentState.containers[cidx].genomes[gidx].metadataTerms,
    };
}

const withAppState = connect(mapStateToProps);
const withEnhancements = _.flowRight(withAppState, withAutoDimensions, withTrackView, withTrackData, withTrackLegendWidth);

class DynamicRecordUINotConnected extends React.Component {
    static displayName = "DynamicRecordUI";
    
    state = {buttonDisabled: "", message: "", frames: 100};
    

    prepareMovie = async () => {
        const tracks = Array.from(document.querySelector('#dynamicContainer').querySelectorAll('.Track'));
        const canvas = tracks[0].getElementsByTagName('canvas')[0];
        let vw = canvas.width, vh = canvas.height;
        const canvas2 = canvas.cloneNode(false);
        canvas2.width = vw;
        canvas2.height = vh;
        const ctx = canvas2.getContext("2d", {desynchronized: true});
        const encoder = await HME.createH264MP4Encoder();
        // dimensions must be a multiple of 2
        if (vw % 2 !== 0) vw -= 1;
        if (vh % 2 !== 0) vh -= 1;
        encoder.width = vw;
        encoder.height = vh; 
        encoder.initialize();
        // const frames = 100;
        console.log(tracks, canvas, ctx, vw, vh, encoder)
        for (let i = 0; i <= this.state.frames; ++i) {
            ctx.drawImage(canvas, 0, 0, vw, vh);
            encoder.addFrameRgba(ctx.getImageData(0, 0, vw, vh).data);
            await new Promise(resolve => window.requestAnimationFrame(resolve));
        }
        encoder.finalize();
        const uint8Array = encoder.FS.readFile(encoder.outputFilename);
        encoder.delete();
        return (URL.createObjectURL(new Blob([uint8Array], { type: "video/mp4" })));
    }
    
    downloadMovie = async () => {
        this.setState({buttonDisabled: "disabled", message: "recording..."})
        const movie = await this.prepareMovie();
        const dl = document.createElement("a");
        document.body.appendChild(dl); // This line makes it work in Firefox.
        dl.setAttribute("href", movie);
        dl.setAttribute("download", (new Date()).toISOString() + "_dynamicTrackRecod.mp4");
        dl.click();
        this.setState({buttonDisabled: "", message: ""});
    }


    makeTrackElements(dynamicTracks) {
        const {trackData, primaryView, metadataTerms, viewRegion} = this.props;
        const trackElements = dynamicTracks.map((trackModel, index) => {
            const id = trackModel.getId();
            const data = trackData[id];
            return primaryView ? <TrackHandle
                key={trackModel.getId()}
                trackModel={trackModel}
                {...data}
                viewRegion={data.visRegion}
                width={primaryView.visWidth}
                viewWindow={primaryView.viewWindow}
                metadataTerms={metadataTerms}
                xOffset={0}
                index={index}
                forceSvg={true}
                selectedRegion={viewRegion}
                zoomAnimation={0}
            />: null;
        });
        return trackElements;
    }

    handleChange = (event) => {
        this.setState({frames: Number.parseInt(event.target.value.trim(), 10)});
    }

    render() {
        const {tracks} = this.props;
        const dynamicTracks = tracks.filter(track => getTrackConfig(track).isDynamicTrack())
        const trackContents = this.makeTrackElements(dynamicTracks);
        return (
            <div>
                <p>Please wait the following browser view finish loading, <br />
                then select 1 dynamic track to export as a movie(.mp4) file. <br/>
                Please don't pause the animation of the track. <br />
                Once clicked the download button below, please don't close this page, the download will happen automatically.
                </p>
                <p>
                    <label>
                    Number of frames: {' '}
                    <input type="number" min="50" step="10" max="1000" value={this.state.frames} onChange={this.handleChange} />
                    </label>
                </p>
                <button 
                    className="btn btn-primary btn-sm" 
                    style={{marginBottom: "2ch"}}
                    onClick={this.downloadMovie} 
                    disabled={this.state.buttonDisabled}
                >
                    ⬇ Download as movie</button>
                    <div className="text-danger font-italic">{this.state.message}</div>
                <div id="dynamicContainer" style={{display: this.state.display}}>
                    {trackContents}
                </div>
            </div>
        );
    }
}

export const DynamicRecordUI = withEnhancements(DynamicRecordUINotConnected);