import $ from 'jquery';
import DataSource from './DataSource';
import Gene from '../model/Gene';

/**
 * Data source for gene annotations.  Gets data through a REST API.
 * 
 * @author Silas Hsu
 */
class GeneDataSource extends DataSource {
    /**
     * Gets gene data lying within the region.
     * 
     * @param {DisplayedRegionModel} regionModel - the model containing the displayed region
     * @return {Promise<any>} a Promise for the data
     * @override
     */
    getData(regionModel) {
        let requests = [];
        for (let region of regionModel.getRegionList()) {
            requests.push(this._getDataForOneRegion(region));
        }

        return Promise.all(requests).then((results) => {
            let combined = [].concat.apply([], results); // Concatenate all the data into one array
            return combined.map(record => new Gene(record, regionModel));
        });
    }

    /**
     * Gets gene data for a single chromosome, as DisplayedRegionModel can cover multiple chromosomes.
     * 
     * @param {SingleChromosomeInterval} region - a region within a single chromosome for which to get data
     * @return {Promise<any>} a Promise for the data
     */
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
