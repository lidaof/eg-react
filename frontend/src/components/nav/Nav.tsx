import AppState, { ActionCreators, GenomeState, SyncedContainer } from 'AppState';
import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ArrowBack } from '@material-ui/icons';
import { AppIcon } from '../GenomePicker';
import { getGenomeContainerTitle } from '../containerView/containerUtils';
import packageJson from '../../../package.json';
import DarkMode from '../DarkMode';
import Button from '../egUI/Button';
import Apps from './items/AppsMenu';
import Help from './items/HelpMenu';
import Settings from './items/SettingsMenu';
import Share from './items/ShareMenu';
import Tracks from './items/TracksMenu';
import {
    AppBar,
    IconButton,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
} from '@material-ui/core';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion/dist/framer-motion';

import './Nav.css';
import { getGenomeConfig, getSpeciesInfo } from 'model/genomes/allGenomes';
import Track from 'components/trackVis/commonComponents/Track';
import { RegionExpander } from 'model/RegionExpander';
import { ALIGNMENT_TYPES, INTERACTION_TYPES } from 'components/trackConfig/getTrackConfig';
import _ from 'lodash';

const BASE_TITLE = "WashU Epigenome Browser";
const REGION_EXPANDER1 = new RegionExpander(1);
const REGION_EXPANDER0 = new RegionExpander(0);

interface NavProps {
    virusBrowserMode: boolean;
    containerTitles: string[] | null;
    pickingGenome: boolean;
    bundleId: string;
    availableTrackSets: Set<string>;
    onTracksAdded: Function;
    onTrackRemoved: Function;
    onAddTracksToPool: Function;
    publicTracksPool: any;
    publicHubs: any;
    onHubUpdated: Function;
    customTracksPool: any;
    // publicTrackSets: any;
    // customTrackSets: any;
    addTermToMetaSets: Function;
    genomeConfig: any;
    groupedTrackSets: any;
    addTracktoAvailable: Function;
    removeTrackFromAvailable: Function;
    addedTrackSets: Set<string>;

    // Redux props
    editingGenome?: GenomeState;
    editingContainer?: SyncedContainer;
    onGenomeSelected?: (genome: string) => void;
    darkTheme?: boolean;
    onToggleNavigator?: () => void;
    isShowingNavigator?: boolean;
    onToggleVR?: () => void;
    isShowingVR?: boolean;
    trackLegendWidth?: number;
    onLegendWidthChanged?: (width: number) => void;
}

