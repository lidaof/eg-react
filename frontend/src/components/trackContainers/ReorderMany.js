import React from "react";
import { connect } from "react-redux";
import ReactModal from "react-modal";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { Slider, Rail, Handles, Tracks } from "react-compound-slider";
import { SliderRail, Handle, Track } from "./SliderSubComponents";
import { ActionCreators } from "../../AppState";
import arrayMove from "array-move";

/**
 * a component to drag and drop tracks
 * @author Daofeng Li
 */

function mapStateToProps(state) {
    return {
        tracks: state.browser.present.tracks,
    };
}

const callbacks = {
    onTracksChanged: ActionCreators.setTracks,
};

const gridItemStyles = {
    height: "24px",
    backgroundColor: "#e5e5e5",
    cursor: "move",
};

const GridItem = SortableElement(({ value }) => {
    const style = value.options ? { color: value.options.color } : null;
    return (
        <div style={gridItemStyles}>
            <span style={style}>
                {value.label} ({value.type})
            </span>
        </div>
    );
});

const Grid = SortableContainer(({ items, colNum }) => {
    const gridStyles = {
        display: "grid",
        gridTemplateColumns: `repeat(${colNum}, 1fr)`,
        gridGap: "5px",
    };
    return (
        <div style={gridStyles}>
            {items.map((value, index) => (
                <GridItem key={`item-${index}`} index={index} value={value} />
            ))}
        </div>
    );
});

const defaultValues = [4]; // slider default values

class ReorderMany extends React.Component {
    constructor() {
        super();
        this.state = {
            items: [],
            values: defaultValues.slice(),
            update: defaultValues.slice(),
        };
    }

    componentDidMount() {
        this.setState({ items: [].concat(this.props.tracks) });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.tracks !== this.props.tracks) {
            this.setState({ items: [].concat(this.props.tracks) });
        }
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        this.setState(({ items }) => ({
            items: arrayMove(items, oldIndex, newIndex),
        }));
    };

    onUpdate = (update) => {
        this.setState({ update });
    };

    onChange = (values) => {
        this.setState({ values });
    };

    /**
     * code from first example: https://sghall.github.io/react-compound-slider/#/slider-demos/horizontal
     */
    renderSlider = () => {
        const sliderStyle = {
            position: "relative",
            width: "100%",
            marginTop: "40px",
        };

        const domain = [1, 20];
        const { values } = this.state;

        return (
            <div style={{ height: 40, width: "100%" }}>
                <Slider
                    mode={1}
                    step={1}
                    domain={domain}
                    rootStyle={sliderStyle}
                    onUpdate={this.onUpdate}
                    onChange={this.onChange}
                    values={values}
                >
                    <Rail>{({ getRailProps }) => <SliderRail getRailProps={getRailProps} />}</Rail>
                    <Handles>
                        {({ handles, getHandleProps }) => (
                            <div className="slider-handles">
                                {handles.map((handle) => (
                                    <Handle
                                        key={handle.id}
                                        handle={handle}
                                        domain={domain}
                                        getHandleProps={getHandleProps}
                                    />
                                ))}
                            </div>
                        )}
                    </Handles>
                    <Tracks right={false}>
                        {({ tracks, getTrackProps }) => (
                            <div className="slider-tracks">
                                {tracks.map(({ id, source, target }) => (
                                    <Track key={id} source={source} target={target} getTrackProps={getTrackProps} />
                                ))}
                            </div>
                        )}
                    </Tracks>
                </Slider>
            </div>
        );
    };

    render() {
        return (
            <React.Fragment>
                <button
                    onClick={this.props.onOpenReorderManyModal}
                    title="Re-order many tracks at one time
(Alt+G)"
                    className="btn btn-light"
                >
                    <span role="img" aria-label="reorder">
                        🔃
                    </span>
                </button>
                <ReactModal
                    isOpen={this.props.showReorderManyModal}
                    contentLabel="ReorderMany"
                    ariaHideApp={false}
                    onRequestClose={this.props.onCloseReorderManyModal}
                    shouldCloseOnOverlayClick={true}
                    style={{
                        overlay: {
                            backgroundColor: "rgba(111,107,101, 0.7)",
                            zIndex: 4,
                        },
                    }}
                >
                    <div className="ReorderMany">
                        <h5>
                            Please drag and drop to re-order your tracks. Press the apply button after you are done.
                        </h5>
                        <button
                            onClick={() => this.props.onTracksChanged(this.state.items)}
                            className="btn btn-sm btn-info"
                        >
                            Apply
                        </button>
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
                            onClick={this.props.onCloseReorderManyModal}
                        >
                            ×
                        </span>
                        <p>You can adjust column numbers using the slider below:</p>
                        {this.renderSlider()}
                        <Grid
                            axis="xy"
                            items={this.state.items}
                            onSortEnd={this.onSortEnd}
                            colNum={this.state.values[0]}
                        />
                    </div>
                </ReactModal>
            </React.Fragment>
        );
    }
}

export default connect(mapStateToProps, callbacks)(ReorderMany);
