import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("rheMac8", [
    new Chromosome("chr1", 225584828),
    new Chromosome("chr2", 204787373),
    new Chromosome("chr3", 185818997),
    new Chromosome("chr4", 172585720),
    new Chromosome("chr5", 190429646),
    new Chromosome("chr6", 180051392),
    new Chromosome("chr7", 169600520),
    new Chromosome("chr8", 144306982),
    new Chromosome("chr9", 129882849),
    new Chromosome("chr10", 92844088),
    new Chromosome("chr11", 133663169),
    new Chromosome("chr12", 125506784),
    new Chromosome("chr13", 108979918),
    new Chromosome("chr14", 127894412),
    new Chromosome("chr15", 111343173),
    new Chromosome("chr16", 77216781),
    new Chromosome("chr17", 95684472),
    new Chromosome("chr18", 70235451),
    new Chromosome("chr19", 53671032),
    new Chromosome("chr20", 74971481),
    new Chromosome("chrX", 149150640),
    new Chromosome("chrY", 11753682),
    new Chromosome("chrM", 16564),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr4:69394240-69396207");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "rheMac8",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/rheMac8/rmsk16.bb',
    }),
];


const rheMac8 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/rheMac8/rheMac8.2bit",
    annotationTracks,
};

export default rheMac8;
