import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBandIdeo.json';
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("galGal6", [
    new Chromosome("chr1", 197608386),
    new Chromosome("chr2", 149682049),
    new Chromosome("chr3", 110838418),
    new Chromosome("chr4", 91315245),
    new Chromosome("chr5", 59809098),
    new Chromosome("chr6", 36374701),
    new Chromosome("chr7", 36742308),
    new Chromosome("chr8", 30219446),
    new Chromosome("chr9", 24153086),
    new Chromosome("chr10", 21119840),
    new Chromosome("chr11", 20200042),
    new Chromosome("chr12", 20387278),
    new Chromosome("chr13", 19166714),
    new Chromosome("chr14", 16219308),
    new Chromosome("chr15", 13062184),
    new Chromosome("chr16", 2844601),
    new Chromosome("chr17", 10762512),
    new Chromosome("chr18", 11373140),
    new Chromosome("chr19", 10323212),
    new Chromosome("chr20", 13897287),
    new Chromosome("chr21", 6844979),
    new Chromosome("chr22", 5459462),
    new Chromosome("chr23", 6149580),
    new Chromosome("chr24", 6491222),
    new Chromosome("chr25", 3980610),
    new Chromosome("chr26", 6055710),
    new Chromosome("chr27", 8080432),
    new Chromosome("chr28", 5116882),
    new Chromosome("chr30", 1818525),
    new Chromosome("chr31", 6153034),
    new Chromosome("chr32", 725831),
    new Chromosome("chr33", 7821666),
    new Chromosome("chrW", 6813114),
    new Chromosome("chrZ", 82529921),
    new Chromosome("chrM", 16775),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr2:32588990-32593005");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "galGal6",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/galGal6/rmsk16.bb',
    }),
];


const galGal6 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/galGal6/galGal6.2bit",
    annotationTracks,
};

export default galGal6;
