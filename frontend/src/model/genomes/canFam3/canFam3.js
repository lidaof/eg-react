import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";
const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("canFam3", allSize);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr1:34702809-34709639");

const defaultTracks = [
  new TrackModel({
    type: "ruler",
    name: "Ruler"
  }),
  new TrackModel({
    type: "refbed",
    name: "refGene",
    genome: "canFam3",
    url: "https://wangftp.wustl.edu/~xzhuo/browser/demo/canFam3.refbed.gz"
  }),
  new TrackModel({
    type: "repeatmasker",
    name: "RepeatMasker",
    url: "https://wangftp.wustl.edu/~xzhuo/browser/demo/canFam3.bb"
  })
];

const canFam3 = {
  genome: genome,
  navContext: navContext,
  cytobands: cytobands,
  defaultRegion: defaultRegion,
  defaultTracks: defaultTracks,
  twoBitURL: "https://wangftp.wustl.edu/~xzhuo/browser/demo/canFam3.2bit",
  annotationTracks
};

export default canFam3;
