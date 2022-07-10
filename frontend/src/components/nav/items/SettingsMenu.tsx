import Button from "components/egUI/Button";
import React, { useCallback, useState } from "react";
import { ListItemIcon, Menu, MenuItem } from "@material-ui/core";
import {
    CheckBox as CheckBoxIcon,
    CheckBoxOutlineBlank as CheckBoxBlank
} from "@material-ui/icons";
import { NO_SAVE_SESSION, SESSION_KEY, STORAGE } from "AppState";
import _ from "lodash";

/* 
<div className="element Nav-center">
                        <DropdownOpener extraClassName="btn-info" label="⚙Settings" />
                        <div className="dropdown-menu">
                            <label className="dropdown-item" htmlFor="switchNavigator">
                                <input
                                    id="switchNavigator"
                                    type="checkbox"
                                    checked={isShowingNavigator}
                                    onChange={onToggleNavigator}
                                />
                                <span style={{ marginLeft: "1ch" }}>Show genome-wide navigator</span>
                                <span className="GenomeNavigator-tooltip" role="img" aria-label="genomenavigator">
                                    ❓
                                    <div className="GenomeNavigator-tooltiptext">
                                        <ul style={{ lineHeight: "1.2em", marginBottom: 0 }}>
                                            <li>Left mouse drag: select</li>
                                            <li>Right mouse drag: pan</li>
                                            <li>Mousewheel: zoom</li>
                                        </ul>
                                    </div>
                                </span>
                            </label>
                            <label className="dropdown-item" htmlFor="isHighlightRegion">
                                <input
                                    id="isHighlightRegion"
                                    type="checkbox"
                                    checked={highlightEnteredRegion}
                                    onChange={onToggleHighlight}
                                />
                                <span style={{ marginLeft: "1ch" }}>Highlight entered region</span>
                            </label>
                            <label className="dropdown-item">
                                <ModalMenuItem
                                    itemLabel="Change highlight color"
                                    style={{
                                        content: {
                                            left: "unset",
                                            bottom: "unset",
                                            overflow: "visible",
                                            padding: "5px",
                                            zIndex: 5,
                                        },
                                        overlay: {
                                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                                        },
                                    }}
                                >
                                    <HighlightColorChange color={highlightColor} onChange={onSetHighlightColor} />
                                </ModalMenuItem>
                            </label>
                            {!virusBrowserMode && (
                                <label className="dropdown-item" htmlFor="switchVR">
                                    <input id="switchVR" type="checkbox" checked={isShowingVR} onChange={onToggleVR} />
                                    <span style={{ marginLeft: "1ch" }}>VR mode</span>
                                </label>
                            )}
                            <label className="dropdown-item" htmlFor="cacheToggle">
                                <input
                                    id="cacheToggle"
                                    type="checkbox"
                                    checked={this.state.isCacheEnabled}
                                    onChange={this.toggleCache}
                                />
                                <span style={{ marginLeft: "1ch" }}>Restore current view after Refresh</span>
                            </label>
                            <label className="dropdown-item" htmlFor="setLegendWidth">
                                <input
                                    type="number"
                                    id="legendWidth"
                                    step="5"
                                    min="60"
                                    max="200"
                                    defaultValue={trackLegendWidth}
                                    onChange={this.changeLegendWidth}
                                />
                                <span style={{ marginLeft: "1ch" }}>Change track legend width</span>
                            </label>
                        </div>
                    </div>
*/

interface SettingsProps {
    onToggleNavigator: () => void;
    isShowingNavigator: boolean;
    onToggleVR: () => void;
    isShowingVR: boolean;
    trackLegendWidth: number;
    onLegendWidthChanged: (width: number) => void;
}

function Settings(props: SettingsProps) {
    const {
        onToggleNavigator,
        isShowingNavigator,
        onToggleVR,
        isShowingVR,
        trackLegendWidth,
        onLegendWidthChanged,
    } = props;
    const [isCacheEnabled, setIsCacheEnabled] = useState(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const debouncedChangeLegendWidth = useCallback(_.debounce(onLegendWidthChanged, 250), []);

    const changeLegendWidth = (e: any) => {
        const width = Number.parseFloat(e.currentTarget.value);

        if (width >= 60 && width <= 200) {
            //this.props.onLegendWidthChange(width);
            debouncedChangeLegendWidth(width);
        }
    }

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null);
    }

    const disableCache = () => {
        STORAGE.removeItem(SESSION_KEY);
        STORAGE.setItem(NO_SAVE_SESSION, 1);
    };

    const enableCache = () => {
        STORAGE.removeItem(NO_SAVE_SESSION);
    };

    const toggleCache = () => {
        if (isCacheEnabled) {
            disableCache();
            setIsCacheEnabled(false);
        } else {
            enableCache();
            setIsCacheEnabled(true);
        }
    };

    const getIconFromChecked = (checked: boolean) => checked ? <CheckBoxIcon color="primary" /> : <CheckBoxBlank />;

    return (
        <>
            <Button onClick={handleClick}>Settings</Button>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                getContentAnchorEl={null}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: { borderRadius: 16 }
                }}
            >
                <MenuItem onClick={onToggleNavigator}>
                    <ListItemIcon>
                        {getIconFromChecked(isShowingNavigator)}
                    </ListItemIcon>
                    Show genome-wide navigator
                </MenuItem>
                <MenuItem onClick={onToggleVR}>
                    <ListItemIcon>
                        {getIconFromChecked(isShowingVR)}
                    </ListItemIcon>
                    VR mode
                </MenuItem>
                <MenuItem onClick={toggleCache}>
                    <ListItemIcon>
                        {getIconFromChecked(isCacheEnabled)}
                    </ListItemIcon>
                    Restore current view after Refresh
                </MenuItem>
                <MenuItem
                    
                >
                    <input
                        type="number"
                        id="legendWidth"
                        step="5"
                        min="60"
                        max="200"
                        defaultValue={trackLegendWidth}
                        onChange={changeLegendWidth}
                    />
                    <span style={{ marginLeft: "1ch" }}>Change track legend width</span>
                </MenuItem>
            </Menu>
        </>
    );
}

export default Settings;