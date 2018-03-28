import BigWigSource from '../BigWigSource';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

const testURL = "http://vizhub.wustl.edu/public/hg19/rmsk16.bb";
const bbObj = new BigWigSource(testURL);
const interval = new ChromosomeInterval('chr22', 19178140, 19178170);

test('getData', async () => {
    return bbObj._getDataForChromosome(interval, await bbObj.bigWigPromise, -1).then((features) => {
        expect(features.length).toBeGreaterThan(0);
    });
});
