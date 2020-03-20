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
        genome: "nCoV2019"
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler"
    }),
    new TrackModel({
        type: "bedgraph",
        name: "GC Percentage",
        url: "https://vizhub.wustl.edu/public/virus/ncov_CGpct.bedgraph.sort.gz"
    })
];

const annotationTracks = {
    Ruler: [
        {
            type: "ruler",
            label: "Ruler",
            name: "Ruler"
        }
    ],
    Genes: [
        {
            name: "ncbiGene",
            label: "NCBI genes",
            filetype: "geneAnnotation"
        }
    ],
    Assembly: [
        {
            type: "bedgraph",
            name: "GC Percentage",
            url: "https://vizhub.wustl.edu/public/virus/ncov_CGpct.bedgraph.sort.gz"
        }
    ],
    "Genome Comparison": [
        {
            name: "merstonCoV2019",
            label: "MERS to nCoV2019 alignment",
            querygenome: "MERS",
            filetype: "genomealign",
            url: "https://vizhub.wustl.edu/public/virus/ncov_mers.genomealign.gz"
        },
        {
            name: "sarstonCoV2019",
            label: "SARS to nCoV2019 alignment",
            querygenome: "SARS",
            filetype: "genomealign",
            url: "https://vizhub.wustl.edu/public/virus/ncov_sars.genomealign.gz"
        }
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
    ]
};

const publicHubData = {
    "SARS-CoV-2 database":
        "A database consisting all SARS-CoV-2 strains on NCBI Genbank, sequence diversity across all strains at each base pair, and CDC/non-CDC primers"
};

const publicHubList = [
    {
        collection: "SARS-CoV-2 database",
        name: "All NCBI Strains",
        numTracks: "keep updating",
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/updates/latest/browser_strains.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "hub info":
                "All SARS-CoV-2 strains available on NCBI. Aligned to reference genome (NC_045512.2) using EMBL 'stretcher'. Updated daily",
            "white space": "Matching the reference",
            "colored bars":
                "Variation from the reference. Details are color coded. Zoom in to click on the bar to see detail",
            "long stretches of rosy brown": "Unsequenced regions"
        }
    },
    {
        collection: "SARS-CoV-2 database",
        name: "Primers",
        numTracks: "keep updating",
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/primers/primers.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "hub info": "CDC primers and WHO non-CDC primers"
        }
    },
    {
        collection: "SARS-CoV-2 database",
        name: "Sequence Diversity",
        numTracks: "keep updating",
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/public_viralBrowser/ncov/daily_updates/latest/diversity.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "Diversity track":
                "The sequence diversity of each base pair on the genome across all the strains available on NCBI. Updated daily",
            "Nucleotide percentage track":
                "The percentage of A, T, C, G, nucleotides across all available strains at each base pair of the genome. Zoom in to nucleotide level to view",
            "Mutation alert track":
                "If a base pair is mutated from the reference genome in any of the available strains, it will be marked by a black bar."
        }
    }
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
    publicHubList
};

export default nCoV2019;
