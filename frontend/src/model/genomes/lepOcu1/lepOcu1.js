import Chromosome from '../Chromosome';
import Genome from '../Genome';
import cytobands from "./cytoBand.json";
import TrackModel from '../../TrackModel';

import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";

const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("lepOcu1", allSize);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("CM001404.1:52254369-52596869");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "refbed",
        name: "ensembl_gene",
        url: "https://wangftp.wustl.edu/~xzhuo/lepOcu1/lepOcu1_Gene.bed.gz",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://wangftp.wustl.edu/~xzhuo/lepOcu1/lepOcu1.bb',
    })
];

const LEPOCU1 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://wangftp.wustl.edu/~xzhuo/lepOcu1/lepOcu1.2bit",
    annotationTracks,
};

export default LEPOCU1;