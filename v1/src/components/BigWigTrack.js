import BarChart from './BarChart';
import React from 'react';
import Track from './Track';
import _ from 'lodash';

const DEBUG = false;
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


    fetchData() {
          // console.log(`fetching ${genome}, ${viewRegion}`);
          // return new Promise((resolve, reject) => {
          //     window.setTimeout(() => resolve('wow very data'), Math.floor(1000 + Math.random() * 2000)); // 1 - 3s
          // });
        return new Promise((resolve,reject) => {
            bigwig.makeBwg(new bin.URLFetchable(bbURI), (_bb, _err) => {
                let bb = _bb, tmpdata = [];
                if (DEBUG) console.log(bb.version);
                let region = this.props.viewRegion.getRegionList()[0]
                bb.readWigData(region.name, region.start, region.end, function(data) {
                    tmpdata = data.map(function (obj) {
                        return obj.score;
                    });
                    if (DEBUG) console.log(tmpdata);
                    resolve(tmpdata);
                });
            });
        });
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
