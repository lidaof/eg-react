import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import annotationTracks from "./annotationTracks.json";
import chromSize from "./chromSize.json";
const allSize = chromSize.map(genom => new Chromosome(genom.chr, genom.size));
const genome = new Genome("canFam2", allSize);
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
    genome: "canFam2",
    url: "https://vizhub.wustl.edu/public/canFam2/canFam2.refbed.gz"
  }),
  new TrackModel({
    type: "repeatmasker",
    name: "RepeatMasker",
    url: "https://vizhub.wustl.edu/public/canFam2/canFam2.bb"
  })
];

const canFam2 = {
  genome: genome,
  navContext: navContext,
  defaultRegion: defaultRegion,
  defaultTracks: defaultTracks,
  twoBitURL: "https://vizhub.wustl.edu/public/canFam2/canFam2.2bit",
  annotationTracks
};

export default canFam2;
