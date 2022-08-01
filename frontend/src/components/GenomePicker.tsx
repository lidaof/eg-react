import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import SearchIcon from "@material-ui/icons/Search";
import {
    CardMedia,
    Container,
    ListItem,
    ListItemText,
    ListItemIcon,
    List,
    AppBar,
    Toolbar,
    TextField,
    makeStyles,
    withStyles,
    InputAdornment,
    CardActionArea,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Box from "@material-ui/core/Box";
import Link from "@material-ui/core/Link";
import SwipeableViews from "react-swipeable-views";
import { ActionCreators } from "../AppState";
import { treeOfLife, phasedTreeOfLife, } from "../model/genomes/allGenomes";
import { SessionUI } from "./SessionUI";
import DarkMode from "./DarkMode";
import Logo from '../images/logo.png'
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion/dist/framer-motion';

import "./GenomePicker.css";
import { Brightness2 } from "@material-ui/icons";
import _ from "lodash";
import { style } from "d3-selection";
import { getGenomeContainerTitle } from "./containerView/containerUtils";

/**
 * loading page for choose genome
 * @author Daofeng Li
 * @author Shane Liu
 */

const callbacks = {
    onGenomeSelected: ActionCreators.setGenome,
    onMultipleGenomeSelected: ActionCreators.setMultipleGenomes,
    onMultipleGenomesWithContainerSelected: ActionCreators.setMultipleGenomesWithContainer,
};

const LinkWithMargin = withStyles({
    root: {
        margin: "10px",
    },
})(Link);

interface TabPanelProps {
    children: React.ReactNode;
    index: number;
    value: any;
    [key: string]: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            style={{ overflow: "hidden" }}
            {...other}
        >
            {value === index && <Box>{children}</Box>}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        "aria-controls": `full-width-tabpanel-${index}`,
    };
}

function NoResults() {
    return (
        <div style={{ display: 'grid', placeItems: 'center', height: "32vh", marginTop: 100, width: "100%" }}>
            <img
                src="https://epigenomegateway.wustl.edu/browser/favicon-144.png"
                alt="Browser Icon"
                style={{ height: 125, width: "auto", marginLeft: 20, marginRight: 20 }}
            />
            <Typography variant="h4">
                No results
            </Typography>
            <Typography variant="h5" style={{ width: '50vh', textAlign: 'center' }}>
                Search for a genome by species or assembly name and it will show up here.
            </Typography>
        </div>
    )
}

interface GenomePickerProps {
    onGenomeSelected: (name: string) => void;
    onMultipleGenomeSelected: (names: string[]) => void;
    title?: string;
}

