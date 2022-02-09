import React from "react";
import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

const genome = new Genome("SARS-CoV-2", [new Chromosome("NC_045512.2", 29903)]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("NC_045512.2:0-29903");

const defaultTracks = [
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
    new TrackModel({
        type: "geneAnnotation",
        name: "ncbiGene",
        label: "NCBI genes",
        genome: "SARS-CoV-2",
    }),
    new TrackModel({
        type: "categorical",
        name: "S protein annotations",
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/v2/others/hubs/gmatt/sars-cov-2_Sprot_annot_sorted.bed.gz",
        options: {
            height: 20,
            alwaysDrawLabel: true,
            maxRows: 100,
            hiddenPixels: 0,
            category: {
                "receptor-binding domain (RBD)": {
                    name: "Binds to the ACE2 receptor (PMID: 32225176)",
                    color: "#FF0000",
                },
                "receptor-binding motif (RBM)": {
                    name: "Interacts directly with the ACE2 receptor (PMID: 32225176)",
                    color: "#FFC300",
                },
                "S1,S2 cleavage site": {
                    name: "Cleavage at this site generates the S1 and S2 subunits of the S protein (PMID: 32155444, 32532959)",
                    color: "#18872F",
                },
                "heptad repeat 1 (HR1)": {
                    name: "Mediates membrane fusion and viral entry into host cell (PMID: 32376627)",
                    color: "#0000FF",
                },
                "heptad repeat 2 (HR2)": {
                    name: "Mediates membrane fusion and viral entry into host cell (PMID: 32376627)",
                    color: "#0000FF",
                },
            },
        },
    }),
    new TrackModel({
        type: "bedgraph",
        name: "Sequence Diversity (Shannon Entropy)",
        url: "https://wangftp.wustl.edu/~cfan/gisaid/latest/diversity/ncov_entropy.bedgraph.sort.gz",
        options: {
            aggregateMethod: "MAX",
            height: 50,
        },
    }),
    // new TrackModel({
    //     type: "qbed",
    //     name: "Mutation Alert",
    //     url: "https://wangftp.wustl.edu/~cfan/gisaid/latest/diversity/ncov_alert.bed.sort.gz",
    //     options: {
    //         height: 60,
    //         color: "darkgreen",
    //     },
    // }),
    new TrackModel({
        name: "Viral RNA expression (nanopore)",
        type: "bigwig",
        url: "https://vizhub.wustl.edu/public/virus/VeroInf24h.bw",
        options: {
            zoomLevel: "0",
        },
    }),
    new TrackModel({
        type: "bed",
        name: "Putative SARS Immune Epitopes",
        url: "https://wangftp.wustl.edu/~mchoudhary/viralBrowser/IEDB_NC_045512.2_SARS-tblastn-nCoV_3H3V6ZBF01R.bed.gz",
        options: {
            color: "#9013fe",
            displayMode: "density",
            height: 60,
        },
    }),
    new TrackModel({
        type: "categorical",
        name: "Omicron: B.1.1.529 and BA lineages",
        url: "https://wangftp.wustl.edu/~jflynn/virus_genome_browser/variants_of_concern/Omicron_B.1.1.529_and_BA_lineages.bed.gz",
        options: {
            height: 20,
            alwaysDrawLabel: true,
            maxRows: 100,
            hiddenPixels: 0,
            category: {
                A67V: { name: "A67V", color: "#F00A0A" },
                "del69-70": { name: "del69-70", color: "#F00A0A" },
                T95I: { name: "T95I", color: "#F00A0A" },
                "del142-144": { name: "del142-144", color: "#F00A0A" },
                Y145D: { name: "Y145D", color: "#F00A0A" },
                del211: { name: "del211", color: "#F00A0A" },
                L212I: { name: "L212I", color: "#F00A0A" },
                ins214EPE: { name: "ins214EPE", color: "#F00A0A" },
                G339D: { name: "G339D", color: "#F00A0A" },
                S371L: { name: "S371L", color: "#F00A0A" },
                S373P: { name: "S373P", color: "#F00A0A" },
                K417N: { name: "K417N", color: "#F00A0A" },
                N440K: { name: "N440K", color: "#F00A0A" },
                G446S: { name: "G446S", color: "#F00A0A" },
                S477N: { name: "S477N", color: "#F00A0A" },
                T478K: { name: "T478K", color: "#F00A0A" },
                E484A: { name: "E484A", color: "#F00A0A" },
                Q493R: { name: "Q493R", color: "#F00A0A" },
                G496S: { name: "G496S", color: "#F00A0A" },
                Q498R: { name: "Q498R", color: "#F00A0A" },
                N501Y: { name: "N501Y", color: "#F00A0A" },
                Y505H: { name: "Y505H", color: "#F00A0A" },
                T547K: { name: "T547K", color: "#F00A0A" },
                D614G: { name: "D614G", color: "#F00A0A" },
                H655Y: { name: "H655Y", color: "#F00A0A" },
                N679K: { name: "N679K", color: "#F00A0A" },
                P681H: { name: "P681H", color: "#F00A0A" },
                N764K: { name: "N764K", color: "#F00A0A" },
                D796Y: { name: "D796Y", color: "#F00A0A" },
                N856K: { name: "N856K", color: "#F00A0A" },
                Q954H: { name: "Q954H", color: "#F00A0A" },
                N969K: { name: "N969K", color: "#F00A0A" },
                L981F: { name: "L981F", color: "#F00A0A" },
            },
        },
        details: {
            "data source": "CDC: https://www.cdc.gov/coronavirus/2019-ncov/variants/variant-classifications.html",
            description:
                "Omicron: B.1.1.529 and BA lineages are classified as a Variant of Concern by the CDC as of Dec 23, 2021. This track displays all associated Spike portein substitutions.",
        },
    }),
    new TrackModel({
        type: "categorical",
        name: "Transcription regulatory sequences (TRSs)",
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/v2/others/hubs/gmatt/sars-cov-2_trs_sorted.bed.gz",
        options: {
            height: 15,
            alwaysDrawLabel: true,
            maxRows: 20,
            hiddenPixels: 0,
            category: {
                "TRS-L": { name: "TRS-L", color: "#000000" },
                "TRS-B": { name: "TRS-B", color: "#FF0000" },
            },
        },
    }),
    new TrackModel({
        type: "categorical",
        name: "Protein_domains",
        url: "https://epigenome.wustl.edu/SARS-CoV-2/uniprot//Protein_domains.cat.gz",
        options: {
            height: 20,
            alwaysDrawLabel: true,
            maxRows: 100,
            hiddenPixels: 0,
            category: {
                "Ubiquitin-like 1": {
                    name: "Ubiquitin-like 1",
                    color: "#F8766D",
                },
                DPUP: {
                    name: "DPUP",
                    color: "#F27D52",
                },
                "ExoN/MTase coa...": {
                    name: "ExoN/MTase coa...",
                    color: "#EA842F",
                },
                "Ubiquitin-like 2": {
                    name: "Ubiquitin-like 2",
                    color: "#E18A00",
                },
                "Macro 2": {
                    name: "Macro 2",
                    color: "#D79000",
                },
                "CV ZBD": {
                    name: "CV ZBD",
                    color: "#CB9600",
                },
                "Nsp15 N-termin...": {
                    name: "Nsp15 N-termin...",
                    color: "#BE9C00",
                },
                "+)RNA virus he...": {
                    name: "+)RNA virus he...",
                    color: "#B0A100",
                },
                "zinc finger": {
                    name: "zinc finger",
                    color: "#9FA600",
                },
                "RdRp Nsp8 cofa...": {
                    name: "RdRp Nsp8 cofa...",
                    color: "#8CAB00",
                },
                "CoV 3a-like vi...": {
                    name: "CoV 3a-like vi...",
                    color: "#75AF00",
                },
                "AV-Nsp11N/CoV-...": {
                    name: "AV-Nsp11N/CoV-...",
                    color: "#58B300",
                },
                "Nidovirus-type...": {
                    name: "Nidovirus-type...",
                    color: "#24B700",
                },
                "Nsp9 ssRNA-bin...": {
                    name: "Nsp9 ssRNA-bin...",
                    color: "#00BA38",
                },
                "N7-MTase": {
                    name: "N7-MTase",
                    color: "#00BC58",
                },
                ExoN: {
                    name: "ExoN",
                    color: "#00BE70",
                },
                "SARS ORF8 Ig-like": {
                    name: "SARS ORF8 Ig-like",
                    color: "#00C086",
                },
                NendoU: {
                    name: "NendoU",
                    color: "#00C199",
                },
                "BetaCoV Nsp1 C...": {
                    name: "BetaCoV Nsp1 C...",
                    color: "#00C1AB",
                },
                "BetaCoV S1-NTD": {
                    name: "BetaCoV S1-NTD",
                    color: "#00C0BC",
                },
                "RdRp Nsp7 cofa...": {
                    name: "RdRp Nsp7 cofa...",
                    color: "#00BECC",
                },
                "Peptidase C30": {
                    name: "Peptidase C30",
                    color: "#00BBDA",
                },
                X4e: {
                    name: "X4e",
                    color: "#00B7E7",
                },
                "Nsp12 RNA-depe...": {
                    name: "Nsp12 RNA-depe...",
                    color: "#00B2F3",
                },
                "CoV N NTD": {
                    name: "CoV N NTD",
                    color: "#00ACFC",
                },
                "CoV N CTD": {
                    name: "CoV N CTD",
                    color: "#00A5FF",
                },
                "Macro 1": {
                    name: "Macro 1",
                    color: "#619CFF",
                },
                "9b": {
                    name: "9b",
                    color: "#8B93FF",
                },
                "Macro 3": {
                    name: "Macro 3",
                    color: "#A989FF",
                },
                NiRAN: {
                    name: "NiRAN",
                    color: "#C27FFF",
                },
                "RdRp catalytic": {
                    name: "RdRp catalytic",
                    color: "#D575FE",
                },
                "Nucleic acid-b...": {
                    name: "Nucleic acid-b...",
                    color: "#E56DF5",
                },
                "Virion surface": {
                    name: "Virion surface",
                    color: "#F066EA",
                },
                "BetaCoV S1-CTD": {
                    name: "BetaCoV S1-CTD",
                    color: "#F962DD",
                },
                "Peptidase C16": {
                    name: "Peptidase C16",
                    color: "#FE61CE",
                },
                Lumenal: {
                    name: "Lumenal",
                    color: "#FF62BD",
                },
                "CoV Nsp1 globular": {
                    name: "CoV Nsp1 globular",
                    color: "#FF65AC",
                },
                Intravirion: {
                    name: "Intravirion",
                    color: "#FF6A99",
                },
                Nsp4C: {
                    name: "Nsp4C",
                    color: "#FD7084",
                },
            },
        },
    }),
    // new TrackModel({
    //     type: "longrange",
    //     name: "TRS-L-dependent recombination",
    //     url: "https://wangftp.wustl.edu/~cfan/viralBrowser/v2/others/hubs/gmatt/TRS-L-dependent_recombinationEvents_sorted.bed.gz",
    //     options: {
    //         yScale: "fixed",
    //         yMax: 7000000,
    //         yMin: 0,
    //         displayMode: "arc",
    //         lineWidth: 3,
    //         height: 205,
    //         greedyTooltip: true,
    //     },
    // }),
    // new TrackModel({
    //     type: "dbedgraph",
    //     name: "Viral RNA Modifications",
    //     url: "https://wangftp.wustl.edu/~mchoudhary/viralBrowser/studies/kim-2020/Table_S5_frac.dbg.gz",
    //     options: {
    //         dynamicLabels: ["gRNA", "S", "3a", "E", "M", "6", "7a", "7b", "8", "N"],
    //         speed: [3],
    //     },
    //     showOnHubLoad: true,
    // }),
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
            genome: "SARS-CoV-2",
        },
    ],
    Proteins: [
        {
            type: "categorical",
            name: "S protein annotations",
            url: "https://wangftp.wustl.edu/~cfan/viralBrowser/v2/others/hubs/gmatt/sars-cov-2_Sprot_annot_sorted.bed.gz",
            options: {
                height: 20,
                alwaysDrawLabel: true,
                maxRows: 100,
                hiddenPixels: 0,
                category: {
                    "receptor-binding domain (RBD)": {
                        name: "Binds to the ACE2 receptor (PMID: 32225176)",
                        color: "#FF0000",
                    },
                    "receptor-binding motif (RBM)": {
                        name: "Interacts directly with the ACE2 receptor (PMID: 32225176)",
                        color: "#FFC300",
                    },
                    "S1,S2 cleavage site": {
                        name: "Cleavage at this site generates the S1 and S2 subunits of the S protein (PMID: 32155444, 32532959)",
                        color: "#18872F",
                    },
                    "heptad repeat 1 (HR1)": {
                        name: "Mediates membrane fusion and viral entry into host cell (PMID: 32376627)",
                        color: "#0000FF",
                    },
                    "heptad repeat 2 (HR2)": {
                        name: "Mediates membrane fusion and viral entry into host cell (PMID: 32376627)",
                        color: "#0000FF",
                    },
                },
            },
        },
    ],
    Assembly: [
        {
            type: "bedgraph",
            name: "GC Percentage",
            url: "https://vizhub.wustl.edu/public/virus/ncov_CGpct.bedgraph.sort.gz",
        },
    ],
    Diversity: [
        {
            type: "bedgraph",
            name: "Sequence Diversity (Shannon Entropy)",
            url: "https://wangftp.wustl.edu/~cfan/gisaid/latest/diversity/ncov_entropy.bedgraph.sort.gz",
            options: {
                aggregateMethod: "MAX",
            },
        },
        {
            type: "qbed",
            name: "Mutation Alert",
            url: "https://wangftp.wustl.edu/~cfan/gisaid/latest/diversity/ncov_alert.bed.sort.gz",
        },
    ],
    "Genome Comparison": [
        {
            name: "merstonCoV2019",
            label: "MERS to SARS-CoV-2 alignment",
            querygenome: "MERS",
            filetype: "genomealign",
            url: "https://vizhub.wustl.edu/public/virus/ncov_mers.genomealign.gz",
        },
        {
            name: "sarstonCoV2019",
            label: "SARS to SARS-CoV-2 alignment",
            querygenome: "SARS",
            filetype: "genomealign",
            url: "https://vizhub.wustl.edu/public/virus/ncov_sars.genomealign.gz",
        },
        {
            name: "pangolinCoVtonCoV2019",
            label: "pangolin CoV to SARS-CoV-2 alignment",
            querygenome: "pangolin",
            filetype: "genomealign",
            url: "https://wangftp.wustl.edu/~dli/virusGateway/nCoV-pangolin.fa.genomealign1.gz",
        },
        {
            name: "batCoVtonCoV2019",
            label: "bat CoV to SARS-CoV-2 alignment",
            querygenome: "bat",
            filetype: "genomealign",
            url: "https://wangftp.wustl.edu/~dli/virusGateway/nCoV-RaTG13.fa.genomealign1.gz",
        },
    ],
};

