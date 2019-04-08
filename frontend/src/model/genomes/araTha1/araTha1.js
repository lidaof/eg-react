import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("araTha1", [
    new Chromosome("chr1", 30427671),
    new Chromosome("chr2", 19698289),
    new Chromosome("chr3", 23459830),
    new Chromosome("chr4", 18585056),
    new Chromosome("chr5", 26975502),
    new Chromosome("chrCp", 154478),
    new Chromosome("chrMt", 366924),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr1:1187814-1197077");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "gene",
        label: "TAIR10 genes",
        genome: "araTha1",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
];


const AraTha1 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/araTha1/araTha1.2bit",
    annotationTracks,
};

export default AraTha1;