export function GenomePicker(props: GenomePickerProps) {
    const [searchText, setSearchText] = useState<string>("");
    const [shiftHeld, setShiftHeld] = useState<boolean>(false);
    const [genomesSelected, setGenomesSelected] = useState<{ [key: string]: boolean }>({});
    const debouncedSetSearchText = useCallback(_.debounce(setSearchText, 250), []);

    const downHandler = ({ key }: { key: string }) => {
        if (key === 'Shift') { return setShiftHeld(true); }
        if (key === 'Escape') {
            setGenomesSelected({});
        }
    };

    const upHandler = ({ key }: { key: string }) => {
        if (key === 'Shift') {
            if (Object.values(genomesSelected).filter(e => e).length) {
                props.onMultipleGenomeSelected(Object.entries(genomesSelected)
                    .filter(([, v]) => v)
                    .map(([k]) => k));
            } else {
                setShiftHeld(false);
            }
        }
    };

    const focusHandler = () => {
        setShiftHeld(false);
    };

    useEffect(() => {
        window.addEventListener('keydown', downHandler);
        window.addEventListener('keyup', upHandler);
        window.addEventListener('focus', focusHandler);
        return () => {
            window.removeEventListener('keydown', downHandler);
            window.removeEventListener('keyup', upHandler);
            window.removeEventListener('focus', focusHandler);
        };
    }, [genomesSelected]);

    const handleGenomePicked = (genomeName: string) => {
        if (shiftHeld) {
            setGenomesSelected({ ...genomesSelected, [genomeName]: !genomesSelected[genomeName] });
        } else {
            props.onGenomeSelected(genomeName)
        }
    }

    const renderTreeCards = () => {
        return (
            Object.entries(treeOfLife)
                .filter(([species2, details]) => {
                    return (
                        species2.toLowerCase().includes(searchText.toLowerCase()) ||
                        details.assemblies.join("").toLowerCase().includes(searchText.toLowerCase())
                    );
                })
                .map(([species2, details], idx) => {
                    let filteredAssemblies = details.assemblies;
                    if (!species2.toLowerCase().includes(searchText.toLowerCase())) {
                        filteredAssemblies = details.assemblies.filter((e) =>
                            e.toLowerCase().includes(searchText.toLowerCase())
                        );
                    }
                    return (
                        // @ts-ignore
                        <Grid
                            item
                            xs={12}
                            md={4}
                            align="center"
                            key={species2}
                            component={motion.div}
                            layout
                            animate={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                height: 270,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <GenomePickerCard
                                species={species2}
                                details={{ logoUrl: details.logoUrl, assemblies: filteredAssemblies }}
                                selected={genomesSelected}
                                onChoose={handleGenomePicked}
                            />
                        </Grid>
                    )
                })
        );
    };

    let metaText = "";
    if (shiftHeld) {
        const keyLength = Object.values(genomesSelected).filter(e => e).length;
        if (keyLength) {
            metaText = `Release to select ${keyLength} genomes, or esc to cancel`;
        } else {
            metaText = "Click on multiple genomes to select";
        }
    } else {
        metaText = "Hold shift to select multiple";
    }

    const treeCards = renderTreeCards();

    return (
        <Container maxWidth="md">
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" style={{ margin: "25px", marginLeft: 0, marginBottom: 0 }}>
                        {props.title || "Select a genome"}
                    </Typography>
                    <Typography variant="body1" style={{ margin: 3 }}>
                        {metaText}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        id="outlined-margin-normal"
                        placeholder="Search for a genome..."
                        margin="normal"
                        variant="outlined"
                        style={{ width: "100%", paddingRight: "16px" }}
                        className="searchFieldRounded"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        onChange={(e) => debouncedSetSearchText(e.target.value)}
                    />
                </Grid>
            </Grid>
            <Grid
                container
                spacing={2}
                component={motion.div}
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                layout
            >
                <AnimatePresence>
                    {treeCards.length ? treeCards : <NoResults />}
                </AnimatePresence>
            </Grid>
        </Container>
    )
}

interface PhasedGenomePickerProps {
    onSetMultipleGenomesWithContainer: (containers: string[][]) => void;
    onSetMultipleGenomes: (genomes: string[]) => void;
}

function PhasedGenomePicker(props: PhasedGenomePickerProps) {
    const [searchText, setSearchText] = useState<string>("");
    const debouncedSetSearchText = useCallback(_.debounce(setSearchText, 250), []);

    const handleGenomePicked = (genomeName: string, assemblyIdx: number) => {
        // TODO: allow the user to click a specific assembly group in the phased genome picker card
        props.onSetMultipleGenomesWithContainer([phasedTreeOfLife[genomeName].groupedAssemblies[assemblyIdx]]);
    }

    const renderTreeCards = () => {
        return Object.entries(phasedTreeOfLife)
            .filter(([species2, details]) => {
                return (
                    species2.toLowerCase().includes(searchText.toLowerCase()) ||
                    details.groupedAssemblies.toString().toLowerCase().includes(searchText.toLowerCase())
                );
            })
            .map(([species2, details], idx) => {
                const { groupedAssemblies } = details;
                const assemblyStrs = groupedAssemblies.map((e) => getGenomeContainerTitle(e));
                return (
                    // @ts-ignore
                    <Grid
                        item
                        xs={12}
                        md={4}
                        align="center"
                        key={species2}
                        component={motion.div}
                        layout
                        animate={{ opacity: 1 }}
                        initial={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            height: 270,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <PhasedGenomeCard
                            species={species2}
                            details={{ logoUrl: details.logoUrl, assemblies: assemblyStrs }}
                            onChoose={handleGenomePicked}
                        />
                    </Grid>
                );
            });
    };

    const treeCards = renderTreeCards();

    return (
        <Container maxWidth="md">
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" style={{ margin: "25px", marginLeft: 0, marginBottom: 0 }}>
                        {"Select a phased genome"}
                    </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                    <TextField
                        id="outlined-margin-normal"
                        placeholder="Search for a genome..."
                        margin="normal"
                        variant="outlined"
                        style={{ width: "100%", paddingRight: "16px" }}
                        className="searchFieldRounded"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        onChange={(e) => debouncedSetSearchText(e.target.value)}
                    />
                </Grid>
            </Grid>
            <Grid
                container
                spacing={2}
                component={motion.div}
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                layout
            >
                <AnimatePresence>
                    {treeCards.length ? treeCards : <NoResults />}
                </AnimatePresence>
            </Grid>
        </Container>
    )
}

interface GenomePickerContainerProps {
    onGenomeSelected?: (name: string) => void;
    onMultipleGenomeSelected?: (names: string[]) => void;
    onMultipleGenomesWithContainerSelected?: (containers: string[][]) => void;
    title?: string;
}

function GenomePickerContainer(props: GenomePickerContainerProps) {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (event: ChangeEvent<{}>, newValue: any) => {
        setValue(newValue);
    };

    const handleChangeIndex = (index: number) => {
        setValue(index);
    };

    return (
        <div style={{ marginBottom: 50 }}>
            <AppBar position="static" color="default" >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    aria-label="genome picker"
                >
                    <Tab style={{ outline: 'none' }} label="Genomes" {...a11yProps(0)} />
                    <Tab style={{ outline: 'none' }} label="Phased Genomes" {...a11yProps(1)} />
                    <Tab style={{ outline: 'none' }} label="Load a session" {...a11yProps(2)} />
                </Tabs>
            </AppBar>
            {/* <SwipeableViews
                axis={theme.direction === "rtl" ? "x-reverse" : "x"}
                index={value}
                onChangeIndex={handleChangeIndex}
                animateTransitions={false}
            > */}
            <AnimatePresence exitBeforeEnter>
                <motion.div
                    key={value}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <TabPanel value={value} index={0} dir={theme.direction}>
                        <GenomePicker onGenomeSelected={props.onGenomeSelected} onMultipleGenomeSelected={props.onMultipleGenomeSelected} />
                    </TabPanel>
                    <TabPanel value={value} index={1} dir={theme.direction}>
                        <PhasedGenomePicker
                            onSetMultipleGenomesWithContainer={props.onMultipleGenomesWithContainerSelected}
                            onSetMultipleGenomes={props.onMultipleGenomeSelected}
                        />
                    </TabPanel>
                    <TabPanel value={value} index={2} dir={theme.direction}>
                        {!process.env.REACT_APP_NO_FIREBASE ? (
                            // @ts-ignore
                            <SessionUI bundleId={props.bundleId} withGenomePicker={true} />
                        ) : (
                            <p>Session function is only working with Firebase configuration.</p>
                        )}
                    </TabPanel>
                </motion.div>
            </AnimatePresence>
            {/* <TabPanel value={value} index */}
            {/* </SwipeableViews> */}
        </div>
    );
}

export function AppIcon({ withText = true }) {
    return (
        <>
            <Typography variant="h5" noWrap style={{ color: "var(--neutral-font-color)" }}>
                <img
                    src={Logo}
                    alt="Browser Icon"
                    style={{ height: 36, width: "auto", marginRight: 10, }}
                />
                {withText && <>WashU <span style={{ fontWeight: 100 }}>Epigenome Browser</span></>}
            </Typography>
        </>
    );
}

function AppHeader() {
    const styles = useStyles();
    return (
        <div>
            <AppBar color="transparent" position="static">
                <Toolbar disableGutters>
                    <AppIcon />
                    <div className={styles.alignRight}>
                        <span>
                            <DarkMode />
                        </span>
                        <LinkWithMargin
                            href="https://epigenomegateway.readthedocs.io/en/latest/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Documentation
                        </LinkWithMargin>
                        <LinkWithMargin
                            href="https://epigenomegateway.wustl.edu/legacy/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Switch to the 'old' browser
                        </LinkWithMargin>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}

interface PhasedGenomeCardProps {
    species: string;
    details: { logoUrl: string; assemblies: string[] };
    onChoose: (species: string, assemblyIdx: number) => void;
}

function PhasedGenomeCard(props: PhasedGenomeCardProps) {
    const styles = useStyles();
    const { species, details, onChoose } = props;
    const { logoUrl, assemblies } = details;

    const renderAssemblies = () => {
        return assemblies.map((assembly, idx) => {
            return (
                <ListItem
                    key={idx}
                    button
                    onClick={() => onChoose(species, idx)}
                    style={{
                        backgroundColor: "var(--bg-color)",
                        borderRadius: 7
                    }}
                >
                    <ListItemIcon className={styles.icon}>
                        <ChevronRightIcon />
                    </ListItemIcon>
                    <ListItemText primary={assembly} />
                </ListItem>
            );
        });
    };

    return (
        <Card className={styles.card}>
            <CardMedia image={logoUrl} title={species} className={styles.media} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2" className={styles.cardTitle}>
                    {species}
                </Typography>
                <List className={styles.vertScroll}>{renderAssemblies()}</List>
            </CardContent>
        </Card>
    );
}

interface GenomePickerCardProps {
    species: string;
    details: { logoUrl: string; assemblies: string[] };
    selected: { [key: string]: boolean };
    onChoose: (genomeName: string) => void;
}

function GenomePickerCard(props: GenomePickerCardProps) {
    const styles = useStyles();
    const { species, selected, details, onChoose } = props;
    const { logoUrl, assemblies } = details;



    const renderAssemblies = () => {
        return assemblies.map((assembly, idx) => {
            const isSelected = !!selected[assembly];
            return (
                <ListItem
                    key={idx}
                    button
                    onClick={() => onChoose(assembly)}
                    style={{
                        height: 25,
                        // adjust the brightness depending on if it's dark or light mode
                        backgroundColor: isSelected ? "silver" : null,
                        borderRadius: 7
                    }}
                >
                    <ListItemIcon className={styles.icon}>
                        <ChevronRightIcon />
                    </ListItemIcon>
                    <ListItemText primary={assembly} />
                </ListItem>
            );
        });
    };

    return (
        <Card className={styles.card}>
            <CardMedia image={logoUrl} title={species} className={styles.media} />
            <CardContent>
                <Typography gutterBottom variant="h5" component="h2" className={styles.cardTitle}>
                    {species}
                </Typography>
                <List className={styles.vertScroll}>{renderAssemblies()}</List>
            </CardContent>
        </Card>
    );
}

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
    media: {
        height: 60,
        borderRadius: "10px",
    },
    cardTitle: {
        textTransform: "capitalize",
        textAlign: "left",
    },
    card: {
        borderRadius: "10px",
        height: "100%",
        width: "270px",
        backgroundColor: "var(--bg-color)", //matches the background color of the card to the page
        color: "var(--font-color)",
    },
    alignRight: {
        marginRight: 15,
        marginLeft: "auto",
    },
    vertScroll: {
        maxHeight: "200px",
        overflowY: "auto",
    },
    icon: {
        color: "var(--font-color)",
    }
});

GenomePickerContainer.propTypes = {
    onGenomeSelected: PropTypes.func, // Called on genome selection.  Sigature: (genomeName: string): void
    onSetMultipleGenomesWithContainer: PropTypes.func,
    bundleId: PropTypes.string,
};

// @ts-ignore
export default connect(null, callbacks)(GenomePickerContainer);