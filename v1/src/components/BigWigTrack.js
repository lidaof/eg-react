import BarChart from './BarChart';
import React from 'react';
import Track from './Track';
import _ from 'lodash';

const bigwig = require('../vendor/bbi-js/main/bigwig');
const bin = require('../vendor/bbi-js/utils/bin');
const bbURI = 'http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig';

class BigWigTrack extends Track {

    constructor(props) {
        super(props);
        this.requestedRegion = null;
        this.state = {};
        this.state.data = [];
        this.fetchData = this.fetchData.bind(this);
        this.drawCanvas = this.drawCanvas.bind(this);
    }

  //   componentDidMount() {
  //
  // }


      fetchData(genome, viewRegion) {
          // console.log(`fetching ${genome}, ${viewRegion}`);
          // return new Promise((resolve, reject) => {
          //     window.setTimeout(() => resolve('wow very data'), Math.floor(1000 + Math.random() * 2000)); // 1 - 3s
          // });
          return new Promise((resolve,reject) => {
            bigwig.makeBwg(new bin.URLFetchable(bbURI), (_bb, _err) => {
            let bb = _bb, tmpdata = [];
            console.log(bb.version);
            bb.readWigData('chr7',27173534,27253626, function(data){
            tmpdata = data.map(function (obj) {
              return obj.score;
            });
            //console.log(tmpdata);
            resolve(tmpdata);
          });
        });
        })
      }

      drawCanvas() {
          let tmp = _.chunk(this.state.data,2);
          let tmp2 = tmp.map(function(d){return _.mean(d)});
          console.log(tmp2);
          return (
            <div draggable='true' className='track'
            onDragEnd={this.props.onDragEndCallback}>
              <BarChart data={tmp2} size={[1000,500]} />
            </div>
        )
      }

    render() {
        let self = this;
        if (this.requestedRegion !== this.props.viewRegion) { // View region changed
            this.requestedRegion = this.props.viewRegion;
            this.fetchData(this.props.genome, this.props.viewRegion).then((data) => {
                // When the data finally comes in, be sure it is still what the user wants
                //console.log(data);
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

}

export default BigWigTrack;
