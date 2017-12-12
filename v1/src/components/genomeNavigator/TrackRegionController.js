import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import React from 'react';
import PropTypes from 'prop-types';

/**
 * The display that is above the main pane of the genome navigator, which shows the current track region and a text
 * input to modify it.
 * 
 * @author Silas Hsu
 */
class TrackRegionController extends React.Component {
    static propTypes = {
        model: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The current view of the genome navigator
    
        /**
         * Called when the user types a region to go to and it is successfully parsed.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the interval
         *         `newEnd`: the absolute base number of the end of the interval
         */
        newRegionCallback: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);
        this.input = null;
        this.state = {
            badInputMessage: "",
        };
    }

    /**
     * @return {string} the currently displayed region in human-readable form
     */
    _currentRegionAsString() {
        let intervals = this.props.model.getSegmentIntervals();
        if (intervals.length === 1) {
            return intervals[0].toString();
        } else {
            let first = intervals[0];
            let last = intervals[intervals.length - 1];
            return `${first.name}:${first.start}-${last.name}:${last.end}`;
        }
    }

    /**
     * Parses user input that expresses a desired region for tracks to display.
     */
    parseRegion() {
        let parsedRegion = null;
        try {
            parsedRegion = this.props.model.getNavigationContext().parseRegionString(this.input.value);
        } catch (error) {
            if (error instanceof RangeError) {
                this.setState({badInputMessage: error.message});
                return;
            } else {
                throw error;
            }
        }

        // Yay, parsing successful!
        if (this.state.badInputMessage.length > 0) {
            this.setState({badInputMessage: ""});
        }
        this.props.newRegionCallback(parsedRegion.start, parsedRegion.end);
    }

    /**
     * @inheritdoc
     */
    render() {
        let region = this._currentRegionAsString();
        return (
        <div>
            <p>Current track region: {region}</p>
            <label>
                Set new region:
                <input type="text" ref={(input) => this.input = input} />
                <button onClick={this.parseRegion.bind(this)}>Go</button>
                {
                    this.state.badInputMessage.length > 0 ? <p>{this.state.badInputMessage}</p> : null
                }
            </label>
        </div>
        );
    }
}

export default TrackRegionController;
