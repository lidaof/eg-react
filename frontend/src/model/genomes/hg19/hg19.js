import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBand.json';
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
        type: "categorical",
        name: "ChromHMM",
        url: "https://egg.wustl.edu/d/hg19/E017_15_coreMarks_dense.gz"
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
        type: 'geneAnnotation',
        name: 'refGene',
        genome: 'mm10',
        options: {
            maxRows: 10
        },
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
    new TrackModel({
        type: "bed",
        name: "mm10 bed",
        url: "https://wangftp.wustl.edu/~rsears/Stuart_Little/ATAC_080818/Bruce4_sub120_extendedto120_DownSample.bed.gz",
        metadata: {
            genome: "mm10"
        }
    })
];

const publicHubData = {
    "Encyclopedia of DNA Elements (ENCODE)": "The Encyclopedia of DNA Elements (ENCODE) Consortium is an " +
        "international collaboration of research groups funded by the National Human Genome Research Institute " +
        "(NHGRI). The goal of ENCODE is to build a comprehensive parts list of functional elements in the human " +
        "genome, including elements that act at the protein and RNA levels, and regulatory elements that control " +
        "cells and circumstances in which a gene is active.",
    "Reference human epigenomes from Roadmap Epigenomics Consortium": "The NIH Roadmap Epigenomics Mapping Consortium was launched with the goal of producing a public resource of human epigenomic data to catalyze basic biology and disease-oriented research. The Consortium leverages experimental pipelines built around next-generation sequencing technologies to map DNA methylation, histone modifications, chromatin accessibility and small RNA transcripts in stem cells and primary ex vivo tissues selected to represent the normal counterparts of tissues and organ systems frequently involved in human disease (quoted from Roadmap website)."
}

const publicHubList = [
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE signal of unique reads",
        numTracks: 7729,
        oldHubFormat: true,
        url: "https://vizhub.wustl.edu/public/hg19/hg19_mpssur.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE signal of all reads",
        numTracks: 7842,
        oldHubFormat: true,
        url: "https://vizhub.wustl.edu/public/hg19/hg19_mpssar.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE all other types",
        numTracks: 5937,
        oldHubFormat: true,
        description: "Base overlap signal, fold change over control, genome compartments, percentage normalized signal, etc.",
        url: "https://vizhub.wustl.edu/public/hg19/hg19_other_rmdup.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE legacy hub",
        numTracks: 4251,
        oldHubFormat: true,
        url: "https://vizhub.wustl.edu/public/hg19/encode.md"
    },
    {
        collection: "Long-range chromatin interaction experiments",
        name: "Long-range chromatin interaction experiments",
        numTracks: 156,
        oldHubFormat: true,
        url: "https://vizhub.wustl.edu/public/hg19/longrange4"
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Roadmap Data from GEO",
        numTracks: 2737,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~dli/tmp/roadmap9",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "methylCRF tracks from Roadmap",
        numTracks: 16,
        oldHubFormat: true,
        description: "Single CpG methylation value prediction by methylCRF algorithm (PMID:23804401) using Roadmap data.",
        url: "https://vizhub.wustl.edu/public/hg19/methylCRF.roadmap.hub"
    },
    {
        collection: "HiC interaction from Juicebox",
        name: "HiC interaction from Juicebox",
        numTracks: 193,
        oldHubFormat: true,
        url: "https://epgg-test.wustl.edu/dli/long-range-test/hg19-juiceboxhub"
    },
    {
        collection: "Human 450K and 27K array data from TCGA",
        name: "Human 450K and 27K array data from TCGA",
        numTracks: 2551,
        oldHubFormat: true,
        url: "https://vizhub.wustl.edu/public/hg19/TCGA-450k-hub2"
    },
];


const HG19 = {
    genome,
    navContext,
    cytobands,
    defaultRegion,
    defaultTracks,
    publicHubList,
    publicHubData,
    annotationTracks,
    twoBitURL: 'https://vizhub.wustl.edu/public/hg19/hg19.2bit'
};

export default HG19;
