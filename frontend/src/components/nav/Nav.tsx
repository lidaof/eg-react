import {
    AppBar, Drawer, IconButton,
    Toolbar, Tooltip, Typography, useMediaQuery, useTheme
} from '@material-ui/core';
import { ArrowBack, Redo } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import AppState, { ActionCreators, GenomeState, SyncedContainer } from 'AppState';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getGenomeContainerTitle } from '../containerView/containerUtils';
import DarkMode from '../DarkMode';
import Button from '../egUI/Button';
import { AppIcon } from '../GenomePicker';
import Apps from './items/AppsMenu';
import Help from './items/HelpMenu';
import Settings from './items/SettingsMenu';
import Share from './items/ShareMenu';
import Tracks from './items/TracksMenu';
import { ALIGNMENT_TYPES, INTERACTION_TYPES } from 'components/trackConfig/getTrackConfig';
import UndoRedo from 'components/trackContainers/UndoRedo';
// @ts-ignore
import { AnimatePresence, motion } from 'framer-motion/dist/framer-motion';
import { getGenomeConfig } from 'model/genomes/allGenomes';
import { RegionExpander } from 'model/RegionExpander';
import { Action, Dispatch } from 'redux';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import './Nav.css';

const BASE_TITLE = "WashU Epigenome Browser";
const REGION_EXPANDER1 = new RegionExpander(1);
const REGION_EXPANDER0 = new RegionExpander(0);

interface CollapsedMenuProps {
    children: React.ReactNode;
    open: boolean;
    handleOpen: () => void;
    handleClose: () => void;
}

