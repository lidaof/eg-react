import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';

import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";

const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("papAnu2", allSize);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52425276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        label: "refGene genes",
        url: "https://wangftp.wustl.edu/~adu/browser/compareTo_hg19/papAnu2/",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ensembl",
        label: "ensembl genes",
        url: "https://wangftp.wustl.edu/~adu/browser/compareTo_hg19/papAnu2/",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://wangftp.wustl.edu/~adu/browser/compareTo_hg19/papAnu2/papAnu2_rmsk.bb',
    })
];

const PAPANU2 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://wangftp.wustl.edu/~adu/browser/compareTo_hg19/papAnu2/papAnu2.2bit",
    annotationTracks,
};

export default PAPANU2;
