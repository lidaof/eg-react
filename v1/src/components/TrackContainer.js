import React from 'react';
import BigWigTrack from './BigWigTrack.js';

class TrackContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            genome: 'hg19',//{name: 'hg19'},
            viewRegion: 'myregion (dragged 0 times)',//{startBP: 0, endBP: 1000000},
        }
        this.trackDragged = this.trackDragged.bind(this);
        this.numTimesDragged = 0;
    }

    render() {
        return (
            <div>
                <BigWigTrack genome={this.state.genome} viewRegion={this.state.viewRegion} onDragEndCallback={this.trackDragged}/>
                <BigWigTrack genome={this.state.genome} viewRegion={this.state.viewRegion} onDragEndCallback={this.trackDragged}/>
            </div>
        );
    }

    trackDragged() {
        this.numTimesDragged++;
        this.setState({
            viewRegion: `myregion (dragged ${this.numTimesDragged} times)`,
        });
    }
}

export default TrackContainer;
