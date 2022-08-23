import React, { useState } from 'react';
import {
    Typography,
    IconButton,
    Grid,
    Menu,
    Tooltip
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
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<any>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
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
                                genomeConfig={genomeConfig}
                                navContext={viewRegion.getNavigationContext()}
                                onRegionSelected={onRegionSelected}
                                handleCloseModal={handleClose}
                                onToggleHighlight={() => 0}
                                onSetEnteredRegion={() => 0}
                            />
                            {!virusBrowserMode && (
                                <>
                                    <Typography variant="body1">SNP Search</Typography>
                                    <SnpSearchBox
                                        navContext={viewRegion.getNavigationContext()}
                                        onRegionSelected={onRegionSelected}
                                        handleCloseModal={handleClose}
                                        onToggleHighlight={() => 0}
                                        onSetEnteredRegion={() => 0}        
                                    />
                                </>  
                            )}
                            <Typography variant="body1">Region Search</Typography>
                            
                        </div>
                    </Menu>
                </Grid>
            </Grid>
        </>
    );
}

export default TrackRegionController;