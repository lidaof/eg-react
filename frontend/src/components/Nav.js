import React from "react";
import PropTypes from 'prop-types';
import ReactModal from "react-modal";
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import { getSpeciesInfo } from "../model/genomes/allGenomes";
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
    
    render() {
        const {isShowingNavigator, toggleNavigator, isShowing3D, on3DToggle} = this.props.settings;
        const {tracks, genomeConfig, onTracksAdded, onTrackRemoved, selectedRegion, onRegionSelected} = this.props;
        const genomeName = genomeConfig.genome.getName();
        const {name, logo, color} = getSpeciesInfo(genomeName)
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
                    <DropdownOpener extraClassName="btn-primary" label="🎹Tracks" />
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#">Track Facet Table</a>
                        <ModalMenuItem itemLabel="Annotation Tracks">
                            <AnnotationTrackSelector
                                addedTracks={tracks}
                                onTracksAdded={onTracksAdded}
                                onTrackRemoved={onTrackRemoved} />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Public Data Hubs">
                            <HubPane 
                                addedTracks={tracks} 
                                onTracksAdded={onTracksAdded} 
                                onTrackRemoved={onTrackRemoved} />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Custom Tracks">
                            <CustomTrackAdder 
                                addedTracks={tracks} 
                                onTracksAdded={onTracksAdded} 
                                onTrackRemoved={onTrackRemoved} />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Track List">
                            <TrackList 
                                addedTracks={tracks} 
                                onTracksAdded={onTracksAdded} 
                                onTrackRemoved={onTrackRemoved} />
                        </ModalMenuItem>
                    </div>
                </div>
                <div className="Nav-center">
                    <DropdownOpener extraClassName="btn-success" label="🔧Apps" />
                    <div className="dropdown-menu">
                        <ModalMenuItem itemLabel="Region Set View">
                            <RegionSetSelector genome={genomeConfig.genome} />
                        </ModalMenuItem>
                        <div className="dropdown-item">Screenshot</div>
                    </div>
                </div>
                <div className="Nav-center">
                    <DropdownOpener extraClassName="btn-info" label="⚙Settings" />
                    <div className="dropdown-menu">
                        <label className="dropdown-item" htmlFor="switchNavigator">
                            <input
                                id="switchNavigator"
                                type="checkbox"
                                checked={isShowingNavigator}
                                onChange={toggleNavigator}
                            />
                            <span style={{marginLeft: "1ch"}} >Show genome-wide navigator</span>
                            <span className="GenomeNavigator-tooltip">❓
                                <div className="GenomeNavigator-tooltiptext">
                                    <ul style={{lineHeight: "1.2em", marginBottom: 0}}>
                                        <li>Left mouse drag: select</li>
                                        <li>Right mouse drag: pan</li>
                                        <li>Mousewheel: zoom</li>
                                    </ul>
                                </div>
                            </span>
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
            </div>
        )
    }
}

export default withSettings(Nav);

function DropdownOpener(props) {
    const {extraClassName, label} = props;
    return <button
        type="button"
        className={`btn btn-sm dropdown-toggle ${extraClassName}`}
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
    >
        {label}
    </button>
}

class ModalMenuItem extends React.Component {
    static propTypes = {
        itemLabel: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
        this.toggleOpen = this.toggleOpen.bind(this);
    }

    toggleOpen() {
        this.setState(prevState => {return {isOpen: !prevState.isOpen}});
    }

    render() {
        return <React.Fragment>
            <div className="dropdown-item" onClick={this.toggleOpen}>{this.props.itemLabel}</div>
            <ReactModal
                isOpen={this.state.isOpen}
                ariaHideApp={false}
                onRequestClose={this.toggleOpen}
                shouldCloseOnOverlayClick={true}
            >
                <ModalCloseButton onClick={this.toggleOpen} />
                {this.props.children}
            </ReactModal>
        </React.Fragment>;
    }
}

function ModalCloseButton(props) {
    return (
        <span
            className="text-right" 
            style={{cursor: "pointer", color: "red", fontSize: "2em", position:"absolute", top: "-5px", right: "15px"}}
            onClick={props.onClick}>
            ×
        </span>
    );
}
