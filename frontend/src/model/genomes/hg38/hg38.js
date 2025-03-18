import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../../model/TrackModel";
import cytobands from "./cytoBand.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("hg38", [
    new Chromosome("chr1", 248956422),
    new Chromosome("chr2", 242193529),
    new Chromosome("chr3", 198295559),
    new Chromosome("chr4", 190214555),
    new Chromosome("chr5", 181538259),
    new Chromosome("chr6", 170805979),
    new Chromosome("chr7", 159345973),
    new Chromosome("chr8", 145138636),
    new Chromosome("chr9", 138394717),
    new Chromosome("chr10", 133797422),
    new Chromosome("chr11", 135086622),
    new Chromosome("chr12", 133275309),
    new Chromosome("chr13", 114364328),
    new Chromosome("chr14", 107043718),
    new Chromosome("chr15", 101991189),
    new Chromosome("chr16", 90338345),
    new Chromosome("chr17", 83257441),
    new Chromosome("chr18", 80373285),
    new Chromosome("chr19", 58617616),
    new Chromosome("chr20", 64444167),
    new Chromosome("chr21", 46709983),
    new Chromosome("chr22", 50818468),
    new Chromosome("chrM", 16569),
    new Chromosome("chrX", 156040895),
    new Chromosome("chrY", 57227415),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr7:27053397-27373765");
const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "hg38",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "gencodeV47",
        genome: "hg38",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "MANE_select_1.4",
        label: "MANE selection v1.4",
        genome: "hg38",
    }),
    new TrackModel({
        type: "repeatmasker",
        name: "RepeatMasker",
        url: "https://vizhub.wustl.edu/public/hg38/rmsk16.bb",
    }),
];

const publicHubData = {
    "4D Nucleome Network":
        "The 4D Nucleome Network aims to understand the principles underlying nuclear organization " +
        "in space and time, the role nuclear organization plays in gene expression and cellular function, and how changes " +
        "in nuclear organization affect normal development as well as various diseases. The program is developing novel " +
        "tools to explore the dynamic nuclear architecture and its role in gene expression programs, " +
        "models to examine the relationship between nuclear organization and function, " +
        "and reference maps of nuclear architecture in a variety of cells and tissues as a community resource.",
    "Encyclopedia of DNA Elements (ENCODE)":
        "The Encyclopedia of DNA Elements (ENCODE) Consortium is an " +
        "international collaboration of research groups funded by the National Human Genome Research Institute " +
        "(NHGRI). The goal of ENCODE is to build a comprehensive parts list of functional elements in the human " +
        "genome, including elements that act at the protein and RNA levels, and regulatory elements that control " +
        "cells and circumstances in which a gene is active.",
    "SARS-CoV-2 Host Transcriptional Responses (Blanco-Melo, et al. 2020) Database":
        "A database consisting of host (human) transcriptional changes resulting from SARS-CoV-2 and other respiratory infections in in vitro, ex vivo, and in vivo systems.",
    "Reference human epigenomes from Roadmap Epigenomics Consortium":
        "The NIH Roadmap Epigenomics Mapping Consortium was launched with the goal of producing a public resource of human epigenomic data to catalyze basic biology and disease-oriented research. The Consortium leverages experimental pipelines built around next-generation sequencing technologies to map DNA methylation, histone modifications, chromatin accessibility and small RNA transcripts in stem cells and primary ex vivo tissues selected to represent the normal counterparts of tissues and organ systems frequently involved in human disease (quoted from Roadmap website).",
    "Image collection":
        "Image data from the Image Data Resource (IDR) or 4DN. Images are mapped to genomic coordinates with annotation gene id or symbol.",
    "Human Pangenome Reference Consortium (HPRC)":
        "The Human Pangenome Reference Consortium (HPRC) is a project funded by the National Human Genome Research Institute to sequence and assemble genomes from individuals from diverse populations in order to better represent genomic landscape of diverse human populations.",
};

