import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { connect } from "react-redux";
import AppState, { ActionCreators } from "../../AppState";
import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import { StateWithHistory } from 'redux-undo';

import "./HighlightMenu.css";
import OpenInterval from "model/interval/OpenInterval";
import ColorPicker from "components/ColorPicker";
import ReactModal from "react-modal";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import {
    CardHeader,
    Grid,
    CardActions,
    Tooltip,
    IconButton,
    CardContent,
} from "@material-ui/core";
import {
    Delete as DeleteIcon,
    Visibility as ActiveIcon,
    VisibilityOff as InactiveIcon,
    ChevronRight as JumpIcon,
    Edit as EditIcon
} from '@material-ui/icons'

/**
 * HighlightMenu and HighlightItem
 * @author Vincent Xu
 */

/**
 * Gets props to pass to HighlightMenu.js
 * 
 * @param {Object} state - redux state
 * @return {Object} props to pass to RegionSetSelector
 */
function mapStateToProps(state: { browser: StateWithHistory<AppState> }) {
    return {
        highlightItems: state.browser.present.highlightItems,
        viewRegion: state.browser.present.viewRegion
    };
}

/**
 * Callbacks to pass to HighlightMenu
 */
const callbacks = {
    onSetsChanged: ActionCreators.setHighlights,
    onNewRegion: ActionCreators.setViewRegion
};

interface HighlightMenuProps {
    highlightItems: IHighlightItem[];
    viewRegion: DisplayedRegionModel;
    showHighlightMenuModal: boolean;
    onOpenHighlightMenuModal: any;
    onCloseHighlightMenuModal: any;
    setEnteredRegion: Function;
    onNewRegion: Function;
};

/**
 * Menu for managing multiple highlights created on TrackContainer
 */
export class HighlightMenu extends React.Component<HighlightMenuProps> {
    constructor(props: HighlightMenuProps) {
        super(props);
        this.state = {

        };

        this.updateActive = this.updateActive.bind(this);
        this.updateName = this.updateName.bind(this);
        this.updateColor = this.updateColor.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleViewRegionJump = this.handleViewRegionJump.bind(this);
    }

    updateActive(highlightNumber: number): void {
        this.props.setEnteredRegion(null);
        this.props.highlightItems[highlightNumber].active = !this.props.highlightItems[highlightNumber].active;
        this.forceUpdate();
    }

    updateName(highlightNumber: number, newName: string): void {
        this.props.highlightItems[highlightNumber].highlightName = newName;
        this.forceUpdate();
    }

    updateColor(highlightNumber: number, color: string): void {
        this.props.setEnteredRegion(null);
        this.props.highlightItems[highlightNumber].color = color;
        this.forceUpdate();
    }

    handleDelete(highlightNumber: number): void {
        this.props.setEnteredRegion(null);
        this.props.highlightItems.splice(highlightNumber, 1);
        this.forceUpdate();
    }

    handleViewRegionJump(highlightNumber: number): void {
        this.props.setEnteredRegion(null);
        const interval = this.props.highlightItems[highlightNumber].absoluteInterval;
        this.props.onNewRegion(interval.start, interval.end);
        this.props.onCloseHighlightMenuModal();
    }

    render() {
        const { highlightItems, viewRegion } = this.props;
        console.log(highlightItems);
        const highlightElements = (highlightItems && highlightItems.length !== 0 ? highlightItems.map((item: any, counter: any) => {
            return (
                <Grid item xs={4} key={item.absoluteInterval.toString()}>
                    <HighlightItem
                        active={item.active}
                        color={item.color}
                        highlightNumber={counter}
                        viewRegion={item.viewRegion}
                        highlightName={item.highlightName}
                        absoluteInterval={item.absoluteInterval}
                        windowViewRegion={viewRegion}
                        updateActive={this.updateActive}
                        handleNewName={this.updateName}
                        handleNewColor={this.updateColor}
                        handleDelete={this.handleDelete}
                        handleViewRegionJump={this.handleViewRegionJump}
                    />
                </Grid>
            );
        }) : (
            <div style={{ display: 'grid', placeItems: 'center', height: "32vh", marginTop: 100, color: '#3c4043' }}>
                <img
                    src="https://epigenomegateway.wustl.edu/browser/favicon-144.png"
                    alt="Browser Icon"
                    style={{ height: 125, width: "auto", marginLeft: 20, marginRight: 20 }}
                />
                <Typography variant="h4">
                    No highlights
                </Typography>
                <Typography variant="h5" style={{ width: '50vh', textAlign: 'center' }}>
                    Select a region with the highlight tool and it will show up here.
                </Typography>
            </div>
        ));

        return (
            <React.Fragment>
                <button
                    onClick={this.props.onOpenHighlightMenuModal}
                    title="Highlight Menu {Alt+U)"
                    className="btn btn-light"
                >
                    <span role="img" aria-label="reorder">
                        🗒️
                    </span>
                </button>
                <ReactModal
                    isOpen={this.props.showHighlightMenuModal}
                    contentLabel="HighlightMenu"
                    ariaHideApp={false}
                    onRequestClose={this.props.onCloseHighlightMenuModal}
                    shouldCloseOnOverlayClick={true}
                    style={{
                        overlay: {
                            backgroundColor: "rgba(111,107,101,0.3)",
                            zIndex: 4,
                        },
                    }}
                >
                    <div className="HighlightMenu">
                        <Typography variant="h5" style={{ margin: 15 }}>
                            Highlights
                        </Typography>
                        <Grid container spacing={2} justifyContent="center">
                            {highlightElements}
                        </Grid>
                        <span
                            className="text-right"
                            style={{
                                cursor: "pointer",
                                color: "red",
                                fontSize: "2em",
                                position: "absolute",
                                top: "-5px",
                                right: "15px",
                                zIndex: 2,
                            }}
                            onClick={this.props.onCloseHighlightMenuModal}
                        >
                            ×
                        </span>
                    </div>
                </ReactModal>
            </React.Fragment>
        )
    }
}

