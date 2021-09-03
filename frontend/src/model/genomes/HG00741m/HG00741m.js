import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";

const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("HG00741m", allSize);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr65:13872050-14004044");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "rmsk_HG00741m",
        url: "https://wangftp.wustl.edu/~cfan/genomes/HG00741m/rmsk/HG00741m.rm.bb",
    }),
    new TrackModel({
        name: "hg38.to.HG00741m",
        querygenome: "hg38",
        type: "genomealign",
        url: "https://wangftp.wustl.edu/~cfan/genomes/HG00741m/genomeAlign/hg38.to.HG00741/hg38.to.HG00741m.gz",
    }),
    new TrackModel({
        name: "refGene",
        label: "refGene_hg38",
        type: "geneannotation",
        filetype: "geneAnnotation",
        metadata: {
          genome: "hg38",   
        }
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "rmsk_hg38",
        url: "https://vizhub.wustl.edu/public/hg38/rmsk16.bb",
        metadata: {
            genome: "hg38"
        }
    }),
];

const HG00741m = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://wangftp.wustl.edu/~cfan/genomes/HG00741m/HG00741m.2bit",
    annotationTracks,
};

export default HG00741m;
