import React from 'react';
import PropTypes from 'prop-types';
import TrackModel from '../../model/TrackModel';

const TRACK_TYPES = ['bigWig'];

/**
 * UI for adding custom tracks.
 * 
 * @author Silas Hsu
 */
class CustomTrackAdder extends React.Component {
    static propTypes = {
        onTrackAdded: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            type: TRACK_TYPES[0],
            url: "",
            name: "",
            urlError: "",
            trackAdded: false,
        };
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
    }

    handleSubmitClick() {
        if (!this.props.onTrackAdded) {
            return;
        }

        if (!this.state.url) {
            this.setState({urlError: "Enter a URL"});
        } else {
            this.props.onTrackAdded(new TrackModel(this.state));
            this.setState({urlError: "", trackAdded: true});
        }
    }

    renderTypeOptions() {
        return TRACK_TYPES.map(type => <option key={type} value={type} >{type}</option>);
    }

    renderButtons() {
        if (this.state.trackAdded) {
            return (
            <React.Fragment>
                <button className="btn btn-success" disabled={true} >Success</button>
                <button className="btn btn-link" onClick={() => this.setState({trackAdded: false})} >
                    Add another track
                </button>
            </React.Fragment>
            );
        } else {
            return <button className="btn btn-primary" onClick={this.handleSubmitClick} >SUBMIT</button>;
        }
    }

    render() {
        const {type, url, name, urlError} = this.state;
        return (
        <div>
            <h1>Add custom track</h1>
            <div>
                <label>Track type</label>
                <select value={type} onChange={event => this.setState({type: event.target.value})} >
                    {this.renderTypeOptions()}
                </select>
            </div>
            <div>
                <label>File URL</label>
                <input type="text" value={url} onChange={event => this.setState({url: event.target.value})} />
                <span style={{color: "red"}} >{urlError}</span>
            </div>
            <div>
                <label>Track label</label>
                <input type="text" value={name} onChange={event => this.setState({name: event.target.value})}/>
            </div>
            {this.renderButtons()}
        </div>
        )
    }
}

export default CustomTrackAdder;
