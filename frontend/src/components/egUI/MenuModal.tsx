import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grow,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
import { SwapVert } from "@material-ui/icons";
import AppState, { ActionCreators, GenomeState, SyncedContainer } from "AppState";
import React, { useState } from "react";
import { connect } from "react-redux";
// @ts-ignore
import { motion } from 'framer-motion/dist/framer-motion';

interface MenuModalProps {
    children: React.ReactNode;
    title: string;
    closeMenu: () => void;
    genomeDependent?: boolean;

    // Redux props
    editingGenome?: GenomeState;
    editingContainer?: SyncedContainer;
    editTarget?: number[];
    editTargets?: EditTargetItem[];
    onEditTargetChange?: (newTarget: number[]) => void;
}

function _MenuModal(props: MenuModalProps) {
    const {
        children,
        title,
        closeMenu,
        genomeDependent,
        editingGenome,
        editingContainer,
        editTarget,
        editTargets,
    } = props;
    const theme = useTheme();
    const smallscreen = useMediaQuery(theme.breakpoints.down('xs'));
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorEl);

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        closeMenu();
        setOpen(false);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const renderEditTargets = () => editTargets.map((t, idx) => (
        <MenuItem key={idx} onClick={() => {
            if (props.onEditTargetChange) {
                props.onEditTargetChange(t.location);
            }
            handleMenuClose();
        }}
            selected={t.selected}
        >
            {t.title}
        </MenuItem>
    ));
    return (
        <>
            <MenuItem onClick={handleOpen}>{title}</MenuItem>
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Grow}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: !smallscreen ? {
                        borderRadius: "30px",
                        height: "75%",
                    } : {}
                }}
                fullScreen={smallscreen}
            >
                <DialogTitle disableTypography>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexDirection: "row",
                        }}
                    >
                        <Typography variant="h5" style={{ margin: "15px", marginBottom: 0 }}>
                            {title}
                        </Typography>
                        {(genomeDependent && editTargets.length > 1) && (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                }}
                            >
                                <Typography variant="body1" style={{ margin: "15px", marginBottom: 0 }}>
                                    Currently editing {editingGenome.name} in {editingContainer.title}
                                </Typography>
                                <IconButton onClick={handleMenuClick}>
                                    <SwapVert />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                                    getContentAnchorEl={null}
                                    open={menuOpen}
                                    onClose={handleMenuClose}
                                >
                                    {renderEditTargets()}
                                </Menu>
                            </div>
                        )}
                    </div>
                </DialogTitle>
                <DialogContent style={{ marginLeft: "15px" }} key={genomeDependent && "" + editTarget[0] + editTarget[1]}>
                    <motion.div
                        transition={{ duration: 0.3, bounce: 0, ease: "circOut" }}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        key={editTarget}
                    >
                        {children}
                    </motion.div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

interface EditTargetItem {
    title: string;
    location: number[];
    selected: boolean;
}

const mapStateToProps = (_state: { browser: { present: AppState } }, ownProps: MenuModalProps) => {
    if (!ownProps.genomeDependent) return {};
    const state = _state.browser.present;
    const [cidx, gidx] = state.editTarget;

    const editTargets: EditTargetItem[] = [];

    for (let c = 0; c < state.containers.length; c++) {
        for (let g = 0; g < state.containers[c].genomes.length; g++) {
            editTargets.push({
                title: `${state.containers[c].genomes[g].name}`,
                location: [c, g],
                selected: c === cidx && g === gidx,
            });
        }
    }

    return {
        editingGenome: state.containers && state.containers[cidx].genomes[gidx],
        editingContainer: state.containers && state.containers[cidx],
        editTarget: state.editTarget,
        editTargets,
    }
};

const callbacks = {
    onEditTargetChange: ActionCreators.setEditTarget,
}

const MenuModal = connect(
    mapStateToProps,
    callbacks
)(_MenuModal);

export default MenuModal;