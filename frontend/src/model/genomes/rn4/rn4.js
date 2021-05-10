import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";
const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("rn4", allSize);
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
    genome: "rn4",
    url: "https://vizhub.wustl.edu/public/rn4/rn4.refbed.gz"
  }),
  new TrackModel({
    type: "repeatmasker",
    name: "RepeatMasker",
    url: "https://vizhub.wustl.edu/public/rn4/rn4.bb"
  })
];

const rn4 = {
  genome: genome,
  navContext: navContext,
  cytobands: cytobands,
  defaultRegion: defaultRegion,
  defaultTracks: defaultTracks,
  twoBitURL: "https://vizhub.wustl.edu/public/rn4/rn4.2bit",
  annotationTracks
};

export default rn4;
