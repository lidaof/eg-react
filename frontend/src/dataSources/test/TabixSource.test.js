import TabixSource from '../TabixSource';
import ChromosomeInterval from '../../model/interval/ChromosomeInterval';

const testURL = "http://vizhub.wustl.edu/public/hg19/methylc2/h1.lifttohg19.gz";
const tabixObj = new TabixSource(testURL);
const interval = new ChromosomeInterval('chr22', 19178140, 19178170);

// $ tabix h1.lifttohg19.gz chr22:19178140-19178170
// chr22	19178141	19178142	CHH/0/6/+
// chr22	19178143	19178144	CHG/0/6/+
// chr22	19178145	19178146	CHG/0/6/-
// chr22	19178148	19178149	CHH/0/6/+
// chr22	19178150	19178151	CHH/0/6/+
// chr22	19178151	19178152	CHH/0/6/+
// chr22	19178155	19178156	CHH/0/6/+
// chr22	19178156	19178157	CHH/0/6/+

test('getFeaturesInInterval', () => {
    return tabixObj.getFeaturesInInterval(interval).then((data) => {
        expect(data.length).toBe(8);
    });
});
