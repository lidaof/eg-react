import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";
const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("rheMac2", allSize);
const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr1:4702809-4709639");

const defaultTracks = [
  new TrackModel({
    type: "ruler",
    name: "Ruler"
  }),
  new TrackModel({
    type: "refbed",
    name: "refGene",
    genome: "rheMac2",
    url: "https://wangftp.wustl.edu/~xzhuo/browser/rheMac2/rheMac2.refbed.gz"
  }),
  new TrackModel({
    type: "repeatmasker",
    name: "RepeatMasker",
    url: "https://wangftp.wustl.edu/~xzhuo/browser/rheMac2/rheMac2.bb"
  })
];

const rheMac2 = {
  genome: genome,
  navContext: navContext,
  cytobands: {},
  defaultRegion: defaultRegion,
  defaultTracks: defaultTracks,
  twoBitURL: "https://wangftp.wustl.edu/~xzhuo/browser/rheMac2/rheMac2.2bit",
  annotationTracks
};

export default rheMac2;
