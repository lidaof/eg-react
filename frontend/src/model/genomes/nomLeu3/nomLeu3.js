import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';

import annotationTracks from "./annotationTracks.json";

const genome = new Genome("nomLeu3", [
    new Chromosome("chr1a", 122973662),
    new Chromosome("chr2", 163208435),
    new Chromosome("chr3", 157873769),
    new Chromosome("chr4", 152096393),
    new Chromosome("chr5", 143122389),
    new Chromosome("chr6", 121039945),
    new Chromosome("chr7b", 115148730),
    new Chromosome("chr8", 117381234),
    new Chromosome("chr9", 118206036),
    new Chromosome("chr10", 106955855),
    new Chromosome("chr11", 123690457),
    new Chromosome("chr12", 109391073),
    new Chromosome("chr13", 110113093),
    new Chromosome("chr14", 94967081),
    new Chromosome("chr15", 110690730),
    new Chromosome("chr16", 100215132),
    new Chromosome("chr17", 99891981),
    new Chromosome("chr18", 104879549),
    new Chromosome("chr19", 81552678),
    new Chromosome("chr20", 85365473),
    new Chromosome("chr21", 86207423),
    new Chromosome("chr22a", 133034539),
    new Chromosome("chr23", 34552619),
    new Chromosome("chr24", 28733288),
    new Chromosome("chr25", 32716333),
    new Chromosome("chrX", 141252148)
]);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52425276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ensGene",
        label: "ensembl genes",
        genome: 'nomLeu3'
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/nomLeu3/nomLeu3_rmsk.bb',
    })
];

const NOMLEU3 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/nomLeu3/nomLeu3.2bit",
    annotationTracks,
};

export default NOMLEU3;
