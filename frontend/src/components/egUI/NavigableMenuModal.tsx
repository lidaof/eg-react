import React, { useEffect, useRef, useState } from "react";
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
import AppState, { ActionCreators, GenomeState, SyncedContainer } from "AppState";
import { connect } from "react-redux";
import { ChevronLeft, SwapVert } from "@material-ui/icons";
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion/dist/framer-motion';

const scrollToTop = (ref: any) => ref.current && ref.current.scrollTo(0, 0);

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
    const [screens, setScreens] = useState<React.ReactElement<any>[]>([]);
    const [titles, setTitles] = useState<string[]>([]);
    const contentRef = useRef<HTMLDivElement>(null);
    const menuOpen = Boolean(anchorEl);
    const resetScroll = () => scrollToTop(contentRef);

    useEffect(() => {
        resetScroll();
    }, [screens.length])

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

    const navigateToScreen = (component: React.ReactElement<any>, newTitle: string) => {
        setScreens([...screens, component]);
        setTitles([...titles, newTitle]);
    };
    
    const canGoBack = screens.length > 0;
    const goBack = () => {
        if (canGoBack) {
            setScreens(screens.slice(0, -1));
            setTitles(titles.slice(0, -1));
        }
    };

    let injectedProps: any = {};
    const navigableChildren = React.Children.map(children, (child: React.ReactNode) => {
        if (React.isValidElement(child)) {
            injectedProps = child.props;
            return React.cloneElement(child as React.ReactElement<any>, {
                navigateToScreen,
            });
        }
        return child;
    });

    const modalTitleDisplay = titles.length > 0 ? titles[titles.length - 1] : title;
    const lastTitle = titles.length > 1 ? titles[titles.length - 2] : title;
    // const modalChildrenDisplay = screens.length > 0 ? screens[screens.length - 1] : navigableChildren;
    let modalChildrenDisplay;
    if (screens.length > 0) {
        modalChildrenDisplay = React.cloneElement(screens[screens.length - 1], injectedProps);
    } else {
        modalChildrenDisplay = navigableChildren;
    }

    return (
        <>
            <MenuItem onClick={handleOpen}>{title}</MenuItem>
            <Dialog
                open={open}
                onClose={handleClose}
                TransitionComponent={Grow}
                fullWidth
                maxWidth="xl"
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
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <AnimatePresence exitBeforeEnter initial={false}>
                                {canGoBack && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.3, spring: 0, ease: "circOut" }}
                                        onClick={goBack}
                                        style={{
                                            color: "#0191FF",
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            marginTop: '15px',
                                            marginRight: '15px'
                                        }}>
                                        <ChevronLeft />
                                        <span style={{ fontSize: 14 }}>{lastTitle}</span>
                                    </motion.div>
                                )}
                                <motion.div
                                    key={canGoBack}
                                    custom={canGoBack}
                                    initial="titleInitial"
                                    animate="titleAnimate"
                                    exit="titleExit"
                                    variants={{
                                        titleInitial: (canGoBack: boolean) => ({
                                            opacity: 0,
                                            x: canGoBack ? 0 : 50,
                                        }),
                                        titleAnimate: {
                                            opacity: 1,
                                            x: 0,
                                        },
                                        titleExit: {
                                            opacity: 0,
                                            x: canGoBack ? -50 : 50,
                                        },
                                    }}
                                    transition={{ duration: 0.3, spring: 0, ease: "circOut" }}
                                >
                                    <Typography variant="h5" style={{
                                        margin: "15px",
                                        marginBottom: 0
                                    }}>
                                        {modalTitleDisplay}
                                    </Typography>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {(genomeDependent && !canGoBack && editTargets.length > 1) && (
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
                <DialogContent ref={contentRef} style={{ marginLeft: "15px" }} key={genomeDependent && "" + editTarget[0] + editTarget[1]}>
                    <AnimatePresence exitBeforeEnter>
                        <motion.div
                            transition={{ duration: 0.3, bounce: 0, ease: "circOut" }}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            key={screens.length}
                        >
                            {modalChildrenDisplay}
                        </motion.div>
                    </AnimatePresence>
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