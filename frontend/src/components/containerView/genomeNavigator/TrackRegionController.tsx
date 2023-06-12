import React, { useState } from 'react';
import {
    Typography,
    IconButton,
    Grid,
    Menu,
} from '@material-ui/core';
import {
    Search as SearchIcon
} from '@material-ui/icons';
import DisplayedRegionModel from 'model/DisplayedRegionModel';
import GeneSearchBox from "./GeneSearchBox";
import SnpSearchBox from "./SnpSearchBox";
import { GenomeConfig } from 'model/genomes/GenomeConfig';


interface TrackRegionControllerProps {
    viewRegion: DisplayedRegionModel;
    genomeConfig: GenomeConfig;
    onRegionSelected: Function;
    virusBrowserMode: boolean;
}

function TrackRegionController(props: TrackRegionControllerProps) {
    const {
        viewRegion,
        genomeConfig,
        onRegionSelected,
        virusBrowserMode,
    } = props;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [coordinate, setCoordinate] = useState<string>("");
    const [badInputMessage, setBadInputMessage] = useState<string>("");
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<any>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const handleParseRegion = () => {
        let parsedRegion = null;
        const navContext = viewRegion.getNavigationContext();

        try {
            parsedRegion = navContext.parse(coordinate);
        } catch (error) {
            if (error instanceof RangeError) {
                setBadInputMessage(error.message);
                return;
            } else {
                throw error;
            }
        }

        if (badInputMessage) {
            setBadInputMessage("");
        }

        onRegionSelected(parsedRegion.start, parsedRegion.end);
        // onSetEnteredRegion(navContext.getLociInInterval(parsedRegion.start, parsedRegion.end)[0]);
        setAnchorEl(null);
    }

    const coordinateText = viewRegion.currentRegionAsString();
    return (
        <>
            <Grid container direction="row" alignItems="center">
                <Grid item>
                    <Typography variant="body1">{coordinateText}</Typography>
                </Grid>
                <Grid item>
                    <IconButton onClick={handleClick}>
                        <SearchIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        getContentAnchorEl={null}
                        open={open}
                        onClose={handleClose}
                        PaperProps={{
                            style: {
                                borderRadius: 16,
                                overflow: 'visible'
                            }
                        }}
                    >
                        <div style={{ margin: 12, width: 350 }}>
                            <Typography variant="body1">Gene Search</Typography>
                            <GeneSearchBox
                                navContext={viewRegion.getNavigationContext()}
                                onRegionSelected={onRegionSelected}
                                genomeConfig={genomeConfig}
                                handleCloseModal={handleClose}
                            />
                             {!virusBrowserMode && (
                                <>
                                    <Typography variant="body1">SNP Search</Typography>
                                    <SnpSearchBox
                                        // @ts-ignore
                                        navContext={viewRegion.getNavigationContext()}
                                        // @ts-ignore
                                        onRegionSelected={onRegionSelected}
                                        // @ts-ignore
                                        handleCloseModal={handleClose}
                                    />
                                </>
                            )}
                            <Typography variant="body1">Region Search</Typography>
                            <div style={{ display: "flex", flexDirection: "column", }}>
                                <div>
                                    <input
                                        type="text"
                                        size={30}
                                        placeholder="Coordinate"
                                        onChange={e => setCoordinate(e.target.value)}
                                        onKeyDown={e => { if (e.key === "Enter") handleParseRegion() }}
                                    />
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        style={{ marginLeft: "2px" }}
                                        onClick={handleParseRegion}
                                    >
                                        Go
                                    </button>
                                </div>
                                <div>
                                    {badInputMessage.length > 0 && (
                                        <span className="alert-danger">{badInputMessage}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Menu>
                </Grid>
            </Grid>
        </>
    );
}

export default TrackRegionController;