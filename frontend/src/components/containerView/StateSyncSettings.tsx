import React, { useEffect, useState } from 'react';
import { Dispatch, Action } from 'redux';
import { connect } from 'react-redux';
import { ContainerActionsCreatorsFactory, GenomeSettings, GenomeState } from 'AppState';

import { Settings } from '@material-ui/icons';
import {
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useMediaQuery,
    useTheme,
    Grow,
    Typography,
    FormControlLabel,
    Checkbox,
    FormGroup,
    FormHelperText,
    TextField,
    FormControl,
    FormLabel,
    Radio,
    RadioGroup,
    InputLabel,
    Select,
    MenuItem,
} from '@material-ui/core';

interface StateSyncSettingsProps {
    containerIdx: number;
    genomeIdx: number;
    genomeSettings: GenomeSettings;
    containerTitles: string[];
    allowNewContainer: boolean;

    // redux actions, set as optional because typescript isn't ommitting them from the connected component
    onGenomeSettingsChanged?: (newSettings: any, genomeIdx: number) => void;
    onSetGenomeContainer?: (genomeIdx: number, newContainerIdx: number) => void;
    onNewContainer?: (genomeIdx: number) => void,
}

function _StateSyncSettings(props: StateSyncSettingsProps) {
    const {
        containerTitles,
        containerIdx,
        genomeSettings,
        genomeIdx,
        allowNewContainer,
        onGenomeSettingsChanged,
        onSetGenomeContainer,
        onNewContainer,
    } = props;
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const setGenomeSettings = (newSettings: any) => onGenomeSettingsChanged(newSettings, props.genomeIdx);

    const { syncHighlights, offsetAmount, } = genomeSettings;
    const [offsetValue, setOffsetValue] = useState<string>(offsetAmount.toString());
    const menuItemStyle = { marginTop: 20 };

    useEffect(() => {
        setOffsetValue(offsetAmount.toString());
    }, [open])

    const getOffsetTipMessage = () => {
        let m = "Navigation position, highlights, and other synced attributes will be offset ";
        if (Math.sign(offsetAmount) === 1) {
            m += "forward ";
        } else {
            m += "backward ";
        }
        m += "by " + Math.abs(offsetAmount) + " units on this genome.";
        return m;
    }

    return (
        <div>
            <IconButton onClick={handleOpen}>
                <Settings />
            </IconButton>
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Grow}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        borderRadius: "30px",
                        height: "75%",
                    }
                }}
            >
                <DialogTitle>
                    <Typography variant="h5" style={{ margin: "15px", marginBottom: 0 }}>
                        Genome Settings
                    </Typography>
                </DialogTitle>
                <DialogContent style={{ marginLeft: "15px" }}>
                    <Typography variant="h6">
                        Sync
                    </Typography>
                    <FormControlLabel
                        label="Sync highlights to parent container"
                        control={
                            <Checkbox
                                color="primary"
                                checked={syncHighlights}
                                onChange={(e) => setGenomeSettings({ ...genomeSettings, syncHighlights: e.target.checked })}
                            />
                        }
                    />
                    <FormHelperText>{syncHighlights ? "Highlights will be synced across genomes in this container" : "Highlights will be independent across genomes in this container"}</FormHelperText>
                    <TextField
                        label="Offset Amount"
                        variant="outlined"
                        value={offsetValue}
                        type="number"
                        onChange={(e) => {
                            // TODO: only update offsetAmount on blur
                            setOffsetValue(e.target.value);
                            let v = parseInt(e.target.value);
                            if (isNaN(v)) { v = 0 };
                            setGenomeSettings({ ...genomeSettings, offsetAmount: v })
                        }}
                        style={menuItemStyle}
                    />
                    <div style={menuItemStyle}>
                        <FormHelperText>{getOffsetTipMessage()}</FormHelperText>
                    </div>
                    <Typography variant="h6">
                        Move to another container
                    </Typography>
                    <FormControl style={{ width: "200px" }}>
                        <InputLabel>Container</InputLabel>
                        <Select
                            value={containerIdx}
                            label="Container"
                            onChange={(e) => {
                                setOpen(false);
                                e.target.value !== -1 && onSetGenomeContainer(props.genomeIdx, e.target.value as number);
                            }}
                        >
                            {containerTitles.map((title, idx) => {
                                return <MenuItem key={idx} value={idx}>{title}</MenuItem>
                            })}
                            {allowNewContainer && (
                                <MenuItem value={-1} onClick={() => onNewContainer(props.genomeIdx)}>New Container</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

const mapDispatchToPropsFactory = (dispatch: Dispatch<Action>, ownProps: StateSyncSettingsProps) => {
    const specializedActionCreators = ContainerActionsCreatorsFactory(ownProps.containerIdx);
    return {
        onGenomeSettingsChanged: (newSettings: any, genomeIdx: number) => dispatch(specializedActionCreators.setGenomeSettings(newSettings, genomeIdx)),
        onSetGenomeContainer: (genomeIdx: number, newContainerIdx: number) => dispatch(specializedActionCreators.setGenomeContainer(genomeIdx, newContainerIdx)),
        onNewContainer: (genomeIdx: number) => dispatch(specializedActionCreators.createNewContainer(genomeIdx)),
    }
}

const StateSyncSettings = connect(null, mapDispatchToPropsFactory)(_StateSyncSettings);

export default StateSyncSettings;