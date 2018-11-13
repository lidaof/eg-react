import Chromosome from '../Chromosome';
import Genome from '../Genome';
import TrackModel from '../../TrackModel';
import cytobands from './cytoBand.json';
import annotationTracks from "./annotationTracks.json";

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
const defaultRegion = navContext.parse("chr6:52425276-52425961");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "refGene",
        genome: "mm10",
    }),
    // new TrackModel({
    //     type: "geneAnnotation",
    //     name: "gencodeM19",
    //     genome: "mm10",
    // }),
    new TrackModel({
        type: "geneAnnotation",
        name: "gencodeM19Basic",
        genome: "mm10",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    // new TrackModel({
    //     type: "longrange",
    //     name: "ES-E14 ChIA-PET",
    //     url: "https://egg.wustl.edu/d/mm9/GSE28247_st3c.gz",
    // }),
    // new TrackModel({
    //     type: "biginteract",
    //     name: "test bigInteract",
    //     url: "https://epgg-test.wustl.edu/dli/long-range-test/interactExample3.inter.bb",
    // }),
    new TrackModel({
        type: 'repeatmasker',
        name: 'RepeatMasker',
        url: 'https://vizhub.wustl.edu/public/mm10/rmsk16.bb',
    }),
    // new TrackModel({
    //     type: 'refbed',
    //     name: 'refGene in refbed',
    //     url: 'https://wangftp.wustl.edu/~rsears/FOR_DAOFENG/gencodeM18_load_basic_Gene.bed.gz',
    // }),
    // new TrackModel({
    //     type: 'cool',
    //     name: 'Cool Track',
    //     url: 'CQMd6V_cRw6iCI_-Unl3PQ'
    // }),
];

const publicHubData = {
    "4D Nucleome Network": "The 4D Nucleome Network aims to understand the principles underlying nuclear " + 
    "organization in space and time, the role nuclear organization plays in gene expression and cellular function, " +
    "and how changes in nuclear organization affect normal development as well as various diseases.  The program is " +
    "developing novel tools to explore the dynamic nuclear architecture and its role in gene expression programs, " + 
    "models to examine the relationship between nuclear organization and function, and reference maps of nuclear" + 
    "architecture in a variety of cells and tissues as a community resource.",
    "Encyclopedia of DNA Elements (ENCODE)": "The Encyclopedia of DNA Elements (ENCODE) Consortium is an " +
        "international collaboration of research groups funded by the National Human Genome Research Institute " +
        "(NHGRI). The goal of ENCODE is to build a comprehensive parts list of functional elements in the human " +
        "genome, including elements that act at the protein and RNA levels, and regulatory elements that control " +
        "cells and circumstances in which a gene is active.",
};

const publicHubList = [
    {
        collection: "Encyclopedia of DNA Elements (ENCODE)",
        name: "Mouse ENCODE",
        numTracks: 1616,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/mm10/new/mm10encode2015",
        description: 'The Mouse ENCODE Consortium consisted of a number of Data Production Centers and made use of the human ENCODE Data Coordination Center (DCC) at the University of California, Santa Cruz (currently at Stanford University). Production Centers generally focused on different data types, including transcription     factor and polymerase occupancy, DNaseI hypersensitivity, histone modification, and RNA transcription.'
    },
    {
        collection: "4D Nucleome Network",
        name: "4DN HiC datasets",
        numTracks: 23,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/mm10/4dn_mm10.json",
        description: {
            'hub built by': 'Daofeng Li (dli23@wustl.edu)',
            'hub built date': 'Sep 1 2018',
            'hub built notes': 'metadata information are obtained directly from 4DN data portal'
        },
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
    annotationTracks,
};

export default MM10;
