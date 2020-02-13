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
  ]
};

const nCoV2019 = {
  genome: genome,
  navContext: navContext,
  cytobands: {},
  defaultRegion: defaultRegion,
  defaultTracks: defaultTracks,
  twoBitURL: "https://vizhub.wustl.edu/public/virus/nCoV2019.2bit",
  annotationTracks
};

export default nCoV2019;