function CollapsedMenu(props: CollapsedMenuProps) {
    const {
        children,
        open,
        handleOpen,
        handleClose,
    } = props;

    return (
        <>
            <IconButton style={{ outline: 'none' }} onClick={handleOpen}>
                <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={open} onClose={handleClose}>
                {children}
            </Drawer>
        </>
    );
}

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
    onJumpToHistory?: (idx: number) => void;
    undoIdx?: number;
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
        onJumpToHistory,
        undoIdx
    } = props;
    const theme = useTheme();
    const smallscreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [menuOpen, setMenuOpen] = useState(false);
    const [title, setTitle] = useState<string>("WashU Epigenome Browser");
    useEffect(() => {
        if (pickingGenome) return setTitle(BASE_TITLE);
        const titleText = containerTitles.length > 3 ? "Multiple Genomes" : getGenomeContainerTitle(containerTitles);
        setTitle(titleText);
        if (!virusBrowserMode) document.title = `${titleText} :: ${BASE_TITLE}`;
    }, [containerTitles, pickingGenome, virusBrowserMode]);

    const handleBack = () => {
        if (!virusBrowserMode) document.title = BASE_TITLE;
        onGenomeSelected("");
    };

    const handleMenuOpen = () => setMenuOpen(true);
    const handleMenuClose = () => setMenuOpen(false);

    const genomeConfig = editingGenome && getGenomeConfig(editingGenome.name);

    let expansionTypes: any[], hasExpansionTrack: any, REGION_EXPANDER: any;

    if (!pickingGenome && genomeConfig) { // TODO: handle genomes that don't have a genome config.
        expansionTypes = INTERACTION_TYPES.concat(ALIGNMENT_TYPES);
        hasExpansionTrack = editingGenome.tracks.some((model) => expansionTypes.includes(model.type)) ? true : false;
        REGION_EXPANDER = hasExpansionTrack ? REGION_EXPANDER1 : REGION_EXPANDER0;
    }

    return (
        <AppBar color="transparent" position="static" elevation={0} style={{ borderBottom: pickingGenome ? null : "1px #5f6368 solid", paddingLeft: 10, }}>
            <Toolbar disableGutters>
                {(!virusBrowserMode && (pickingGenome || !smallscreen)) && (
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
                        {(() => {
                            if (pickingGenome) return (
                                <Typography variant="h5" className="title" style={{ marginTop: 5, marginLeft: 20, color: "var(--neutral-font-color)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                    {!smallscreen && <span>WashU <span style={{ fontWeight: 100 }}>Epigenome Browser</span></span>}
                                </Typography>
                            )
                            if (smallscreen) return (
                                <div style={{ display: "flex", flexDirection: "row", }}>
                                    <CollapsedMenu
                                        open={menuOpen}
                                        handleOpen={handleMenuOpen}
                                        handleClose={handleMenuClose}
                                    >
                                        <div style={{
                                            display: "flex",
                                            flexDirection: "row",
                                            justifyContent: "center",
                                            margin: 20,
                                        }}>
                                            <AppIcon withText={false} />
                                        </div>
                                        <UndoRedo />
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
                                        <div style={{
                                            width: "100%",
                                            display: 'flex',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                        }}>
                                            <IconButton onClick={async () => {
                                                handleMenuClose();
                                                await new Promise((resolve) => setTimeout(resolve, 200));
                                                handleBack();
                                            }} style={{
                                                marginTop: "5px",
                                                outline: "none",
                                            }}>
                                                <ArrowBack />
                                            </IconButton>
                                        </div>
                                    </CollapsedMenu>
                                    <Typography noWrap component="div" variant="h5" className="title" style={{ marginTop: 12, marginLeft: 20, color: "var(--neutral-font-color)" }}>
                                        {title}
                                    </Typography>
                                </div>
                            )
                            return (
                                <div style={{ display: "flex", flexDirection: "row", }}>
                                    <IconButton onClick={handleBack} style={{ marginTop: "5px", outline: "none" }}>
                                        <ArrowBack />
                                    </IconButton>
                                    <Typography variant="h5" className="title" style={{ marginTop: 12, marginLeft: 20, color: "var(--neutral-font-color)" }}>
                                        {title}
                                    </Typography>
                                </div>
                            )
                        })()}
                        <div style={buttonGroupStyle}>
                            <DarkMode />
                            {pickingGenome ? (
                                <>
                                    <Button href="https://epigenomegateway.readthedocs.io/en/latest/">
                                        {smallscreen ? 'Docs' : 'Documentation'}
                                    </Button>
                                    <Button href="https://epigenomegateway.wustl.edu/legacy/">
                                        {smallscreen ? 'Legacy' : "Switch to the 'old' browser"}
                                    </Button>
                                    {undoIdx !== -1 && (
                                        <Tooltip title="Back to browser">
                                            <IconButton onClick={() => onJumpToHistory(undoIdx)} style={{ outline: "none" }}>
                                                <Redo />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </>
                            ) : (
                                !smallscreen && (
                                    <>
                                        <UndoRedo />
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
                                )
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

const mapStateToProps = (state: { browser: { present: AppState, past: AppState[], future: AppState[] } }, ownProps: NavProps) => {
    if (ownProps.pickingGenome) {
        let undoIdx = -1;
        let past = state.browser.past;
        if (past.length) {
            for (let i = past.length - 1; i >= 0; i--) {
                if (past[i].containers && past[i].containers.length) {
                    undoIdx = i;
                    break;
                }
            }
        }
        // TODO: retain dark mode preference when returning to genome view.
        return { undoIdx };
    }
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

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
    return {
        onGenomeSelected: (genomeName: string) => dispatch(ActionCreators.setGenome(genomeName)),
        onToggleNavigator: () => dispatch(ActionCreators.toggleNavigator()),
        onToggleVR: () => dispatch(ActionCreators.toggleVR()),
        onLegendWidthChanged: (width: number) => dispatch(ActionCreators.setTrackLegendWidth(width)),
        onJumpToHistory: (idx: number) => dispatch(UndoActionCreators.jumpToPast(idx)),
    }
}

const Nav = connect(mapStateToProps, mapDispatchToProps)(_Nav);

export default Nav;
