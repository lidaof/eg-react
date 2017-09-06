import DataSource from './DataSource';

const DEBUG = false;

const bigwig = require('../vendor/bbi-js/main/bigwig');
const bin = require('../vendor/bbi-js/utils/bin');
const bbURI = 'http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig';

class BigWigDataSource extends DataSource {
    getData(viewRegion) {
        return new Promise((resolve,reject) => {
            bigwig.makeBwg(new bin.URLFetchable(bbURI), (_bb, _err) => {
                let bb = _bb, tmpdata = [];
                if (DEBUG) console.log(bb.version);
                let region = viewRegion.getRegionList()[0]
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
}

export default BigWigDataSource;
