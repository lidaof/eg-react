import Genome from "./Genome";
import NavigationContext from "../NavigationContext";
import CytobandMap from "./CytobandTypes";
import OpenInterval from "../interval/OpenInterval";
import TrackModel from "../TrackModel";

export interface GenomeConfig {
    genome: Genome;
    navContext: NavigationContext;
    cytobands: CytobandMap;
    defaultRegion: OpenInterval;
    defaultTracks: TrackModel[];
    publicHubData: any;
    publicHubList: any[];
    annotationTracks: any;
    twoBitURL?: string;
}

export interface PhasedGenomeConfig {
    name: string;
    phased: boolean;
    phases: GenomeConfig[];
}
