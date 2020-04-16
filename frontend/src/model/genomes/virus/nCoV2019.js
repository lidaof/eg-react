import React from "react";
import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

const genome = new Genome("nCoV2019", [new Chromosome("NC_045512.2", 29903)]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("NC_045512.2:0-29903");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "nCoV2019",
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "bedgraph",
        name: "GC Percentage",
        url: "https://vizhub.wustl.edu/public/virus/ncov_CGpct.bedgraph.sort.gz",
    }),
];

const annotationTracks = {
    Ruler: [
        {
            type: "ruler",
            label: "Ruler",
            name: "Ruler",
        },
    ],
    Genes: [
        {
            name: "ncbiGene",
            label: "NCBI genes",
            filetype: "geneAnnotation",
        },
    ],
    Assembly: [
        {
            type: "bedgraph",
            name: "GC Percentage",
            url: "https://vizhub.wustl.edu/public/virus/ncov_CGpct.bedgraph.sort.gz",
        },
    ],
    "Genome Comparison": [
        {
            name: "merstonCoV2019",
            label: "MERS to nCoV2019 alignment",
            querygenome: "MERS",
            filetype: "genomealign",
            url: "https://vizhub.wustl.edu/public/virus/ncov_mers.genomealign.gz",
        },
        {
            name: "sarstonCoV2019",
            label: "SARS to nCoV2019 alignment",
            querygenome: "SARS",
            filetype: "genomealign",
            url: "https://vizhub.wustl.edu/public/virus/ncov_sars.genomealign.gz",
        },
        // {
        //     name: "pangolinCoVtonCoV2019",
        //     label: "pangolin CoV to nCoV2019 alignment",
        //     querygenome: "pangolin",
        //     filetype: "genomealign",
        //     url: "https://wangftp.wustl.edu/~dli/virusGateway/nCoV-pangolin.fa.genomealign1.gz"
        // },
        // {
        //     name: "batCoVtonCoV2019",
        //     label: "bat CoV to nCoV2019 alignment",
        //     querygenome: "bat",
        //     filetype: "genomealign",
        //     url: "https://wangftp.wustl.edu/~dli/virusGateway/nCoV-RaTG13.fa.genomealign1.gz"
        // }
    ],
};

const publicHubData = {
    "NCBI database":
        "A database consisting all SARS-CoV-2 strains on NCBI Genbank as well as sequence diversity across all strains at each base pair",
    Primers: "CDC/non-CDC primers for detecting SARS-CoV-2",
    "nextstrain database":
        "SNV tracks of all SARS-CoV-2 strains from nextstrain, displaying their sequence variation from the reference",
    "GISAID database":
        "SNV tracks of all SARS-CoV-2 strains from GISAID, displaying their sequence variation from the reference",
    "Recombination events": "Recombination events detected by junction-spanning RNA-seq",
    "SARS-CoV-2 Epitope Predictions Across HLA-1 Alleles (Campbell, et al. 2020) Database":
        "A database consisting of predicted epitope sequences in the SARS-CoV-2 genome that bind HLA-1 proteins.",
};

const publicHubList = [
    {
        collection: "NCBI database",
        name: "All NCBI Strains",
        numTracks: "keep updating",
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/updates/latest/browser_strains.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "hub info":
                "All SARS-CoV-2 strains available on NCBI. Aligned to reference genome (NC_045512.2) using EMBL 'stretcher'. Updated daily",
            "data source": "https://www.ncbi.nlm.nih.gov/nuccore",
            "white space": "Matching the reference",
            "colored bars":
                "Variation from the reference. Details are color coded. Zoom in to click on the bar to see detail",
            "long stretches of rosy brown": "Unsequenced regions",
        },
    },
    {
        collection: "Primers",
        name: "Primers",
        numTracks: "keep updating",
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/primers/primers.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "hub info": "CDC primers and WHO non-CDC primers",
            "data source:":
                "https://www.who.int/emergencies/diseases/novel-coronavirus-2019/technical-guidance/laboratory-guidance",
        },
    },
    {
        collection: "NCBI database",
        name: "Sequence Diversity",
        numTracks: 2,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/public_viralBrowser/ncov/daily_updates/latest/diversity.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "Diversity track":
                "The sequence diversity of each base pair on the genome across all the strains available on NCBI measured by Shannon entropy. Updated daily",
            "Mutation alert track":
                "If a base pair is mutated from the reference genome in any of the available strains, it will be marked by a black bar.",
        },
    },
    {
        collection: "nextstrain database",
        name: "All nextstrain SARS-CoV-2 isolates",
        numTracks: "keep updating",
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/nextstrain/latest/browser_strains.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "track type":
                "SNV tracks of all SARS-CoV-2 strains from nextstrain, displaying their sequence variation from the reference",
            "data source": "http://data.nextstrain.org/ncov.json",
        },
    },
    {
        collection: "GISAID database",
        name: "All GISAID SARS-CoV-2 isolates",
        numTracks: "keep updating",
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/latest/browser_strains.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 strains from GISAID, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "Recombination events",
        name: "Recombination events",
        numTracks: 2,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~gmatt/viralBrowser/recombinationEvents.json",
        description: {
            "hub built by": "Gavriel Matt (gavrielmatt@wustl.edu)",
            "hub info":
                "Recombination events detected by junction-spanning RNA-seq reads generated by (Kim et al., 2020; DOI: 10.1016/j.cell.2020.04.011). The color intensity of the arc corresponds to the number of reads supporting the recombination event.",
            "TRS-L-dependent recombination track": "Recombination events mediated by TRS-L. Scale 0-7000000 reads.",
            "TRS-L-independent recombination track": "Recombination events not mediated by TRS-L. Scale 0-1000 reads.",
        },
    },
    {
        collection: "SARS-CoV-2 HLA-1 Epitope Predictions (Campbell, et al. 2020) Database",
        name: "Epitope Predictions",
        numTracks: "1",
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~jflynn/virus_genome_browser/Campbell_et_al/campbell_et_al.json",
        description: {
            "hub built by": "Jennifer Flynn (jaflynn@wustl.edu)",
            "hub info": "Predicted SARS-CoV-2 epitopes that bind to class 1 HLA proteins.",
            values:
                "Values represent number of strains with the predicted epitope. Only epitope predictions with 100% sequence identity in SARS-CoV-2 are displayed.",
        },
    },
];

const nCoV2019 = {
    genome: genome,
    navContext: navContext,
    cytobands: {},
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    twoBitURL: "https://vizhub.wustl.edu/public/virus/nCoV2019.2bit",
    annotationTracks,
    publicHubData,
    publicHubList,
};

export default nCoV2019;
