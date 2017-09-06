import DataSource from './DataSource';

const data = [
    {
        name: "GENE1",
        strand: "+",
        start: 5,
        end: 100,
        exons: []
    },
    {
        name: "GENE2",
        strand: "-",
        start: 200,
        end: 400,
        exons: [
            {
                start: 200,
                end: 250
            },
            {
                start: 330,
                end: 400
            }
        ]
    },
    {
        name: "GENE3",
        strand: "+",
        start: 250,
        end: 300,
        exons: []
    },
    {
        name: "GENE4",
        strand: "-",
        start: 350,
        end: 500,
        exons: []
    },
    {
        name: "GENE5",
        strand: "+",
        start: 800,
        end: 1200,
        exons: [
            {
                start: 900,
                end: 1100
            }
        ]
    },
];

class GeneDataSource extends DataSource {
    getData(regionModel) {
        return Promise.resolve(data);
    }
}

export default GeneDataSource;
