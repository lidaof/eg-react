import React from "react";
import PropTypes from 'prop-types';
import ReactModal from "react-modal";
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import { getGenomeInfo } from "../model/genomes/allGenomes";
import TrackRegionController from './genomeNavigator/TrackRegionController';
import ZoomButtons from './trackContainers/ZoomButtons';
import { withSettings } from './Settings';
import RegionSetSelector from './RegionSetSelector';
import TrackList from "./trackManagers/TrackList";
import { TrackModel } from '../model/TrackModel';
import AnnotationTrackSelector from './trackManagers/AnnotationTrackSelector';
import HubPane from './trackManagers/HubPane'
import CustomTrackAdder from './trackManagers/CustomTrackAdder';

import eglogo from '../images/eglogo.jpg';

import './Nav.css';


/**
 * the top navigation bar for browser
 * @author Daofeng Li
 */
class Nav extends React.Component {
    static propTypes = {
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        onRegionSelected: PropTypes.func,
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        genomeConfig: PropTypes.object.isRequired,
        onTracksAdded: PropTypes.func,
        onTrackRemoved: PropTypes.func,
    };

    state = { 
        showRegionset: false,
        showList: false,
        showAnnotation: false,
        showHub: false,
        showCustom: false,
    };

    handleRegionsetOpen = () => {
        this.setState({ showRegionset: true });
    };
      
    handleRegionsetClose = () => {
        this.setState({ showRegionset: false });
    };

    handleListOpen = () => {
        this.setState({ showList: true });
    };
      
    handleListClose = () => {
        this.setState({ showList: false });
    };

    handleAnnotationOpen = () => {
        this.setState({ showAnnotation: true });
    };
      
    handleAnnotationClose = () => {
        this.setState({ showAnnotation: false });
    };

    handleHubOpen = () => {
        this.setState({ showHub: true });
    };
      
    handleHubClose = () => {
        this.setState({ showHub: false });
    };

    handleCustomOpen = () => {
        this.setState({ showCustom: true });
    };
      
    handleCustomClose = () => {
        this.setState({ showCustom: false });
    };

