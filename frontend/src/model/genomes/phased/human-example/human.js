import Chromosome from "../Chromosome";
import Genome from "../Genome";
import TrackModel from "../../TrackModel";

const genomeName = "humanphased2";

const paternal = {
    genome: new Genome("paternal", [
        new Chromosome("chr1", 248387328),
        new Chromosome("chr2", 242696752),
        new Chromosome("chrX", 154259566),
        new Chromosome("chrY", 62460029),
    ]),
    navContext: this.genome.makeNavContext(),
    defaultRegion: this.navContextPat.parse("chr7:27088683-27155782"),
    defaultTracks: [
        new TrackModel({
            type: "ruler",
            name: "Ruler",
        }),
        new TrackModel({
            type: "geneAnnotation",
            name: "gencodeV35",
            label: "gencodeV35",
            genome: "t2t-chm13-v2.0",
            options: {
                maxRows: 10,
            },
        }),
        new TrackModel({
            type: "rmskv2",
            name: "RepeatMaskerV2",
            url: "https://vizhub.wustl.edu/public/t2t-chm13-v2.0/rmsk.bigBed",
        }),
    ],
};

const maternal = {
    genome: new Genome("maternal", [
        new Chromosome("chr1", 248387328),
        new Chromosome("chr2", 242696752),
        new Chromosome("chrX", 154259566),
    ]),

    navContext: this.genome.makeNavContext(),
    defaultRegion: this.navContext.parse("chr7:27203153-27363337"),
    defaultTracks: [
        new TrackModel({
            type: "ruler",
            name: "Ruler",
        }),
        new TrackModel({
            type: "geneAnnotation",
            name: "genes",
            label: "genes from CAT and Liftoff",
            genome: "t2t-chm13-v1.1",
            options: {
                maxRows: 10,
            },
        }),
        new TrackModel({
            type: "rmskv2",
            name: "RepeatMaskerV2",
            url: "https://vizhub.wustl.edu/public/t2t-chm13-v1.1/rmsk.bigBed",
        }),
    ],
};

const phasedHuman = {
    name: genomeName,
    phases: [paternal, maternal],
    phased: true,
};

export default phasedHuman;