const publicHubData = {
    "UniProt protein annotation": (
        <span>
            compiled by{" "}
            <a
                href="https://genome.ucsc.edu/cgi-bin/hgTables?hgsid=1276980573_aa3KBxjbtSRpAuTf9vi5WxRKX9b8&clade=virus&org=SARS-CoV-2&db=wuhCor1&hgta_group=uniprot&hgta_track=ncbiGeneBGP&hgta_table=0&hgta_regionType=range&position=NC_045512v2%3A1-29%2C903&hgta_outputType=primaryTable&hgta_outFileName="
                target="_blank"
                rel="noopener noreferrer"
            >
                UCSC
            </a>
        </span>
    ),
    "NCBI database":
        "SNV tracks of all SARS-CoV-2 strains on NCBI Genbank displaying their sequence variation from reference",
    "Nextstrain database":
        "SNV tracks of all SARS-CoV-2 strains from Nextstrain, displaying their sequence variation from the reference",
    "GISAID database":
        "SNV tracks of SARS-CoV-2 strains from GISAID, displaying their sequence variation from the reference",
    Diagnostics: "Primers, gRNAs, etc. for diagnostic tests",
    "Epitope predictions": "SARS-CoV-2 Epitope Predictions Across HLA-1 Alleles",
    "Recombination events": "Recombination events detected by junction-spanning RNA-seq",
    "Viral RNA modifications": "RNA modifications detected using Nanopore direct RNA sequencing",
    "Viral RNA expression": "Viral RNA expression measured by Nanopore",
    "Sequence variation": "Demo tracks for using the browser to study sequence variation and diversity across strains",
    "Putative SARS-CoV-2 Immune Epitopes":
        "Datahubs with tracks providing predicted epitope sequences across the SARS-CoV-2 reference genome",
    "Image data from IDR": "Images from IDR (https://idr.openmicroscopy.org/)",
    "SARS-CoV-2 CRISPR Screen Database":
        "A database containing tracks displaying the log2 fold changes and p-values in SARS-CoV-2 infected populations vs uninfected control.",
    "Variants of Interest and Variants of Concern":
        "A database containing all 8 SARS-CoV-2 Variants of Interest and all 5 Variants of Concern, as defined by the CDC as of May 25, 2021: https://www.cdc.gov/coronavirus/2019-ncov/variants/variant-info.html#Interest",
};