    render() {
        const {isShowingNavigator, toggleNavigator, isShowing3D, on3DToggle} = this.props.settings;
        const {tracks, genomeConfig, onTracksAdded, onTrackRemoved, selectedRegion, onRegionSelected} = this.props;
        const genomeName = genomeConfig.genome.getName();
        const {name, logo, color} = getGenomeInfo(genomeName)
        return (
            <div className="Nav-container">
                <div>
                    <img src={eglogo} width="300px" alt="browser logo"/>
                    <span id="theNew" >The New</span>
                </div>
                <div className="Nav-genome Nav-center" 
                    style={{backgroundImage: `url(${logo})`, color: color, backgroundSize: "cover"}}>
                    <div><span style={{textTransform: 'capitalize'}}>{name}</span> {genomeName}</div>
                </div>
                <div className="Nav-center">
                    <TrackRegionController
                        selectedRegion={selectedRegion}
                        onRegionSelected={onRegionSelected}
                    />
                </div>
                <div className="Nav-center">
                    <ZoomButtons viewRegion={selectedRegion} onNewRegion={onRegionSelected} />
                </div>
                <div className="Nav-center btn-group">
                    <button type="button" className="btn btn-primary btn-sm dropdown-toggle" 
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">🎹Tracks</button>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">Track Facet Table</a>
                        <div className="dropdown-item" onClick={this.handleAnnotationOpen}>Annotation Tracks</div>
                        <ReactModal 
                            isOpen={this.state.showAnnotation}
                            contentLabel="Annotation Tracks"
                            ariaHideApp={false}
                            onRequestClose={this.handleAnnotationClose}
                            shouldCloseOnOverlayClick={true}
                        >
                            <span className="text-right" 
                                style={{cursor: "pointer", color: "red", fontSize: "2em", position:"absolute", top: "-5px", right: "15px"}} 
                                onClick={this.handleAnnotationClose}>&times;</span>
                            <AnnotationTrackSelector addedTracks={tracks} onTracksAdded={onTracksAdded} onTrackRemoved={onTrackRemoved} />
                        </ReactModal>
                        <div className="dropdown-item" onClick={this.handleHubOpen}>Public Data Hubs</div>
                        <ReactModal 
                            isOpen={this.state.showHub}
                            contentLabel="Track Hubs"
                            ariaHideApp={false}
                            onRequestClose={this.handleHubClose}
                            shouldCloseOnOverlayClick={true}
                        >
                            <span className="text-right" 
                                style={{cursor: "pointer", color: "red", fontSize: "2em", position:"absolute", top: "-5px", right: "15px"}} 
                                onClick={this.handleHubClose}>&times;</span>
                            <HubPane addedTracks={tracks} onTracksAdded={onTracksAdded} onTrackRemoved={onTrackRemoved} />
                        </ReactModal>
                        <div className="dropdown-item" onClick={this.handleCustomOpen}>Custom Tracks</div>
                        <ReactModal 
                            isOpen={this.state.showCustom}
                            contentLabel="Custom Tracks"
                            ariaHideApp={false}
                            onRequestClose={this.handleCustomClose}
                            shouldCloseOnOverlayClick={true}
                        >
                            <span className="text-right" 
                                style={{cursor: "pointer", color: "red", fontSize: "2em", position:"absolute", top: "-5px", right: "15px"}} 
                                onClick={this.handleCustomClose}>&times;</span>
                            <CustomTrackAdder addedTracks={tracks} onTracksAdded={onTracksAdded} onTrackRemoved={onTrackRemoved} />
                        </ReactModal>
                        <div className="dropdown-item" onClick={this.handleListOpen}>Track List</div>
                        <ReactModal 
                            isOpen={this.state.showList}
                            contentLabel="Track List"
                            ariaHideApp={false}
                            onRequestClose={this.handleListClose}
                            shouldCloseOnOverlayClick={true}
                        >
                            <span className="text-right" 
                                style={{cursor: "pointer", color: "red", fontSize: "2em", position:"absolute", top: "-5px", right: "15px"}} 
                                onClick={this.handleListClose}>&times;</span>
                            <TrackList addedTracks={tracks} onTracksAdded={onTracksAdded} onTrackRemoved={onTrackRemoved} />
                        </ReactModal>
                    </div>
                </div>
                <div className="Nav-center">
                    <button type="button" className="btn btn-success btn-sm dropdown-toggle"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">🔧Apps</button>
                    <div className="dropdown-menu">
                        <div className="dropdown-item" onClick={this.handleRegionsetOpen}>Region Set View</div>
                        <ReactModal 
                            isOpen={this.state.showRegionset}
                            contentLabel="Region set"
                            ariaHideApp={false}
                            onRequestClose={this.handleRegionsetClose}
                            shouldCloseOnOverlayClick={true}
                        >
                            <span className="text-right" 
                                style={{cursor: "pointer", color: "red", fontSize: "2em", position:"absolute", top: "-5px", right: "15px"}} 
                                onClick={this.handleRegionsetClose}>&times;</span>
                            <RegionSetSelector genome={genomeConfig.genome} />
                        </ReactModal>
                        <div className="dropdown-item">Screenshot</div>
                    </div>
                </div>
                <div className="Nav-center">
                    <button type="button" className="btn btn-info btn-sm dropdown-toggle"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">⚙Settings</button>
                    <div className="dropdown-menu">
                        <label className="dropdown-item" htmlFor="switchNavigator">
                            <input id="switchNavigator" type="checkbox" checked={isShowingNavigator} onChange={toggleNavigator} />
                            <span style={{marginLeft: "1ch"}} >Show genome-wide navigator</span>
                        </label>
                        <label className="dropdown-item" htmlFor="switch3D">
                            <input id="switch3D" type="checkbox" checked={isShowing3D} onChange={on3DToggle} />
                            <span style={{marginLeft: "1ch"}} >Show 3D scene</span>
                        </label>
                    </div>
                </div>
                <div className="Nav-center">
                    <button type="button" className="btn btn-warning btn-sm">📖Documentation</button>
                </div>
                <div></div>
            </div>
        )
    }
}

export default withSettings(Nav);