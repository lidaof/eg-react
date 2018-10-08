import React from "react";
import PropTypes from 'prop-types';
import ReactModal from "react-modal";
import _ from "lodash";
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import { getSpeciesInfo } from "../model/genomes/allGenomes";
import TrackRegionController from './genomeNavigator/TrackRegionController';
import ZoomButtons from './trackContainers/ZoomButtons';
import RegionSetSelector from './RegionSetSelector';
import TrackList from "./trackManagers/TrackList";
import { TrackModel } from '../model/TrackModel';
import AnnotationTrackSelector from './trackManagers/AnnotationTrackSelector';
import HubPane from './trackManagers/HubPane'
import CustomTrackAdder from './trackManagers/CustomTrackAdder';
import { SessionUI } from "./SessionUI";
import LiveUI from "./LiveUI";
import { RegionExpander } from '../model/RegionExpander';
import { ScreenshotUI } from "./ScreenshotUI";
import FacetTableUI from "./FacetTableUI";

import eglogo from '../images/eglogo.jpg';

import './Nav.css';

const VERSION = "v47.2";

const REGION_EXPANDER = new RegionExpander(0);

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
        trackLegendWidth: PropTypes.number,
        onLegendWidthChange: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.debounced = _.debounce(this.props.onLegendWidthChange, 250);
    }
    
    changeLegendWidth = (e) => {
        const width = Number.parseFloat(e.currentTarget.value);
        //const debounced = _.debounce(this.props.onLegendWidthChange, 250);
        if (width >= 60 && width <= 200) {
            //this.props.onLegendWidthChange(width);
            this.debounced(width);
        }
    }

    render() {
        const {
            tracks, genomeConfig, onTracksAdded, onTrackRemoved, selectedRegion, onRegionSelected,
            isShowingNavigator, onToggleNavigator, isShowing3D, onToggle3DScene, bundleId, liveId,
            onToggleHighlight, onSetEnteredRegion, highlightEnteredRegion, trackLegendWidth,
            onAddTracksToPool, publicTracksPool, customTracksPool, onHubUpdated, publicHubs,
            publicTrackSets, customTrackSets, addedTrackSets, addTracktoAvailable, removeTrackFromAvailable,
            availableTrackSets, addTermToMetaSets
        } = this.props;
        const genomeName = genomeConfig.genome.getName();
        const {name, logo, color} = getSpeciesInfo(genomeName)
        return (
            <div className="Nav-container">
                <div id="logoDiv">
                    <img src={eglogo} width="180px" height="30px" alt="browser logo"/>
                    <span id="theNew" >The New</span>
                    <span id="theVersion">{VERSION}</span>
                </div>
                <div className="Nav-genome Nav-center" 
                    style={{backgroundImage: `url(${logo})`, color: color, backgroundSize: "cover"}}>
                    <div><span style={{textTransform: 'capitalize'}}>{name}</span> {genomeName}</div>
                </div>
                <div className="Nav-center">
                    <TrackRegionController
                        selectedRegion={selectedRegion}
                        onRegionSelected={onRegionSelected}
                        onToggleHighlight={onToggleHighlight}
                        onSetEnteredRegion={onSetEnteredRegion}
                    />
                </div>
                <div className="Nav-center">
                    <ZoomButtons viewRegion={selectedRegion} onNewRegion={onRegionSelected} />
                </div>
                <div className="Nav-center btn-group">
                    <DropdownOpener extraClassName="btn-primary" label="🎹Tracks" />
                    <div className="dropdown-menu">
                        <ModalMenuItem itemLabel="Track Facet Table">
                            <FacetTableUI 
                                publicTracksPool={publicTracksPool}
                                customTracksPool={customTracksPool}
                                addedTracks={tracks} 
                                onTracksAdded={onTracksAdded}
                                publicTrackSets={publicTrackSets}
                                customTrackSets={customTrackSets}
                                addedTrackSets={addedTrackSets}
                                addTermToMetaSets={addTermToMetaSets}
                            />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Annotation Tracks">
                            <AnnotationTrackSelector
                                addedTracks={tracks}
                                onTracksAdded={onTracksAdded}
                                addedTrackSets={addedTrackSets} 
                            />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Public Data Hubs">
                            <HubPane 
                                addedTracks={tracks} 
                                onTracksAdded={onTracksAdded} 
                                onTrackRemoved={onTrackRemoved}
                                onAddTracksToPool={onAddTracksToPool}
                                publicTracksPool={publicTracksPool}
                                publicHubs={publicHubs}
                                onHubUpdated={onHubUpdated}
                                publicTrackSets={publicTrackSets}
                                addedTrackSets={addedTrackSets}
                                addTermToMetaSets={addTermToMetaSets}
                            />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Custom Tracks">
                            <CustomTrackAdder 
                                addedTracks={tracks} 
                                onTracksAdded={onTracksAdded} 
                                onTrackRemoved={onTrackRemoved} 
                                onAddTracksToPool={onAddTracksToPool}
                                customTracksPool={customTracksPool}
                                customTrackSets={customTrackSets}
                                addedTrackSets={addedTrackSets}
                                addTermToMetaSets={addTermToMetaSets}
                            />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Track List">
                            <TrackList 
                                addedTracks={tracks} 
                                onTracksAdded={onTracksAdded} 
                                onTrackRemoved={onTrackRemoved}
                                addedTrackSets={addedTrackSets}
                                availableTrackSets={availableTrackSets}
                                addTracktoAvailable={addTracktoAvailable}
                                removeTrackFromAvailable={removeTrackFromAvailable}
                                availableTrackSets={availableTrackSets}
                            />
                        </ModalMenuItem>
                    </div>
                </div>
                <div className="Nav-center">
                    <DropdownOpener extraClassName="btn-success" label="🔧Apps" />
                    <div className="dropdown-menu">
                        <ModalMenuItem itemLabel="Region Set View">
                            <RegionSetSelector genome={genomeConfig.genome} />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Session" style={{content: {
                                                        right: "unset",
                                                        bottom: "unset",
                                                        overflow: "visible",
                                                        padding: "5px",
                                                    }}}>
                            <SessionUI bundleId={bundleId} />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Go Live" style={{content: {
                                                        right: "unset",
                                                        bottom: "unset",
                                                        overflow: "visible",
                                                        padding: "5px",
                                                    }}}>
                            <LiveUI liveId={liveId} />
                        </ModalMenuItem>
                        <ModalMenuItem itemLabel="Screenshot">
                            <ScreenshotUI expansionAmount={REGION_EXPANDER} />
                        </ModalMenuItem>
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
                                onChange={onToggleNavigator}
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
                        <label className="dropdown-item" htmlFor="isHighlightRegion">
                            <input id="isHighlightRegion" type="checkbox" 
                                checked={highlightEnteredRegion} onChange={onToggleHighlight} />
                            <span style={{marginLeft: "1ch"}} >Highlight entered region</span>
                        </label>
                        <label className="dropdown-item" htmlFor="switch3D">
                            <input id="switch3D" type="checkbox" checked={isShowing3D} onChange={onToggle3DScene} />
                            <span style={{marginLeft: "1ch"}} >Show 3D scene</span>
                        </label>
                        <label className="dropdown-item" htmlFor="setLegendWidth">
                            <input type="number" id="legendWidth" step="5" min="60" max="200" 
                                value={trackLegendWidth}
                                onChange={this.changeLegendWidth} />
                            <span style={{marginLeft: "1ch"}}>Change track legend width</span>
                        </label>
                    </div>
                </div>
                <div className="Nav-center">
                    <a role="button" className="btn btn-warning btn-sm" 
                        href="https://epigenomegateway.readthedocs.io/" 
                        target="_blank">📖Documentation</a>
                </div>
            </div>
        )
    }
}

export default Nav;

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
                style={this.props.style}
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
