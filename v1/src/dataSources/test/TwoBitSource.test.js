import TwoBitSource from '../TwoBitSource';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

const testURL = "http://vizhub.wustl.edu/public/hg19/hg19.2bit";
const twoBitObj = new TwoBitSource(testURL);
const interval = new ChromosomeInterval('chr22', 19178140, 19178170);

test('getData', () => {
    return twoBitObj.getData(interval).then((seq) => {
        expect(seq).toBe('NTCACAGATCACCATACCATNTNNNGNNCNA');
    });
});
