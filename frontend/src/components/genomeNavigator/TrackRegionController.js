import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import React from 'react';
import PropTypes from 'prop-types';
import GeneSearchBox from './GeneSearchBox';

/**
 * The display that is above the main pane of the genome navigator, which shows the current track region and a text
 * input to modify it.
 * 
 * @author Silas Hsu
 */
class TrackRegionController extends React.Component {
    static propTypes = {
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The current view of the genome navigator
    
        /**
         * Called when the user types a region to go to and it is successfully parsed.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the interval
         *         `newEnd`: the nav context coordinate of the end of the interval
         */
        onRegionSelected: PropTypes.func.isRequired,
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
        let segments = this.props.selectedRegion.getFeatureSegments();
        if (segments.length === 1) {
            return segments[0].toString();
        } else {
            let first = segments[0];
            let last = segments[segments.length - 1];
            return first.toStringWithOther(last);
        }
    }

    /**
     * Parses user input that expresses a desired region for tracks to display.
     */
    parseRegion() {
        let parsedRegion = null;
        try {
            parsedRegion = this.props.selectedRegion.getNavigationContext().parse(this.input.value);
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
        this.props.onRegionSelected(parsedRegion.start, parsedRegion.end);
    }

    handleClick(event) {
        event.currentTarget.select();
    }

    /**
     * @inheritdoc
     */
    render() {
        let region = this._currentRegionAsString();
        return (
        <div>
            {/* <label>
            Current region: {region} 
            </label> */}
                
                {/* <input type="text" ref={(input) => this.input = input} defaultValue={region} size="30" onClick={this.handleClick}/>
                <button 
                    className="btn btn-secondary btn-sm" 
                    style={{marginLeft: "2px"}} onClick={this.parseRegion.bind(this)}
                    
                >
                    Go
                </button> */}
            <button className="btn btn-secondary dropdown-toggle" 
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {region}
            </button>
            <div className="dropdown-menu">
                <h6 className="dropdown-header">Region search</h6>
                <GeneSearchBox
                    navContext={this.props.selectedRegion.getNavigationContext()}
                    onRegionSelected={this.props.onRegionSelected}
                />
                <div className="dropdown-divider"></div>
                <div>
                    <h6 className="dropdown-header">Gene search</h6>
                    <input type="text" ref={(input) => this.input = input} size="30" 
                        placeholder="Coordinate"
                        onClick={this.handleClick}/>
                    <button 
                        className="btn btn-secondary btn-sm" 
                        style={{marginLeft: "2px"}} onClick={this.parseRegion.bind(this)}
                    >
                        Go
                    </button>
                </div>
                
             </div>
                {
                    this.state.badInputMessage.length > 0 ? <span className="alert-danger">{this.state.badInputMessage}</span> : null
                }
            
            
        </div>
        );
    }
}

export default TrackRegionController;