export default connect(mapStateToProps, callbacks)(HighlightMenu);

export interface IHighlightItem {
    active?: boolean;
    color?: string;
    highlightNumber?: number;
    highlightName?: string;
    highlightInterval?: OpenInterval;
    viewRegion?: string;
    windowViewRegion?: DisplayedRegionModel;
    absoluteInterval?: OpenInterval;
    updateActive?: Function;
    handleNewName?: Function;
    handleNewColor?: Function;
    handleDelete?: Function;
    handleViewRegionJump?: Function;
}

export class HighlightItem extends React.Component<IHighlightItem, any> {

    constructor(props: IHighlightItem) {
        super(props);

        this.state = {
            color: this.props.color,
            editing: false
        }

        this.handleStateColor = this.handleStateColor.bind(this);
    }

    handleStateColor(color: string) {
        this.setState({ color: color });
    }

    render(): JSX.Element {
        const { active, viewRegion, highlightName, highlightNumber, windowViewRegion, absoluteInterval, updateActive, handleNewName, handleNewColor, handleDelete, handleViewRegionJump } = this.props;

        // update this color
        const windowAbsInterval = windowViewRegion.getContextCoordinates();
        // logic gives 5px of slack
        const inViewRegion = (absoluteInterval.start + 5 > windowAbsInterval.start && absoluteInterval.end - 5 < windowAbsInterval.end);
        const isInRegionColor = (inViewRegion ? '#009F6B' : '#C40233');
        // @ts-ignore
        const titleStr = viewRegion;

        return (
            <Card style={{ borderRadius: 30, overflow: 'visible' }}>
                <CardHeader
                    action={
                        <Tooltip title="Edit Name">
                            <IconButton
                                onClick={() => {
                                    let input = prompt("Please enter a new name");
                                    input && handleNewName(highlightNumber, input);
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                    }
                    title={highlightName}
                    style={{
                        backgroundColor: isInRegionColor,
                        paddingLeft: 25,
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                    }}
                />
                <CardContent>
                    {/* "is in view region" indicator */}
                    <Typography
                        variant="h5"
                    >
                        {titleStr}
                    </Typography>
                    {/* left to right: color picker, delete, hide+show, jump-to-view-region */}
                    <div className="highlight-item-buttons-group">
                        <ColorPicker
                            color={this.state.color}
                            onChange={(evt: any) => {
                                handleNewColor(highlightNumber, `rgba(${evt.rgb.r}, ${evt.rgb.g}, ${evt.rgb.b}, 0.3)`);
                                this.handleStateColor(`rgba(${evt.rgb.r}, ${evt.rgb.g}, ${evt.rgb.b}, 0.3)`);
                            }}
                        />
                    </div>
                </CardContent>
                <CardActions>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => { handleDelete(this.props.highlightNumber) }}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Active">
                        <IconButton onClick={() => { updateActive(highlightNumber) }}>
                            {active ? <ActiveIcon /> : <InactiveIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Jump to Highlight">
                        <IconButton onClick={() => { handleViewRegionJump(this.props.highlightNumber) }}>
                            <JumpIcon />
                        </IconButton>
                    </Tooltip>
                </CardActions>
            </Card>
        )
    }
}