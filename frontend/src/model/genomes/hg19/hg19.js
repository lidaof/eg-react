import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoband.json';
import annotationTracks from './annotationTracks.json';

const genome = new Genome('hg19', [
    new Chromosome('chr1', 249250621),
    new Chromosome('chr2', 243199373),
    new Chromosome('chr3', 198022430),
    new Chromosome('chr4', 191154276),
    new Chromosome('chr5', 180915260),
    new Chromosome('chr6', 171115067),
    new Chromosome('chr7', 159138663),
    new Chromosome('chr8', 146364022),
    new Chromosome('chr9', 141213431),
    new Chromosome('chr10', 135534747),
    new Chromosome('chr11', 135006516),
    new Chromosome('chr12', 133851895),
    new Chromosome('chr13', 115169878),
    new Chromosome('chr14', 107349540),
    new Chromosome('chr15', 102531392),
    new Chromosome('chr16', 90354753),
    new Chromosome('chr17', 81195210),
    new Chromosome('chr18', 78077248),
    new Chromosome('chr19', 59128983),
    new Chromosome('chr20', 63025520),
    new Chromosome('chr21', 48129895),
    new Chromosome('chr22', 51304566),
    new Chromosome('chrX', 155270560),
    new Chromosome('chrY', 59373566),
    new Chromosome('chrM', 16571)
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse('chr7:27053397-27373765');
const defaultTracks = [
    new TrackModel({
        type: "bigwig",
        name: "test bigwig",
        url: "https://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig",
    }),
    new TrackModel({
        type: 'geneAnnotation',
        name: 'gencodeV28',
        genome: 'hg19',
        options: {
            maxRows: 10
        }
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/hg19/rmsk16.bb"
    }),
    new TrackModel({
        type: "bam",
        name: "Test bam",
        url: "https://wangftp.wustl.edu/~dli/test/a.bam"
    }),
    new TrackModel({
        type: 'bigbed',
        name: 'test bigbed',
        url: 'https://vizhub.wustl.edu/hubSample/hg19/bigBed1'
    }),
    new TrackModel({
        type: "methylc",
        name: "Methylation",
        url: "https://vizhub.wustl.edu/public/hg19/methylc2/h1.liftedtohg19.gz"
    }),
    new TrackModel({
        type: "hic",
        name: "test hic",
        url: "https://epgg-test.wustl.edu/dli/long-range-test/test.hic",
        options: {
            displayMode: 'arc'
        }
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        name: 'hg19 to mm10 alignment',
        type: "genomealign",
        metadata: {
            genome: 'mm10'
        }
    }),
    new TrackModel({
        name: 'mm10 bigwig',
        type: "bigwig",
        url: "https://epgg-test.wustl.edu/d/mm10/ENCFF577HVF.bigWig",
        metadata: {
            genome: 'mm10'
        }
    }),
    new TrackModel({
        type: "ruler",
        name: "mm10 Ruler",
        metadata: {
            genome: 'mm10'
        }
    }),
];

const HG19 = {
    genome,
    navContext,
    cytobands,
    defaultRegion,
    defaultTracks,
    annotationTracks,
    twoBitURL: 'https://vizhub.wustl.edu/public/hg19/hg19.2bit'
};

export default HG19;
