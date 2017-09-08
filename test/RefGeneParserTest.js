'use strict';

const expect = require('chai').expect;
const RefGeneParser = require('../RefGeneParser.js');

describe('RefGeneParser', function() {
    const data = 
        'chr1\t11873\t14409\tname:"NR_0",id:41061,strand:"+",struct:{thin:[[12612,12721],[13220,14409],],},desc:"wow very gene",name2:"DDX11L1"\n' +
        'chr2\t34610\t36081\tname:"NM_1",id:40166,strand:"-",struct:{thick:[[367658,368597],],},name2:"OR4F29"';

    it('should parse correctly', function() {
        let parsed = new RefGeneParser.RefGeneParser(data).parse();
        expect(parsed).to.deep.equal([
            {
                chromosome: 'chr1',
                start: 11873,
                end: 14409,
                accession: 'NR_0',
                id: 41061,
                strand: '+',
                exons: [ [ 12612, 12721 ], [ 13220, 14409 ] ],
                description: 'wow very gene',
                name: 'DDX11L1'
            },
            {
                chromosome: 'chr2',
                start: 34610,
                end: 36081,
                accession: 'NM_1',
                id: 40166,
                strand: '-',
                exons: [ [367658, 368597] ],
                description: '',
                name: 'OR4F29'
            },
        ]);
    });
});
