import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";
const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("oryCun2", allSize);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr16:34702809-34709639");

const defaultTracks = [
  new TrackModel({
    type: "ruler",
    name: "Ruler"
  }),
  new TrackModel({
    type: "refbed",
    name: "refGene",
    genome: "oryCun2",
    url: "https://wangftp.wustl.edu/~xzhuo/browser/oryCun2/oryCun2.refbed.gz"
  }),
  new TrackModel({
    type: "repeatmasker",
    name: "RepeatMasker",
    url: "https://wangftp.wustl.edu/~xzhuo/browser/oryCun2/oryCun2.bb"
  })
];

const oryCun2 = {
  genome: genome,
  navContext: navContext,
  cytobands: cytobands,
  defaultRegion: defaultRegion,
  defaultTracks: defaultTracks,
  twoBitURL: "https://wangftp.wustl.edu/~xzhuo/browser/oryCun2/oryCun2.2bit",
  annotationTracks
};

export default oryCun2;
