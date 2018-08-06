import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import GeneSearchBox from './GeneSearchBox';

const MODAL_STYLE = {
    content: {
        top: "40px",
        left: "543px",
        right: "unset",
        bottom: "unset",
        overflow: "visible",
        padding: "5px",
        color: "black",
    }
};

const X_BUTTON_STYLE = {
    cursor: "pointer",
    color: "red",
    fontSize: "2em",
    position:"absolute",
    top: "-5px",
    right: "15px"
};

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
            showModal: false,
        };
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    handleOpenModal () {
        this.setState({ showModal: true });
    }
      
    handleCloseModal () {
        this.setState({ showModal: false });
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
        this.handleCloseModal();
    }

    handleClick(event) {
        event.currentTarget.select();
    }

    /**
     * @inheritdoc
     */
    render() {
        const coordinates = this._currentRegionAsString();
        return (
        <div>
            <button className="btn btn-secondary" onClick={this.handleOpenModal}>
                {coordinates}
            </button>
            <ReactModal 
                isOpen={this.state.showModal}
                contentLabel="Gene & Region search"
                ariaHideApp={false}
                onRequestClose={this.handleCloseModal}
                shouldCloseOnOverlayClick={true}
                style={MODAL_STYLE}
            >
                <span className="text-right" style={X_BUTTON_STYLE} onClick={this.handleCloseModal}>×</span>
                <h6>Gene search</h6>
                <GeneSearchBox
                    navContext={this.props.selectedRegion.getNavigationContext()}
                    onRegionSelected={this.props.onRegionSelected}
                    handleCloseModal = {this.handleCloseModal}
                />
                <h6>Region search (current region is {coordinates})</h6>
                <input
                    ref={(input) => this.input = input}
                    type="text"
                    size="30" 
                    placeholder="Coordinate"
                    onClick={this.handleClick}
                />
                <button 
                    className="btn btn-secondary btn-sm" 
                    style={{marginLeft: "2px"}}
                    onClick={this.parseRegion.bind(this)}
                >
                    Go
                </button>
                {
                this.state.badInputMessage.length > 0 &&
                    <span className="alert-danger">{this.state.badInputMessage}</span>
                }
            </ReactModal>
        </div>
        );
    }
}

export default TrackRegionController;
