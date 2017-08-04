import React from 'react';
import Track from './Track'

// require('../vendor/bbi-js/utils/require.js');
// require('../vendor/bbi-js/utils/utils.js');

const bigwig = require('../vendor/bbi-js/main/bigwig');
const bin = require('../vendor/bbi-js/utils/bin');
const bbURI = 'http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig';

class BigWigTrack extends Track {

    constructor(props) {
        super(props);
        this.requestedRegion = null;
        this.tkdata = null;
    }

    componentDidMount() {
        bigwig.makeBwg(new bin.URLFetchable(bbURI), (_bb, _err) => {
        const bb = _bb;
        let self=this;
        console.log(bb.version);
        bb.readWigData('chr7',27173534,27253626, function(data){
          self.tkdata = data.map(function (obj) {
            return JSON.stringify(obj.score)
          });

          console.log(self.tkdata);
        });
    });
  }

    render() {
        let self = this;
        if (this.requestedRegion !== this.props.viewRegion) { // View region changed
            this.requestedRegion = this.props.viewRegion;
            this.fetchData(this.props.genome, this.props.viewRegion).then((data) => {
                // When the data finally comes in, be sure it is still what the user wants
                if (self.requestedRegion === self.props.viewRegion) {
                    self.setState({data: data});
                } else {
                    // Maybe cache the data still?
                }
            });
            return (<div draggable='true' className='track' 
                onDragEnd={this.props.onDragEndCallback}>Loading...</div>);
        } else { // Data is here, let's render!
            return this.drawCanvas();
        }
    }

    fetchData(genome, viewRegion) {
        console.log(`fetching ${genome}, ${viewRegion}`);
        return new Promise((resolve, reject) => {
            window.setTimeout(() => resolve('wow very data'), Math.floor(1000 + Math.random() * 2000)); // 1 - 3s
        });
    }

    drawCanvas() {
        return <div draggable='true' className='track' onDragEnd={this.props.onDragEndCallback}>{`${this.state.data} + ${this.props.viewRegion} + ${this.tkdata}`}</div>
    }
}

export default BigWigTrack;
