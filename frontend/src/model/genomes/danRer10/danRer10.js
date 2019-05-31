import SCAFFOLDS from './scaffolds';
import Chromosome from '../Chromosome';
import { Genome } from '../Genome';
import TrackModel from '../../TrackModel';
import annotationTracks from "./annotationTracks.json";

const GENOME_NAME = "danRer10";

const genome = new Genome(GENOME_NAME, [
    new Chromosome("chr1", 58871917),
    new Chromosome("chr2", 59543403),
    new Chromosome("chr3", 62385949),
    new Chromosome("chr4", 76625712),
    new Chromosome("chr5", 71715914),
    new Chromosome("chr6", 60272633),
    new Chromosome("chr7", 74082188),
    new Chromosome("chr8", 54191831),
    new Chromosome("chr9", 56892771),
    new Chromosome("chr10", 45574255),
    new Chromosome("chr11", 45107271),
    new Chromosome("chr12", 49229541),
    new Chromosome("chr13", 51780250),
    new Chromosome("chr14", 51944548),
    new Chromosome("chr15", 47771147),
    new Chromosome("chr16", 55381981),
    new Chromosome("chr17", 53345113),
    new Chromosome("chr18", 51008593),
    new Chromosome("chr19", 48790377),
    new Chromosome("chr20", 55370968),
    new Chromosome("chr21", 45895719),
    new Chromosome("chr22", 39226288),
    new Chromosome("chr23", 46272358),
    new Chromosome("chr24", 42251103),
    new Chromosome("chr25", 36898761),
    new Chromosome("chrM", 16596),
    ...SCAFFOLDS
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr19:18966019-19564024");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: GENOME_NAME,
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "Ensembl_GRCz10_91",
        genome: GENOME_NAME,
        label:"Ensembl release 91",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
];


// const publicHubData = {
//     "Encyclopedia of DNA Elements (ENCODE)": "The Encyclopedia of DNA Elements (ENCODE) Consortium is an " +
//         "international collaboration of research groups funded by the National Human Genome Research Institute " +
//         "(NHGRI). The goal of ENCODE is to build a comprehensive parts list of functional elements in the human " +
//         "genome, including elements that act at the protein and RNA levels, and regulatory elements that control " +
//         "cells and circumstances in which a gene is active.",
// };

// const publicHubList = [
//     {
//         collection: "Encyclopedia of DNA Elements (ENCODE)",
//         name: "Zebrafish ENCODE",
//         numTracks: 66,
//         oldHubFormat: false,
//         url: "https://vizhub.wustl.edu/collaboratorsHubs/danRer10/YueLab/hub",
//         description: {
//             'hub built by': 'Daofeng Li (dli23@wustl.edu)',
//             'hub built date': 'May 22 2019',
//             'hub built notes': "Data and metadata information are obtained from Feng Yue's lab"
//         },
//     }
// ]

const DAN_RER10 = {
    genome,
    navContext,
    cytobands: {}, // the cytoBandIdeo from UCSC is basically empty
    defaultRegion,
    defaultTracks,
    twoBitURL: 'https://vizhub.wustl.edu/public/danRer10/danRer10.2bit',
    annotationTracks,
    // publicHubData,
    // publicHubList,
};

export default DAN_RER10;
