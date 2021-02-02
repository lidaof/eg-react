import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';

import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";

const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("gorGor3", allSize);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52341786-52427411");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ensGene",
        label: "ensembl genes",
        genome: 'gorGor3'
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/gorGor3/gorGor3_rmsk.bb',
    })
];

const GORGOR3 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/gorGor3/gorGor3.2bit",
    annotationTracks,
};

export default GORGOR3;
