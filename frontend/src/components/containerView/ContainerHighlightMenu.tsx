import React from "react";
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
    Button
} from "@material-ui/core";
import {
    Delete as DeleteIcon,
    Visibility as ActiveIcon,
    VisibilityOff as InactiveIcon,
    ChevronRight as JumpIcon,
    Edit as EditIcon
} from '@material-ui/icons'
import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import ColorPicker from "../../components/ColorPicker";
import { Chip } from '@material-ui/core';
import { support } from "jszip";

// import "./HighlightMenu.css";

/**
 * an interface to update highlight intervals
 * @author Vincent Xu
 * @author Daofeng Li
 */

export class HighlightInterval {
    start: number;
    end: number;
    display: boolean;
    color: string;
    tag: string;
    constructor(start: number, end: number, tag: string = '', color: string = 'rgba(255,255,0, 0.3)', display: boolean = true) {
        this.start = start;
        this.end = end;
        this.tag = tag;
        this.color = color;
        this.display = display;
    }
}

export class ContainerHighlightInterval extends HighlightInterval {
    genomeIdx: number;
    constructor(start: number, end: number, tag: string = '', color: string = 'rgba(255,255,0, 0.3)', display: boolean = true, genomeIdx: number) {
        super(start, end, tag, color, display);
        this.genomeIdx = genomeIdx;
    }
}

interface HighlightMenuProps {
    highlights: ContainerHighlightInterval[];
    viewRegion: DisplayedRegionModel;
    showHighlightMenuModal: boolean;
    onOpenHighlightMenuModal: any;
    onCloseHighlightMenuModal: any;
    onSetHighlights: (newHighlights: HighlightInterval[], genomeIdx?: number) => void;
    onNewRegion: Function;
    genomeNames: string[];
};

/**
 * Menu for managing multiple highlights created on TrackContainer
 */
class ContainerHighlightMenu extends React.Component<HighlightMenuProps> {

    handleHighlightIntervalUpdate = (doDelete: boolean, index: number, interval?: HighlightInterval): void => {
        const { highlights, onSetHighlights } = this.props;
        const { genomeIdx: gidxContainer } = this.props.highlights[index];
        const fhighlights: ContainerHighlightInterval[] = [];
        for (let i = 0; i < highlights.length; i++) {
            if (highlights[i].genomeIdx !== gidxContainer) continue;
            if (i === index) {
                if (doDelete) continue;
                if (interval) {
                    const { start, end, tag, color, display } = interval;
                    fhighlights.push(new ContainerHighlightInterval(start, end, tag, color, display, gidxContainer));
                    continue;
                }
            }
            fhighlights.push(highlights[i]);
        }

        onSetHighlights(fhighlights, gidxContainer);

        // let pInterval: ContainerHighlightInterval | undefined;
        // if (interval) { const { start, end, tag, color, display} = interval; pInterval = new ContainerHighlightInterval(start, end, tag, color, display, gidxContainer); }
        // if (doDelete) {
        //     const newIntervals = [...fhighlights.slice(0, index), ...fhighlights.slice(index + 1, fhighlights.length)];
        //     onSetHighlights(newIntervals, gidxContainer);
        // } else {
        //     const newIntervals = [...fhighlights];
        //     if (interval) { newIntervals.splice(index, 1, pInterval) } else { newIntervals.splice(index, 1, pInterval); }
        //     onSetHighlights(newIntervals, gidxContainer);
        // }
    }

    handleViewRegionJump = (interval: HighlightInterval): void => {
        const { onNewRegion, onCloseHighlightMenuModal } = this.props;
        const { start, end } = interval;
        onNewRegion(start, end);
        onCloseHighlightMenuModal();
    }

    handleRemoveAll = (iset: Set<number>): void => { for (let e of iset) this.props.onSetHighlights([], e); }

    render() {
        const { highlights, viewRegion, onSetHighlights, genomeNames } = this.props;
        const gindices = new Set<number>();
        const highlightElements = highlights.length ? highlights.map((item: ContainerHighlightInterval, index: number) => {
            gindices.add(item.genomeIdx);
            const generatedProperties = [];
            if (genomeNames.length > 1) generatedProperties.push(genomeNames[item.genomeIdx]);
            return (
                <Grid item xs={4} key={index}>
                    <HighlightItem
                        interval={item}
                        index={index}
                        onHandleHighlightIntervalUpdate={this.handleHighlightIntervalUpdate}
                        onHandleViewRegionJump={this.handleViewRegionJump}
                        viewRegion={viewRegion}
                        properties={generatedProperties}
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
                        {
                            highlights.length ?
                                <div style={{ paddingBottom: '5px' }}>
                                    <Button variant="contained" color="secondary" onClick={() => this.handleRemoveAll(gindices)}>Remove all</Button>
                                </div>
                                : null
                        }
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


interface HighlightItemProps {
    interval: ContainerHighlightInterval;
    onHandleHighlightIntervalUpdate: Function;
    onHandleViewRegionJump: Function;
    index: number;
    viewRegion: DisplayedRegionModel;
    properties?: string[];
};

export class HighlightItem extends React.Component<HighlightItemProps> {

    render(): JSX.Element {
        const { 
            interval,
            index,
            onHandleHighlightIntervalUpdate,
            onHandleViewRegionJump,
            viewRegion,
            properties
        } = this.props;
        const navContext = viewRegion.getNavigationContext();
        return (
            <Card style={{ borderRadius: 30, overflow: 'visible' }}>
                <CardHeader
                    action={
                        <Tooltip title="Edit Name">
                            <IconButton
                                onClick={() => {
                                    let input = prompt("Please enter a new name");
                                    if (input) {
                                        const newInterval = new HighlightInterval(interval.start, interval.end, input);
                                        onHandleHighlightIntervalUpdate(false, index, newInterval);
                                    }
                                }}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                    }
                    title={interval.tag}
                    style={{
                        backgroundColor: interval.color,
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
                        {navContext.getLociInInterval(interval.start, interval.end).toString()}
                    </Typography>
                    {/* left to right: color picker, delete, hide+show, jump-to-view-region */}
                    <div className="highlight-item-buttons-group">
                        <ColorPicker
                            color={interval.color}
                            disableAlpha={false}
                            onChange={(color: any) => {
                                const newColor = `rgba(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}, ${color.rgb.a})`
                                const newInterval = new HighlightInterval(interval.start, interval.end, interval.tag, newColor);
                                onHandleHighlightIntervalUpdate(false, index, newInterval)
                            }}
                        />
                        {properties && properties.map(s => (
                            <Chip label={s} />
                        ))}
                    </div>
                </CardContent>
                <CardActions>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => onHandleHighlightIntervalUpdate(true, index)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Toggle Active">
                        <IconButton onClick={() => {
                            const newInterval = new HighlightInterval(interval.start, interval.end, interval.tag, interval.color, !interval.display);
                            onHandleHighlightIntervalUpdate(false, index, newInterval)
                        }}>
                            {interval.display ? <ActiveIcon /> : <InactiveIcon />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Jump to Highlight">
                        <IconButton onClick={() => onHandleViewRegionJump(interval)}>
                            <JumpIcon />
                        </IconButton>
                    </Tooltip>
                </CardActions>
            </Card>
        )
    }
}

export default ContainerHighlightMenu;