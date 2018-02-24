import TrackModel from '../../model/TrackModel';
import {Chromosome, Genome} from '../../model/Genome';

const hg19Genome = new Genome("hg19", [
    new Chromosome("chr1", 249250621),
    new Chromosome("chr2", 243199373),
    new Chromosome("chr3", 198022430),
    new Chromosome("chr4", 191154276),
    new Chromosome("chr5", 180915260),
    new Chromosome("chr6", 171115067),
    new Chromosome("chr7", 159138663),
    new Chromosome("chr8", 146364022),
    new Chromosome("chr9", 141213431),
    new Chromosome("chr10", 135534747),
    new Chromosome("chr11", 135006516),
    new Chromosome("chr12", 133851895),
    new Chromosome("chr13", 115169878),
    new Chromosome("chr14", 107349540),
    new Chromosome("chr15", 102531392),
    new Chromosome("chr16", 90354753),
    new Chromosome("chr17", 81195210),
    new Chromosome("chr18", 78077248),
    new Chromosome("chr19", 59128983),
    new Chromosome("chr20", 63025520),
    new Chromosome("chr21", 48129895),
    new Chromosome("chr22", 51304566),
    new Chromosome("chrX ", 155270560),
    new Chromosome("chrY", 59373566),
    new Chromosome("chrM", 16571)
]);

const hg19Context = hg19Genome.makeNavContext();
//const defaultRegion = hg19Context.parse("chr7:27053397-27373765");
const defaultRegion = hg19Context.parse("chr7:27144350-27167097"); //HOXA3

const defaultTracks = [
    new TrackModel({
        type: "bigwig",
        name: "GSM429321.bigWig",
        url: "http://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig",
    }),
    new TrackModel({
        type: "hammock",
        name: "refGene",
        url: 'http://egg.wustl.edu/d/hg19/refGene.gz',
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    })
];

export const HG19 = {
    genome: hg19Genome,
    context: hg19Context,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks
}
