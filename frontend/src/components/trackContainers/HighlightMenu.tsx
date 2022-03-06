import React from "react";
import { connect } from "react-redux";
import AppState, { ActionCreators } from "../../AppState";
import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import { StateWithHistory } from 'redux-undo';
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

import "./HighlightMenu.css";

/**
 * HighlightMenu and HighlightItem
 * @author Vincent Xu
 * @author Daofeng Li
 */


interface HighlightMenuProps {
    highlights: HighlightInterval[];
    viewRegion: DisplayedRegionModel;
    showHighlightMenuModal: boolean;
    onOpenHighlightMenuModal: any;
    onCloseHighlightMenuModal: any;
    onSetHighlights: Function;
    onNewRegion: Function;
};

/**
 * Menu for managing multiple highlights created on TrackContainer
 */
export class HighlightMenu extends React.Component<HighlightMenuProps> {
   


    handleViewRegionJump(highlightInterval: HighlightInterval): void {
        const {start, end} = highlightInterval;
        this.props.onNewRegion(start, end);
        this.props.onCloseHighlightMenuModal();
    }

    render() {
        const { highlights, viewRegion } = this.props;
        console.log(highlights)
        const highlightElements = highlights.length? highlights.map((item: HighlightInterval, index: number) => {
            return (
                <Grid item xs={4}>
                    <HighlightItem
                        
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
        );

        return (
            <React.Fragment>
                <button
                    onClick={this.props.onOpenHighlightMenuModal}
                    title="Highlight Menu {Alt+U)"
                    className="btn btn-light"
                >
                    <span role="img" aria-label="highlights">
                        ⚡
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

export class HighlightInterval {
    start: number;
    end: number;
    display: boolean;
    color: string;
    tag: string;
    constructor(start: number, end: number, tag: string='', color: string='rgba(255,255,0, 0.3)') {
        this.start = start;
        this.end = end;
        this.tag = tag;
        this.color = color;
        this.display = true;
    }
}

export class HighlightItem extends React.Component {

    handleStateColor(color: string) {
        this.setState({ color: color });
    }

    render(): JSX.Element {
        return <p>a</p>;
        // const { active, viewRegion, highlightName, highlightNumber, windowViewRegion, absoluteInterval, updateActive, handleNewName, handleNewColor, handleDelete, handleViewRegionJump } = this.props;

        // // update this color
        // const windowAbsInterval = windowViewRegion.getContextCoordinates();
        // // logic gives 5px of slack
        // const inViewRegion = (absoluteInterval.start + 5 > windowAbsInterval.start && absoluteInterval.end - 5 < windowAbsInterval.end);
        // const isInRegionColor = (inViewRegion ? '#009F6B' : '#C40233');
        // // @ts-ignore
        // const titleStr = viewRegion;

        // return (
        //     <Card style={{ borderRadius: 30, overflow: 'visible' }}>
        //         <CardHeader
        //             action={
        //                 <Tooltip title="Edit Name">
        //                     <IconButton
        //                         onClick={() => {
        //                             let input = prompt("Please enter a new name");
        //                             input && handleNewName(highlightNumber, input);
        //                         }}
        //                     >
        //                         <EditIcon />
        //                     </IconButton>
        //                 </Tooltip>

        //             }
        //             title={highlightName}
        //             style={{
        //                 backgroundColor: isInRegionColor,
        //                 paddingLeft: 25,
        //                 borderTopLeftRadius: 30,
        //                 borderTopRightRadius: 30,
        //             }}
        //         />
        //         <CardContent>
        //             {/* "is in view region" indicator */}
        //             <Typography
        //                 variant="h5"
        //             >
        //                 {titleStr}
        //             </Typography>
        //             {/* left to right: color picker, delete, hide+show, jump-to-view-region */}
        //             <div className="highlight-item-buttons-group">
        //                 <ColorPicker
        //                     color={this.state.color}
        //                     onChange={(evt: any) => {
        //                         handleNewColor(highlightNumber, `rgba(${evt.rgb.r}, ${evt.rgb.g}, ${evt.rgb.b}, 0.3)`);
        //                         this.handleStateColor(`rgba(${evt.rgb.r}, ${evt.rgb.g}, ${evt.rgb.b}, 0.3)`);
        //                     }}
        //                 />
        //             </div>
        //         </CardContent>
        //         <CardActions>
        //             <Tooltip title="Delete">
        //                 <IconButton onClick={() => { handleDelete(this.props.highlightNumber) }}>
        //                     <DeleteIcon />
        //                 </IconButton>
        //             </Tooltip>
        //             <Tooltip title="Toggle Active">
        //                 <IconButton onClick={() => { updateActive(highlightNumber) }}>
        //                     {active ? <ActiveIcon /> : <InactiveIcon />}
        //                 </IconButton>
        //             </Tooltip>
        //             <Tooltip title="Jump to Highlight">
        //                 <IconButton onClick={() => { handleViewRegionJump(this.props.highlightNumber) }}>
        //                     <JumpIcon />
        //                 </IconButton>
        //             </Tooltip>
        //         </CardActions>
        //     </Card>
        // )
    }
}