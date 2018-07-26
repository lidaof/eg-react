import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../../model/TrackModel';
import cytobands from './cytoBand.json';

const genome = new Genome('hg38', [
    new Chromosome('chr1', 248956422),
    new Chromosome('chr2', 242193529),
    new Chromosome('chr3', 198295559),
    new Chromosome('chr4', 190214555),
    new Chromosome('chr5', 181538259),
    new Chromosome('chr6', 170805979),
    new Chromosome('chr7', 159345973),
    new Chromosome('chr8', 145138636),
    new Chromosome('chr9', 138394717),
    new Chromosome('chr10', 133797422),
    new Chromosome('chr11', 135086622),
    new Chromosome('chr12', 133275309),
    new Chromosome('chr13', 114364328),
    new Chromosome('chr14', 107043718),
    new Chromosome('chr15', 101991189),
    new Chromosome('chr16', 90338345),
    new Chromosome('chr17', 83257441),
    new Chromosome('chr18', 80373285),
    new Chromosome('chr19', 58617616),
    new Chromosome('chr20', 64444167),
    new Chromosome('chr21', 46709983),
    new Chromosome('chr22', 50818468),
    new Chromosome('chrM', 16569),
    new Chromosome('chrX', 156040895),
    new Chromosome('chrY', 57227415),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse('chr7:27053397-27373765');
const defaultTracks = [
    new TrackModel({
        type: 'geneAnnotation',
        name: 'refGene',
        genome: 'hg38'
    }),
    new TrackModel({
        type: 'geneAnnotation',
        name: 'gencodeV28',
        genome: 'hg38'
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/hg38/rmsk16.bb'
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    })
];

const HG38 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: 'https://vizhub.wustl.edu/public/hg38/hg38.2bit'
};

export default HG38;
