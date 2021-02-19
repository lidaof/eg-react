import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("mm39", [
    new Chromosome("chr1", 195154279),
    new Chromosome("chr2", 181755017),
    new Chromosome("chr3", 159745316),
    new Chromosome("chr4", 156860686),
    new Chromosome("chr5", 151758149),
    new Chromosome("chr6", 149588044),
    new Chromosome("chr7", 144995196),
    new Chromosome("chr8", 130127694),
    new Chromosome("chr9", 124359700),
    new Chromosome("chr10", 130530862),
    new Chromosome("chr11", 121973369),
    new Chromosome("chr12", 120092757),
    new Chromosome("chr13", 120883175),
    new Chromosome("chr14", 125139656),
    new Chromosome("chr15", 104073951),
    new Chromosome("chr16", 98008968),
    new Chromosome("chr17", 95294699),
    new Chromosome("chr18", 90720763),
    new Chromosome("chr19", 61420004),
    new Chromosome("chrM", 16299),
    new Chromosome("chrX", 169476592),
    new Chromosome("chrY", 91455967),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr6:52181837-52185652");
const defaultTracks = [
    new TrackModel({
    type: "ruler",
    name: "Ruler"
  }),
  new TrackModel({
    type: "geneAnnotation",
    name: "refGene",
    genome: "mm39"
  }),
  new TrackModel({
    type: "repeatmasker",
    name: "RepeatMasker",
    url: "https://vizhub.wustl.edu/public/mm39/rmsk16.bb"
  })
];



const MM39 = {
  genome: genome,
  navContext: navContext,
  cytobands: cytobands,
  defaultRegion: defaultRegion,
  defaultTracks: defaultTracks,
  twoBitURL: "https://vizhub.wustl.edu/public/mm10/mm10.2bit",
  annotationTracks
};

export default MM39;
