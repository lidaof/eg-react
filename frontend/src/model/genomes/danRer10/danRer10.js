import SCAFFOLDS from './scaffolds';
import { Chromosome, Genome } from '../Genome';
import TrackModel from '../../../model/TrackModel';

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
];

const DAN_RER10 = {
    genome: genome,
    navContext: navContext,
    cytobands: {}, // There is no meaningful cytoband data for this genome
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
};

export default DAN_RER10;
