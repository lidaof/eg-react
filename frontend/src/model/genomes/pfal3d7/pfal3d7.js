import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";
import cytobands from "./cytoBandIdeo.json";
import annotationTracks from "./annotationTracks.json";

const genome = new Genome("Pfal3D7", [
    new Chromosome("chr1", 640851),
    new Chromosome("chr2", 947102),
    new Chromosome("chr3", 1067971),
    new Chromosome("chr4", 1200490),
    new Chromosome("chr5", 1343557),
    new Chromosome("chr6", 1418242),
    new Chromosome("chr7", 1445207),
    new Chromosome("chr8", 1472805),
    new Chromosome("chr9", 1541735),
    new Chromosome("chr10", 1687656),
    new Chromosome("chr11", 2038340),
    new Chromosome("chr12", 2271494),
    new Chromosome("chr13", 2925236),
    new Chromosome("chr14", 3291936),
]);

const navContext = genome.makeNavContext();
const defaultRegion = navContext.parse("chr1:256704-310866");
const defaultTracks = [
    new TrackModel({
        type: "geneAnnotation",
        name: "PlasmoDBGene",
        genome: "Pfal3D7",
        label: "PlasmoDB 9.0 genes",
        queryEndpoint: { name: "PlasmoDB", endpoint: "https://plasmodb.org/plasmo/app/record/gene/" },
    }),
    new TrackModel({
        type: "ruler",
        name: "Ruler",
    }),
];

const publicHubData = {
    "Noble lab": "Published data from Noble lab (https://noble.gs.washington.edu/)",
};

const publicHubList = [
    {
        collection: "Noble lab",
        name: "Long-range chromatin interaction experiments",
        numTracks: 11,
        oldHubFormat: false,
        url: "https://vizhub.wustl.edu/public/Pfalciparum3D7/long",
        description:
            "A collection of long-range chromatin interaction data sets from https://noble.gs.washington.edu/proj/plasmo3d/",
    },
];

const Pfal3D7 = {
    genome: genome,
    navContext: navContext,
    cytobands: cytobands,
    defaultRegion: defaultRegion,
    defaultTracks: defaultTracks,
    publicHubList,
    publicHubData,
    twoBitURL: "https://vizhub.wustl.edu/public/Pfal3D7/Pfal3D7.2bit",
    annotationTracks,
};

export default Pfal3D7;
