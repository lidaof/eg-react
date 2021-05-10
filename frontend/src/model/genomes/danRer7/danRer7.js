import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";

const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("danRer7", allSize);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52425276-52425961");
const defaultTracks = [

    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/danRer7/danRer7.bb',
    })
];


const DAN_RER7 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/danRer7/danRer7.2bit",
    annotationTracks,
};

export default DAN_RER7;