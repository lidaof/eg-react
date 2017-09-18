import DataSource from '../dataSources/DataSource';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * A track for the genome browser.  This extendable class provides functionality common to all tracks, such as data
 * fetching and view dragging.
 * 
 * @author Silas Hsu
 */
class Track extends React.Component {
    /**
     * Initializes state and immediately sends a request for data.
     * 
     * @param {any} props 
     */
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            data: null,
            xOffset: 0
        };

        this.props.dataSource.getData(this.props.viewRegion).then(data => {
            this.setState({
                isLoading: false,
                data: data
            });
        })
    }

    /**
     * If the view region has changed, sends a request for data
     * 
     * @param {any} nextProps - new props that the component will receive
     * @override
     */
    componentWillReceiveProps(nextProps) {
        if (this.props.viewRegion !== nextProps.viewRegion) {
            this.props.dataSource.getData(nextProps.viewRegion).then((data) => {
                // When the data finally comes in, be sure it is still what the user wants
                if (this.props.viewRegion === nextProps.viewRegion) {
                    this.setState({
                        isLoading: false,
                        data: data,
                        xOffset: 0
                    });
                }
            });
            this.setState({isLoading: true});
        }
    }

    /**
     * Called when the user drags the track around.
     * 
     * @param {any} [unused] - unused
     * @param {any} [unused2] - unused
     * @param {MouseEvent} [unusedEvent] - unused
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    viewDrag(unused, unused2, unusedEvent, coordinateDiff) {
        this.setState({xOffset: -coordinateDiff.dx});
    }

    /**
     * Called when the user finishes dragging the track, signaling a new track display region.
     * 
     * @param {number} newStart - absolute start base pair of the new display region
     * @param {number} newEnd - absolute end base number of the new display region
     * @param {MouseEvent} [event] - unused
     * @param {object} coordinateDiff - an object with keys `dx` and `dy`, how far the mouse has moved since drag start
     */
    viewDragEnd(newStart, newEnd, event, coordinateDiff) {
        if (Math.abs(coordinateDiff.dx) > 5) {
            this.props.newRegionCallback(newStart, newEnd);
        }
    }

    /**
     * By default, returns nothing.  Subclasses can and should override this.  this.state.isLoading` tells if data
     * is currently being fetched, and `this.state.data` contains the actual data to display.
     * 
     * @return {null}
     */
    render() {
        return null;
    }
}

export default Track;

Track.propTypes = {
    dataSource: PropTypes.instanceOf(DataSource).isRequired,
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    newRegionCallback: PropTypes.func.isRequired,
}
