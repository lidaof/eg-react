import TrackRenderer from './TrackRenderer';
import BamTrackRenderer from './BamTrackRenderer';
import BedTrackRenderer from './BedTrackRenderer';
import BigBedTrackRenderer from './BigBedTrackRenderer';
import BedGraphTrackRenderer from './BedGraphTrackRenderer';
import BigWigTrackRenderer from './BigWigTrackRenderer';
import GeneAnnotationTrackRenderer from './GeneAnnotationTrackRenderer';
import RepeatMaskerTrackRenderer from './RepeatMaskerTrackRenderer';
import RulerTrackRenderer from './RulerTrackRenderer';
import MethylCTrackRenderer from './MethylCTrackRenderer';
import HicTrackRenderer from './HicTrackRenderer';

const TYPE_NAME_TO_RENDERER = {
    "bam": BamTrackRenderer,
    "bed": BedTrackRenderer,
    "bedgraph": BedGraphTrackRenderer,
    "bigbed": BigBedTrackRenderer,
    "bigwig": BigWigTrackRenderer,
    "geneannotation": GeneAnnotationTrackRenderer,
    "repeatmasker": RepeatMaskerTrackRenderer,
    "methylc": MethylCTrackRenderer,
    "hic": HicTrackRenderer,
    "ruler": RulerTrackRenderer,
};
const DefaultRenderer = TrackRenderer;

if (process.env.NODE_ENV !== "production") { // Check if all the subtypes are clean
    for (let subtypeName in TYPE_NAME_TO_RENDERER) {
        if (subtypeName.toLowerCase() !== subtypeName) {
            throw new TypeError(`Type names may not contain uppercase letters.  Offender: "${subtypeName}"`);
        }
    }
}

/**
 * Gets the appropriate TrackRenderer from a trackModel.  This function is separate from TrackRenderer because it would
 * cause a circular dependency.
 * 
 * @param {TrackModel} trackModel - track model
 * @return {TrackRenderer} renderer for that track model
 */
function getTrackRenderer(trackModel) {
    let type = trackModel.type || trackModel.filetype || "";
    type = type.toLowerCase();
    const TrackRendererSubtype = TYPE_NAME_TO_RENDERER[type];
    if (TrackRendererSubtype) {
        return new TrackRendererSubtype(trackModel)
    } else {
        return new DefaultRenderer(trackModel);
    }
}

export default getTrackRenderer;
