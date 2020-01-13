import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBand.json';
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";

const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("aplCal3", allSize);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("NW_004797271.1:2535-6935");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "refbed",
        name: "ncbiGene",
        url: "https://wangftp.wustl.edu/~xzhuo/aplCal3/AplCal3.sort.refbed.gz",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://wangftp.wustl.edu/~xzhuo/aplCal3/aplCal3.bb',
    }),
];


const aplCal3 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://wangftp.wustl.edu/~xzhuo/aplCal3/aplCal3.2bit",
    annotationTracks,
};

export default aplCal3;