function _Nav(props: NavProps) {
    const {
        virusBrowserMode,
        containerTitles,
        pickingGenome,
        editingGenome,
        editingContainer,
        bundleId,
        availableTrackSets,
        onTracksAdded,
        onTrackRemoved,
        onAddTracksToPool,
        publicTracksPool,
        publicHubs,
        onHubUpdated,
        customTracksPool,
        // publicTrackSets,
        // customTrackSets,
        addedTrackSets,
        addTermToMetaSets,
        groupedTrackSets,
        addTracktoAvailable,
        removeTrackFromAvailable,
        onGenomeSelected,
        darkTheme,
        onToggleNavigator,
        isShowingNavigator,
        onToggleVR,
        isShowingVR,
        trackLegendWidth,
        onLegendWidthChanged,
    } = props;
    // const theme = useTheme();
    // const smallscreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [title, setTitle] = useState<string>("WashU Epigenome Browser");

    useEffect(() => {
        if (pickingGenome) return setTitle(BASE_TITLE);
        const titleText = containerTitles.length > 3 ? "Multiple Genomes" : getGenomeContainerTitle(containerTitles);
        setTitle(titleText);
        if (!virusBrowserMode) document.title = `${titleText} | ${BASE_TITLE}`;
    }, [containerTitles]);

    const handleBack = () => {
        if (!virusBrowserMode) document.title = BASE_TITLE;
        onGenomeSelected("");
    };

    const genomeConfig = editingGenome && getGenomeConfig(editingGenome.name);

    let genomeName, name, logo, color, expansionTypes, hasExpansionTrack, REGION_EXPANDER;

    if (!pickingGenome) {
        const genomeName = genomeConfig.genome.getName();
        const { name, logo, color } = getSpeciesInfo(genomeName);
        const expansionTypes = INTERACTION_TYPES.concat(ALIGNMENT_TYPES);
        const hasExpansionTrack = editingGenome.tracks.some((model) => expansionTypes.includes(model.type)) ? true : false;
        const REGION_EXPANDER = hasExpansionTrack ? REGION_EXPANDER1 : REGION_EXPANDER0;
    }

    return (
        <AppBar color="transparent" position="static" elevation={0} style={{ borderBottom: pickingGenome ? null : "1px #5f6368 solid", paddingLeft: 10 }}>
            <Toolbar disableGutters>
                {!virusBrowserMode && (
                    <div style={{ marginTop: "5px" }}>
                        <AppIcon withText={false} />
                        {/* <span id="theVersion">v{packageJson.version}</span> */}
                    </div>
                )}
                <AnimatePresence exitBeforeEnter>
                    <motion.div
                        key={pickingGenome}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: "flex", flexDirection: "row", width: "100%" }}
                    >
                        {pickingGenome ? (
                            <Typography variant="h5" className="title" style={{ marginTop: 5, marginLeft: 20, color: "var(--neutral-font-color)" }}>
                                WashU <span style={{ fontWeight: 100 }}>Epigenome Browser</span>
                            </Typography>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "row", }}>
                                <IconButton onClick={handleBack} style={{ marginTop: "5px", outline: "none" }}>
                                    <ArrowBack />
                                </IconButton>
                                <Typography variant="h5" className="title" style={{ marginTop: 12, marginLeft: 20, color: "var(--neutral-font-color)" }}>
                                    {title}
                                </Typography>
                            </div>
                        )}
                        <div style={buttonGroupStyle}>
                            <DarkMode />
                            {pickingGenome ? (
                                <>
                                    <Button href="https://epigenomegateway.readthedocs.io/en/latest/">
                                        Documentation
                                    </Button>
                                    <Button href="https://epigenomegateway.wustl.edu/legacy/">
                                        Switch to the 'old' browser
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Tracks
                                        tracks={editingGenome.tracks}
                                        onTracksAdded={onTracksAdded}
                                        onTrackRemoved={onTrackRemoved}
                                        onAddTracksToPool={onAddTracksToPool}
                                        publicTracksPool={publicTracksPool}
                                        publicHubs={publicHubs}
                                        onHubUpdated={onHubUpdated}
                                        // publicTrackSets={publicTrackSets}
                                        customTracksPool={customTracksPool}
                                        // customTrackSets={customTrackSets}
                                        addedTrackSets={addedTrackSets}
                                        addTermToMetaSets={addTermToMetaSets}
                                        genomeConfig={genomeConfig}
                                        groupedTrackSets={groupedTrackSets}
                                        availableTrackSets={availableTrackSets}
                                        addTracktoAvailable={addTracktoAvailable}
                                        removeTrackFromAvailable={removeTrackFromAvailable}
                                    />
                                    <Apps
                                        genomeConfig={genomeConfig}
                                        bundleId={bundleId}
                                        hasExpansionTrack={hasExpansionTrack}
                                        highlights={editingGenome && editingGenome.highlights}
                                        regionExpander={REGION_EXPANDER}
                                        viewRegion={editingContainer && editingContainer.viewRegion}
                                        darkTheme={darkTheme}
                                    />
                                    <Help />
                                    <Share />
                                    <Settings 
                                        onToggleNavigator={onToggleNavigator}
                                        isShowingNavigator={isShowingNavigator}
                                        onToggleVR={onToggleVR}
                                        isShowingVR={isShowingVR}
                                        trackLegendWidth={trackLegendWidth}
                                        onLegendWidthChanged={onLegendWidthChanged}
                                    />
                                </>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </Toolbar >
        </AppBar >
    );
}

const buttonGroupStyle: React.CSSProperties = {
    marginTop: 5,
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 2,
    marginRight: 10,
};

const mapStateToProps = (state: { browser: { present: AppState } }, ownProps: NavProps) => {
    if (ownProps.pickingGenome) return {};
    const [cidx, gidx] = state.browser.present.editTarget;

    return {
        editingGenome: state.browser.present.containers && state.browser.present.containers[cidx].genomes[gidx],
        editingContainer: state.browser.present.containers && state.browser.present.containers[cidx],
        darkTheme: state.browser.present.darkTheme,
        isShowingNavigator: state.browser.present.isShowingNavigator,
        isShowingVR: state.browser.present.isShowingVR,
        trackLegendWidth: state.browser.present.trackLegendWidth,
    }
};

const callbacks = {
    onGenomeSelected: ActionCreators.setGenome,
    onToggleNavigator: ActionCreators.toggleNavigator,
    onToggleVR: ActionCreators.toggleVR,
    onLegendWidthChanged: ActionCreators.setTrackLegendWidth,
}

const Nav = connect(mapStateToProps, callbacks)(_Nav);

export default Nav;
