import $ from 'jquery';
import DataSource from './DataSource';
import Gene from '../model/Gene';

class GeneDataSource extends DataSource {
    getData(regionModel) {
        let requests = []
        for (let region of regionModel.getRegionList()) {
            requests.push(this._getDataForOneRegion(region));
        }

        return Promise.all(requests).then((results) => {
            let combined = [].concat.apply([], results); // Concatenate all the data into one array
            return combined.map(record => new Gene(record, regionModel));
        });
    }

    _getDataForOneRegion(region) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: "refGene/hg19",
                data: { // Query parameters
                    chromosome: region.name,
                    start: region.start,
                    end: region.end
                },
                dataType: "json", // Expected type of data from server
            }).done(resolve).fail(reject);
        });
    }
}

export default GeneDataSource;