const publicHubList = [
    {
        collection: "Human Pangenome Reference Consortium (HPRC)",
        name: "HPRC long read methylation data",
        numTracks: 12,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/modbed/hub.json",
        description: "modbed format methylation track on PacBio and ONT platforms, for 6 sample sources.",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "All Chromatin states tracks",
        numTracks: 352,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/roadmap_hmm.json",
        description:
            "include 15 state core model from observed data, 18 state expanded model from observed data and 25 state model from imputed data. Lifted from hg19 results.",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Roadmap ChIP-seq datasets",
        numTracks: 12494,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/Roadmap_hg38_ChIPseq_June2021.json",
        description: "Roadmap ChIP-seq data. Data are hosted by ENCODE data portal.",
    },
    {
        collection: "Reference human epigenomes from Roadmap Epigenomics Consortium",
        name: "Roadmap RNA-seq, WGBS etc. datasets",
        numTracks: 5586,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/Roadmap_hg38_others_June2021.json",
        description: "Roadmap RNA-seq, WGBS etc. Data are hosted by ENCODE data portal.",
    },
    {
        collection: "Image collection",
        name: "IDR image data",
        numTracks: 28,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/imagetrack/hg38/hg38.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "total number of images": 539977,
            "hub built notes": "covered 28 human datasets from IDR",
        },
    },
    {
        collection: "Image collection",
        name: "4dn image data",
        numTracks: 1,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/imagetrack/hg38/4dn/hg38.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "total number of images": 601,
            "hub built notes": "mixed image datasets for hg38 in 4dn",
        },
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE signal of unique reads",
        numTracks: 5230,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/new/mpssur_GRCh38.json",
        description: "signal of unique reads.",
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "ENCODE signal of all reads",
        numTracks: 5230,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/new/mpssar_GRCh38.json",
        description: "signal of all reads.",
    },
    {
        collection: "4D Nucleome Network",
        name: "4DN datasets",
        numTracks: 2876,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/4dn/4dn-GRCh38-July2021.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "last update": "Jul 14 2021",
            "hub built notes": "metadata information are obtained directly from 4DN data portal",
        },
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "Human ENCODE from ENCODE data portal",
        numTracks: 38092,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/new/GRCh38_encode_human_bigwig_metadata_nov142018.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "hub built date": "Nov 14 2018",
            "hub built notes":
                "metadata information are obtained directly from ENCODE data portal, track files are hosted by ENCODE data portal as well",
        },
    },
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "Human ENCODE HiC from ENCODE data portal",
        numTracks: 20,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/new/GRCh38_encode_human_hic_metadata_nov142018.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "hub built date": "Nov 14 2018",
            "hub built notes":
                "metadata information are obtained directly from ENCODE data portal, track files are hosted by ENCODE data portal as well",
        },
    },
    {
        collection: "International Human Epigenome Consortium (IHEC) ",
        name: "International Human Epigenome Consortium (IHEC) epigenomic datasets",
        numTracks: 6800,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/hg38/new/ihec-hg38-urls.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "hub built date": "Nov 30 2018",
            "hub built notes": "track files are hosted by IHEC data portal",
        },
    },
    {
        collection: "HiC interaction from HiGlass",
        name: "HiC interaction from HiGlass",
        numTracks: 39,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~dli/eg-hubs/higlass/2019/hg38_cool.json",
    },
    {
        collection: "SARS-CoV-2 Host Transcriptional Responses (Blanco-Melo, et al. 2020) Database",
        name: "Human Transcriptional Responses to SARS-CoV-2 and Other Respiratory Infections",
        numTracks: 195,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~jflynn/virus_genome_browser/Blanco_melo_et_al/blanco_melo_et_al.json",
        description: {
            "hub built by": "Jennifer Flynn (jaflynn@wustl.edu)",
            "hub info":
                "Host (human) transcriptional responses to SARS-CoV-2 and other respriatory infections. Aligned to reference genome hg38 using STAR, after first removing mitochondrial and rRNA reads",
            values: "bigWig output from STAR alignment",
        },
    },
];

const HG38 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/hg38/hg38.2bit",
    publicHubData,
    publicHubList,
    annotationTracks,
};

export default HG38;
