import BarChart from './BarChart';
import React from 'react';
import Track from './Track';
import _ from 'lodash';

const DEBUG = false;

class BigWigTrack extends Track {
    static TYPE_NAME = "bigwig";

    constructor(props) {
        super(props);
        this.requestedRegion = null;
        this.state = {};
        this.state.data = [];
        this.drawCanvas = this.drawCanvas.bind(this);
    }

    drawCanvas() {
        let tmp = _.chunk(this.state.data,2);
        let tmp2 = tmp.map(function(d){return _.mean(d)});
        if (DEBUG) console.log(tmp2);
        return (
        <div className='track'>
            <BarChart data={tmp2} size={[1000,500]} />
        </div>
        )
    }

    render() {
        if (this.state.isLoading) {
            return <div className='track'>Loading...</div>
        } else {
            return this.drawCanvas();
        }
    }

}

export default BigWigTrack;