const publicHubList = [
    {
        collection: "UniProt protein annotation",
        name: "UniProt protein annotation",
        numTracks: 13,
        oldHubFormat: false,
        url: "https://epigenome.wustl.edu/SARS-CoV-2/uniprot/tracks.json",
        description: {
            "data source":
                "compiled by ucsc, assessed through https://genome.ucsc.edu/cgi-bin/hgTables?hgsid=1276980573_aa3KBxjbtSRpAuTf9vi5WxRKX9b8&clade=virus&org=SARS-CoV-2&db=wuhCor1&hgta_group=uniprot&hgta_track=ncbiGeneBGP&hgta_table=0&hgta_regionType=range&position=NC_045512v2%3A1-29%2C903&hgta_outputType=primaryTable&hgta_outFileName=",
        },
    },
    {
        collection: "SARS-CoV-2 CRISPR Screen Database",
        name: "SARS-CoV-2 CRISPR Screen Database",
        numTracks: 12,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~jflynn/virus_genome_browser/crispr_screen/crispr_screen.json",
        description: {
            "hub built by": "Jennifer Karlow (Flynn) (jaflynn@wustl.edu)",
            "data source":
                "Baggen, J., Persoons, L., Vanstreels, E. et al. Genome-wide CRISPR screening identifies TMEM106B as a proviral host factor for SARS-CoV-2. Nat Genet 53, 435–444 (2021). https://doi.org/10.1038/s41588-021-00805-2",
            "hub info":
                "This datahub contains 12 tracks - 4 for each stringency/adjustment levels: one showing log2 fold change values and the other 3 showing p-values for SARS-CoV-2 infected populations vs uninfected controls (14 days after exposure). The data displayed are from Supplementary Table 11: Supplementary Table 11. SARS-CoV-2 low stringency screen - gene-level analysis SARS-CoV-2 versus control - adjusted, Supplementary Table 7: Supplementary Table 7. SARS-CoV-2 high stringency screen - gene-level analysis, and Supplementary Table 10. SARS-CoV-2 low stringency screen - gene-level analysis SARS-CoV-2 versus control.",
        },
    },
    {
        collection: "Variants of Interest and Variants of Concern",
        name: "Variants of Interest and Variants of Concern",
        numTracks: 13,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~jflynn/virus_genome_browser/variants_of_concern/voi_and_voc.json",
        description: {
            "hub built by": "Jennifer Karlow (Flynn) (jaflynn@wustl.edu)",
            "hub info":
                "A database containing all 8 SARS-CoV-2 Variants of Interest and all 5 Variants of Concern, as defined by the CDC as of May 25, 2021: https://www.cdc.gov/coronavirus/2019-ncov/variants/variant-info.html#Interest",
        },
    },
    {
        collection: "Diagnostics",
        name: "Primers",
        numTracks: 9,
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
        collection: "Diagnostics",
        name: "CRISPR-based diagnostic tests",
        numTracks: 2,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/v2/others/hubs/gmatt/crispr_diagnostic_tests.json",
        description: {
            "hub built by": "Gavriel Matt (gavrielmatt@wustl.edu)",
            "hub info": "CRISPR-based assays for detecting SARS-CoV-2.",
            "SHERLOCK diagnostic test track":
                "Primer and guide RNA sequences used in the CRISPR-Cas13a-based SHERLOCK assay for detecting SARS-CoV-2 (source: https://www.broadinstitute.org/files/publications/special/COVID-19%20detection%20(updated).pdf; accessed on 05-08-20).",
            "DETECTR diagnostic test track":
                "Primer and guide RNA sequences used in the CRISPR-Cas12-based DETECTR assay for detecting SARS-CoV-2 (source: Broughton et al., 2020; doi: https://doi.org/10.1038/s41587-020-0513-4).",
        },
    },
    {
        collection: "Putative SARS-CoV-2 Immune Epitopes",
        name: "SARS-CoV-2 Epitopes Predicted to Bind HLA Class 1 Proteins Database",
        numTracks: 1,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~jflynn/virus_genome_browser/Campbell_et_al/campbell_et_al.json",
        description: {
            "hub built by": "Jennifer Flynn (jaflynn@wustl.edu)",
            "hub info": "Predicted SARS-CoV-2 epitopes that bind to class 1 HLA proteins",
            values: "Values represent number of strains with the predicted epitope. Only epitope predictions with 100% sequence identity in SARS-CoV-2 are displayed.",
            "data source": "Campbell, et al. (2020) pre-print (DOI: 10.1101/2020.03.30.016931)",
        },
    },
    {
        collection: "Putative SARS-CoV-2 Immune Epitopes",
        name: "Congeneric (or Closely-related) Putative SARS Immune Epitopes Locations (this publication)",
        numTracks: 1,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~mchoudhary/viralBrowser/IEDB_NC_045512.2_SARS-tblastn-nCoV_3H3V6ZBF01R.hub",
        description: {
            "hub built by": "Mayank Choudhary (mayank-choudhary@wustl.edu)",
            "hub info":
                "Congeneric (or closely-related) putative SARS linear immune epitopes catalogued in IEDB mapped to exact-match locations in SARS-CoV-2",
        },
    },
    {
        collection: "Putative SARS-CoV-2 Immune Epitopes",
        name: "Putative SARS-CoV-2 Epitopes",
        numTracks: 14,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~mchoudhary/viralBrowser/SARS-CoV-2_immune_epitopes.hub",
        description: {
            "hub built by": "Mayank Choudhary (mayank-choudhary@wustl.edu)",
            "hub info": "SARS-CoV-2 Immune Epitopes from various pre-prints and publications",
        },
    },
    {
        collection: "Recombination events",
        name: "Recombination events (Kim et al., 2020)",
        numTracks: 3,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/v2/others/hubs/gmatt/recombinationEvents.json",
        description: {
            "hub built by": "Gavriel Matt (gavrielmatt@wustl.edu)",
            "hub info":
                "Coordinates of transcription regulatory sequences (TRSs) were retrieved from (Wu et al., 2020; DOI: 10.1038/s41586-020-2008-3). Recombination events were detected by junction-spanning RNA-seq reads that were generated by (Kim et al., 2020; DOI: 10.1016/j.cell.2020.04.011). The color intensity of the arc corresponds to the number of reads supporting the recombination event.",
            TRS: "Transcription regulatory sequences (TRSs). The leader TRS (TRS-L) is colored black and body TRSs (TRS-B) are colored red.",
            "TRS-L-dependent recombination track": "Recombination events mediated by TRS-L. Scale 0-7000000 reads.",
            "TRS-L-independent recombination track": "Recombination events not mediated by TRS-L. Scale 0-1000 reads.",
        },
    },
    {
        collection: "Viral RNA modifications",
        name: "Viral RNA modifications (Kim et al., 2020)",
        numTracks: 10,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~mchoudhary/viralBrowser/studies/kim-2020/rnamodifications.json",
        description: {
            "hub built by": "Mayank Choudhary (mayank-choudhary@wustl.edu)",
            "hub info":
                "RNA modifications detected using Nanopore direct RNA sequencing (Kim et al., 2020; DOI: 10.1016/j.cell.2020.04.011). Values are displayed as fractions",
            "data source": "Supplementary Table 5, Kim et al 2020",
        },
    },
    {
        collection: "Viral RNA expression",
        name: "Viral RNA expression (Kim et al., 2020)",
        numTracks: 1,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/virus/nanoporeBW.json",
        description: {
            "hub built by": "Xiaoyu Zhuo (xzhuo@wustl.edu)",
            "hub info":
                "a bigwig track displaying nanopore expression from SARS-CoV-2 infected Vero cells (Kim et al., 2020; DOI: 10.1016/j.cell.2020.04.011).",
        },
    },
    {
        collection: "Sequence variation",
        name: "D614G prevalence across time",
        numTracks: 1,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~mchoudhary/viralBrowser/D614G_byweek.hub",
        description: {
            "hub built by": "Mayank Choudhary (mayank-choudhary@wustl.edu)",
            "hub info":
                "Percentage of strains with D614G mutation collected in each week between 12/23/2019 and 05/04/2020",
        },
    },
    {
        collection: "SARS-CoV-2 database",
        name: "Non-canonical ORFs",
        numTracks: 1,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/viralBrowser/v2/others/hubs/gmatt/sars-cov-2_finkel2020_novelORFs.json",
        description: {
            "hub built by": "Gavriel Matt (gavrielmatt@wustl.edu)",
            "hub info":
                "Non-canonical open reading frames (ORFs) in SARS-CoV-2. Abbreviations: iORF = internal ORF; uORF = upstream ORF; ext = extended ORF.",
            "data source": "Finkel et al., 2020 (PMID: 32906143)",
        },
    },
    {
        collection: "Image data from IDR",
        name: "Images from IDR (https://idr.openmicroscopy.org/)",
        numTracks: 1,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/virus/imagehub.json",
        description: {
            "hub built by": "Daofeng Li (dli23@wustl.edu)",
            "hub info": "Images are displayed through API provided by IDR.",
            "data source": "https://idr.openmicroscopy.org/",
        },
    },
    {
        collection: "NCBI database",
        name: "All NCBI SARS-CoV-2 isolates",
        numTracks: 53248,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/ncbi/2021-02-16/browser_strains.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "hub info":
                "All SARS-CoV-2 strains available on NCBI. Aligned to reference genome (NC_045512.2) using EMBL 'stretcher'.",
            "data source": "https://www.ncbi.nlm.nih.gov/nuccore",
            "white space": "Matching the reference",
            "colored bars":
                "Variation from the reference. Details are color coded. Zoom in to click on the bar to see detail",
            "long stretches of rosy brown": "Unsequenced regions",
        },
    },
    {
        collection: "NCBI database",
        name: "All NCBI SARS-CoV-2 isolates, in SNV2 format",
        numTracks: 53248,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/ncbi/2021-02-16/browser_strains_snv2.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "hub info":
                "All SARS-CoV-2 strains available on NCBI. Aligned to reference genome (NC_045512.2) using EMBL 'stretcher'.",
            format: "SNV2: suggests putative amino acid level mutations",
            "data source": "https://www.ncbi.nlm.nih.gov/nuccore",
        },
    },
    {
        collection: "Nextstrain database",
        name: "All Nextstrain SARS-CoV-2 isolates",
        numTracks: 3890,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/nextstrain/2021-04-27/browser_strains.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "track type":
                "SNV tracks of all SARS-CoV-2 strains from Nextstrain, displaying their sequence variation from the reference",
            "data source": "http://data.Nextstrain.org/ncov.json",
        },
    },
    {
        collection: "Nextstrain database",
        name: "All Nextstrain SARS-CoV-2 isolates, in SNV2 format",
        numTracks: 3890,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/nextstrain/2021-04-27/browser_strains_snv2.json",
        description: {
            "hub built by": "Changxu Fan (fanc@wustl.edu)",
            "track type":
                "SNV tracks of all SARS-CoV-2 strains from Nextstrain, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": "http://data.Nextstrain.org/ncov.json",
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (-5/22/2020)",
        numTracks: 30612,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/5-22/browser_strains.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 strains available on GISAID as of 5/22/2020, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (-5/22/2020)",
        numTracks: 30612,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/5-22/browser_strains_snv2.json",
        description: {
            "track type":
                "SNV2 tracks of all SARS-CoV-2 strains available on GISAID as of 5/22/2020, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (5/22/2020-7/28/2020)",
        numTracks: 42199,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/7-28/browser_strains_new.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 strains that became available on GISAID between 5/22/2020 and 7/28/2020 , displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },

    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (5/22/2020-7/28/2020)",
        numTracks: 42199,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/7-28/browser_strains_new_snv2.json",
        description: {
            "track type":
                "SNV2 tracks of all SARS-CoV-2 strains that became available on GISAID between 5/22/2020 and 7/28/2020, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (7/28/2020 - 9/21/2020)",
        numTracks: 33785,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/9-21/browser_strains_new.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 7/28/2020 to 9/21/2020, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (7/28/2020 - 9/21/2020)",
        numTracks: 33785,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/9-21/browser_strains_new_snv2.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 7/28/2020 to 9/21/2020, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (9/21/2020 - 10/28/2020)",
        numTracks: 59667,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/10-28/browser_strains_new.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 9/21/2020 to 10/28/2020, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (9/21/2020 - 10/28/2020)",
        numTracks: 59667,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/10-28/browser_strains_new_snv2.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 9/21/2020 to 10/28/2020, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (10/28/2020 - 12/5/2020)",
        numTracks: 74375,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/12-5/browser_strains_new.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 10/28/2020 to 12/5/2020, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (10/28/2020 - 12/5/2020)",
        numTracks: 74375,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/12-5/browser_strains_new_snv2.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 10/28/2020 to 12/5/2020, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (12/5/2020 - 2/16/2021) part1",
        numTracks: 55198,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_part1.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (12/5/2020 - 2/16/2021) part1",
        numTracks: 55198,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_snv2_part1.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (12/5/2020 - 2/16/2021) part2",
        numTracks: 55198,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_part2.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (12/5/2020 - 2/16/2021) part2",
        numTracks: 55198,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_snv2_part2.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (12/5/2020 - 2/16/2021) part3",
        numTracks: 55198,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_part3.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (12/5/2020 - 2/16/2021) part3",
        numTracks: 55198,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_snv2_part3.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (12/5/2020 - 2/16/2021) part4",
        numTracks: 55198,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_part4.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (12/5/2020 - 2/16/2021) part4",
        numTracks: 55198,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_snv2_part4.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (12/5/2020 - 2/16/2021) part5",
        numTracks: 55195,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_part5.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database SNV2 format (12/5/2020 - 2/16/2021) part5",
        numTracks: 55195,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-02-16/browser_strains_new_snv2_part5.json",
        description: {
            "track type":
                "SNV tracks of all SARS-CoV-2 isolates that became available on GISAID from 12/5/2020 to 2/16/2021, displaying their sequence variation from the reference and suggesting putative amino acid level mutations",
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 1",
        numTracks: 74745,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part1.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 2",
        numTracks: 74747,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part2.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 3",
        numTracks: 74785,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part3.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 4",
        numTracks: 74749,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part4.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 5",
        numTracks: 74781,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part5.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 6",
        numTracks: 74781,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part6.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 7",
        numTracks: 74755,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part7.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 8",
        numTracks: 74759,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part8.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 9",
        numTracks: 74747,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part9.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 10",
        numTracks: 74736,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_part10.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 1, in SNV2 format ",
        numTracks: 74745,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part1.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 2, in SNV2 format ",
        numTracks: 74747,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part2.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 3, in SNV2 format ",
        numTracks: 74785,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part3.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 4, in SNV2 format ",
        numTracks: 74749,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part4.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 5, in SNV2 format ",
        numTracks: 74781,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part5.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 6, in SNV2 format ",
        numTracks: 74781,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part6.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 7, in SNV2 format ",
        numTracks: 74755,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part7.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 8, in SNV2 format ",
        numTracks: 74759,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part8.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 9, in SNV2 format ",
        numTracks: 74747,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part9.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
        },
    },
    {
        collection: "GISAID database",
        name: "GISAID database (2021-04-27 update) part 10, in SNV2 format ",
        numTracks: 74736,
        oldHubFormat: false,
        url: "https://wangftp.wustl.edu/~cfan/gisaid/2021-04-27/browser_strains_new_snv2_part10.json",
        description: {
            "data source": (
                <a href="https://www.gisaid.org/" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.gisaid.org/fileadmin/gisaid/img/schild.png" alt="GISAID logo" />
                </a>
            ),
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
