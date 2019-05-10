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
    // new TrackModel({
    //     type: "bigwig",
    //     name: "test bigwig",
    //     url: "https://vizhub.wustl.edu/hubSample/hg19/GSM429321.bigWig",
    // }),
    new TrackModel({
        type: 'geneAnnotation',
        name: 'gencodeV29',
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
    // new TrackModel({
    //     type: "bam",
    //     name: "Test bam",
    //     url: "https://wangftp.wustl.edu/~dli/test/a.bam"
    // }),
    // new TrackModel({
    //     type: 'bigbed',
    //     name: 'test bigbed',
    //     url: 'https://vizhub.wustl.edu/hubSample/hg19/bigBed1'
    // }),
    // new TrackModel({
    //     type: "methylc",
    //     name: "Methylation",
    //     url: "https://vizhub.wustl.edu/public/hg19/methylc2/h1.liftedtohg19.gz"
    // }),
    // new TrackModel({
    //     type: "categorical",
    //     name: "ChromHMM",
    //     url: "https://egg.wustl.edu/d/hg19/E017_15_coreMarks_dense.gz",
    //     options: {
    //         category: {
    //             "1": {name: "Active TSS", color: "#ff0000"},
    //             "2": {name: "Flanking Active TSS", color: "#ff4500"},
    //             "3": {name: "Transcr at gene 5' and 3'", color: "#32cd32"},
    //             "4": {name: "Strong transcription", color: "#008000"},
    //             "5": {name: "Weak transcription", color: "#006400"},
    //             "6": {name: "Genic enhancers", color: "#c2e105"},
    //             "7": {name: "Enhancers", color: "#ffff00"},
    //             "8": {name: "ZNF genes & repeats", color: "#66cdaa"},
    //             "9": {name: "Heterochromatin", color: "#8    a91d0"},
    //             "10": {name: "Bivalent/Poised TSS", color: "#cd5c5c"},
    //             "11": {name: "Flanking Bivalent TSS/Enh", color: "#e9967a"},
    //             "12": {name: "Bivalent Enhancer", color: "#bdb76b"},
    //             "13": {name: "Repressed PolyComb", color: "#808080"},
    //             "14": {name: "Weak Repressed PolyComb", color: "#c0c0c0"},
    //             "15": {name: "Quiescent/Low", color: "#ffffff"}
    //           }
    //     }
    // }),
    // new TrackModel({
    //     type: "hic",
    //     name: "test hic",
    //     url: "https://epgg-test.wustl.edu/dli/long-range-test/test.hic",
    //     options: {
    //         displayMode: 'arc'
    //     }
    // }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    // new TrackModel({
    //     name: 'hg19 to mm10 alignment',
    //     type: "genomealign",
    //     metadata: {
    //         genome: 'mm10'
    //     }
    // }),
    // new TrackModel({
    //     type: 'geneAnnotation',
    //     name: 'refGene',
    //     genome: 'mm10',
    //     options: {
    //         maxRows: 10
    //     },
    //     metadata: {
    //         genome: 'mm10'
    //     }
    // }),
    // new TrackModel({
    //     name: 'mm10 bigwig',
    //     type: "bigwig",
    //     url: "https://epgg-test.wustl.edu/d/mm10/ENCFF577HVF.bigWig",
    //     metadata: {
    //         genome: 'mm10'
    //     }
    // }),
    // new TrackModel({
    //     type: "ruler",
    //     name: "mm10 Ruler",
    //     metadata: {
    //         genome: 'mm10'
    //     }
    // }),
    // new TrackModel({
    //     type: "bed",
    //     name: "mm10 bed",
    //     url: "https://wangftp.wustl.edu/~rsears/Stuart_Little/ATAC_080818/Bruce4_sub120_extendedto120_DownSample.bed.gz",
    //     metadata: {
    //         genome: "mm10"
    //     }
    // })
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
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Roadmap Data from GEO",
        numTracks: 2728,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap9_methylC.md",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "methylCRF tracks from Roadmap",
        numTracks: 16,
        oldHubFormat: false,
        description: "Single CpG methylation value prediction by methylCRF algorithm (PMID:23804401) using Roadmap data.",
        url: "https://vizhub.wustl.edu/public/hg19/new/methylCRF.roadmap.hub"
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Observed DNase and ChIP-seq Pvalue and Normalized RPKM RNAseq signal tracks",
        numTracks: 1136,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap_consolidated_02182015.json.md.pvalsig",
        description: "Observed data Pvalue tracks for DNase and ChIP-seq, and Normalized RPKM signal tracks for RNAseq",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Observed DNase and ChIP-seq Fold-change and Normalized RPKM RNAseq signal tracks",
        numTracks: 1136,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap_consolidated_02182015.json.md.fcsig",
        description: "Observed data Fold-change tracks for DNase and ChIP-seq, and Normalized RPKM signal tracks for RNAseq",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "All Chromatin states tracks",
        numTracks: 352,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap_consolidated_02182015.json.md.hmm",
        description: "include 15 state core model from observed data, 18 state expanded model from observed data and 25 state model from imputed data",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Imputed data signal tracks",
        numTracks: 4315,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap_consolidated_02182015.json.md.impsig",
        description: "All data types (histone, DNase, RNA and methylation)",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Unconsolidated epigenomes, Observed DNase and ChIP-seq Pvalue signal tracks",
        numTracks: 1915,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap_unconsolidated_02182015.json.md.pvalsig",
        description: "For the unconsolidated epigenomes, observed data Pvalue tracks for DNase and ChIP-seq",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Unconsolidated epigenomes, Observed DNase and ChIP-seq Fold-change signal tracks",
        numTracks: 1915,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap_unconsolidated_02182015.json.md.fcsig",
        description: "For the unconsolidated epigenomes,observed data Fold-change tracks for DNase and ChIP-seq",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Complete Consolidated dataset",
        numTracks: 18181,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap_consolidated_02182015.json.md",
        description: "This is the complete set of Roadmap Epigenomics Integrative Analysis Hub. Consolidated refer to the 127 reference epigenomes that uses additional steps of pooling and subsampling and these are the ones used in the paper. All data types were reprocessed for the consolidated epigenomes.Also please     refer to <a href=https://egg2.wustl.edu/roadmap/web_portal/ target=_blank>web portal</a> if get slow loading of this hub.",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Roadmap Epigenomics Analysis Hub Unconsolidated set",
        numTracks: 9990,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/roadmap_unconsolidated_02182015.json.md",
        description: "Unconsolidated data is basically all the ChIP-seq and DNase Release 9 data at the EDACC as it was except filtered for 36 bp read length mappability and processed to create peak calls and signal tracks.",
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "Human ENCODE from ENCODE data portal",
        numTracks: 48657,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/hg19_encode_human_bigwig_metadata_nov142018.json",
        description: {
            'hub built by': 'Daofeng Li (dli23@wustl.edu)',
            'hub built date': 'Nov 14 2018',
            'hub built notes': 'metadata information are obtained directly from ENCODE data portal, track files are hosted by ENCODE data portal as well'
        },
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "Human ENCODE HiC from ENCODE data portal",
        numTracks: 104,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/hg19_encode_human_hic_metadata_nov142018.json",
        description: {
            'hub built by': 'Daofeng Li (dli23@wustl.edu)',
            'hub built date': 'Nov 14 2018',
            'hub built notes': 'metadata information are obtained directly from ENCODE data portal, track files are hosted by ENCODE data portal as well'
        },
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE signal of unique reads",
        numTracks: 7729,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/hg19_mpssur.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE signal of all reads",
        numTracks: 7842,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/hg19_mpssar.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE all other types",
        numTracks: 5937,
        oldHubFormat: false,
        description: "Base overlap signal, fold change over control, genome compartments, percentage normalized signal, etc.",
        url: "https://vizhub.wustl.edu/public/hg19/new/hg19_other_rmdup.json"
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE legacy hub",
        numTracks: 4253,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/encode.md"
    },
    {
        collection: "International Human Epigenome Consortium (IHEC) ",
        name: "International Human Epigenome Consortium (IHEC) epigenomic datasets",
        numTracks: 15097,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/ihec-hg19-urls.json",
        description: {
            'hub built by': 'Daofeng Li (dli23@wustl.edu)',
            'hub built date': 'Nov 30 2018',
            'hub built notes': 'track files are hosted by IHEC data portal'
        },
    },
    {
        collection: "Long-range chromatin interaction experiments",
        name: "Long-range chromatin interaction experiments",
        numTracks: 156,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/longrange4"
    },
    {
        collection: "HiC interaction from Juicebox",
        name: "HiC interaction from Juicebox",
        numTracks: 202,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/hg19-juiceboxhub"
    },
    {
        collection: "HiC interaction from HiGlass",
        name: "HiC interaction from HiGlass",
        numTracks: 41,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/hg19_cool.json"
    },
    {
        collection: "Human 450K and 27K array data from TCGA",
        name: "Human 450K and 27K array data from TCGA",
        numTracks: 2551,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg19/new/TCGA-450k-hub2"
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
