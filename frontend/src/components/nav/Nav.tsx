import AppState, { ActionCreators } from 'AppState';
import React, { useEffect, useState } from 'react';
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

const BASE_TITLE = "WashU Epigenome Browser";

interface NavProps {
    virusBrowserMode: boolean;
    containerTitles: string[] | null;
    pickingGenome: boolean;
    onGenomeSelected?: (genome: string) => void;
}

function _Nav(props: NavProps) {
    const {
        virusBrowserMode,
        containerTitles,
        pickingGenome,
        onGenomeSelected
    } = props;
    // const theme = useTheme();
    // const smallscreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [title, setTitle] = useState<string>("WashU Epigenome Browser");

    // change the title whenever containertitles changes using getgenomecontainertitle
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
                                    <Apps />
                                    <Help />
                                    <Settings />
                                    <Share />
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

const mapStateToProps = (state: AppState) => {
    return {

    }
};

const callbacks = {
    onGenomeSelected: ActionCreators.setGenome,
}

const Nav = connect(mapStateToProps, callbacks)(_Nav);

export default Nav;
