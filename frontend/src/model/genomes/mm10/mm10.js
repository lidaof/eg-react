import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../../model/TrackModel';
import cytobands from './cytoBand.json';

const genome = new Genome("mm10", [
    new Chromosome("chr1", 195471971),
    new Chromosome("chr2", 182113224),
    new Chromosome("chr3", 160039680),
    new Chromosome("chr4", 156508116),
    new Chromosome("chr5", 151834684),
    new Chromosome("chr6", 149736546),
    new Chromosome("chr7", 145441459),
    new Chromosome("chr8", 129401213),
    new Chromosome("chr9", 124595110),
    new Chromosome("chr10", 130694993),
    new Chromosome("chr11", 122082543),
    new Chromosome("chr12", 120129022),
    new Chromosome("chr13", 120421639),
    new Chromosome("chr14", 124902244),
    new Chromosome("chr15", 104043685),
    new Chromosome("chr16", 98207768),
    new Chromosome("chr17", 94987271),
    new Chromosome("chr18", 90702639),
    new Chromosome("chr19", 61431566),
    new Chromosome("chrX", 171031299),
    new Chromosome("chrY", 91744698),
    new Chromosome("chrM", 16299),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52003276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "mm10",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/mm10/rmsk16.bb'
    }),
];

const publicHubData = {
    "4D Nucleome Network": "The 4D Nucleome Network aims to understand the principles underlying nuclear organization " + 
    "in space and time, the role nuclear organization plays in gene expression and cellular function, and how changes " 
    + "in nuclear organization affect normal development as well as various diseases. The program is developing novel " 
    + "tools to explore the dynamic nuclear architecture and its role in gene expression programs, " + 
    "models to examine the relationship between nuclear organization and function, " + 
    "and reference maps of nuclear architecture in a variety of cells and tissues as a community resource.",
}

const publicHubList = [
    {
        collection: "4D Nucleome Network",
        name: "4DN HiC datasets",
        numTracks: 23,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~dli/test/4dn_mm10.json"
    },
]

const MM10 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/mm10/mm10.2bit",
    publicHubData,
    publicHubList,
};

export default MM10;
