import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

const genome = new Genome("MERS", [new Chromosome("NC_019843.3", 30119)]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("NC_019843.3:0-30119");
const defaultTracks = [
  new TrackModel({
    type: "geneAnnotation",
    name: "ncbiGene",
    label: "NCBI genes",
    genome: "MERS"
  }),
  new TrackModel({
    type: "ruler",
    name: "Ruler"
  }),
  new TrackModel({
    type: "bedgraph",
    name: "GC Percentage",
    url: "https://vizhub.wustl.edu/public/virus/mers_CGpct.bedgraph.sort.gz"
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
      url: "https://vizhub.wustl.edu/public/virus/mers_CGpct.bedgraph.sort.gz"
    }
  ],
  "Genome Comparison": [
    {
      name: "nCoV2019tomers",
      label: "nCoV2019 to MERS alignment",
      querygenome: "nCoV2019",
      filetype: "genomealign",
      url: "https://vizhub.wustl.edu/public/virus/mers_ncov.genomealign.gz"
    },
    {
      name: "sarstomers",
      label: "SARS to MERS alignment",
      querygenome: "SARS",
      filetype: "genomealign",
      url: "https://vizhub.wustl.edu/public/virus/mers_sars.genomealign.gz"
    }
  ]
};

const MERS = {
  genome: genome,
  navContext: navContext,
  cytobands: {},
  defaultRegion: defaultRegion,
  defaultTracks: defaultTracks,
  twoBitURL: "https://vizhub.wustl.edu/public/virus/MERS.2bit",
  annotationTracks
};

export default MERS;
