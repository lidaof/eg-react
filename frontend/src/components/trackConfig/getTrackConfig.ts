import { TrackConfig } from './TrackConfig';
import { BamTrackConfig } from './BamTrackConfig';
import { BedTrackConfig } from './BedTrackConfig';
import { CategoricalTrackConfig } from './CategoricalTrackConfig';
import { BigBedTrackConfig } from './BigBedTrackConfig';
import { BedGraphTrackConfig } from './BedGraphTrackConfig';
import { BigWigTrackConfig } from './BigWigTrackConfig';
import { GeneAnnotationTrackConfig } from './GeneAnnotationTrackConfig';
import { HicTrackConfig } from './HicTrackConfig';
import { LongRangeTrackConfig } from './LongRangeTrackConfig';
import { BigInteractTrackConfig } from './BigInteractTrackConfig';
import { MethylCTrackConfig } from './MethylCTrackConfig';
import { RepeatMaskerTrackConfig } from './RepeatMaskerTrackConfig';
import { GenomeAlignTrackConfig } from './GenomeAlignTrackConfig';
import { RulerTrackConfig } from './RulerTrackConfig';
import { TrackModel } from '../../model/TrackModel';

const TYPE_NAME_TO_CONFIG = {
    "bam": BamTrackConfig,
    "bed": BedTrackConfig,
    "categorical": CategoricalTrackConfig,
    "bedgraph": BedGraphTrackConfig,
    "bigbed": BigBedTrackConfig,
    "bigwig": BigWigTrackConfig,
    "hic": HicTrackConfig,
    "longrange": LongRangeTrackConfig,
    "biginteract": BigInteractTrackConfig,
    "geneannotation": GeneAnnotationTrackConfig,
    "methylc": MethylCTrackConfig,
    "repeatmasker": RepeatMaskerTrackConfig,
    "genomealign": GenomeAlignTrackConfig,
    "ruler": RulerTrackConfig,
};
const DefaultConfig = TrackConfig;

if (process.env.NODE_ENV !== "production") { // Check if all the subtypes are clean
    for (const subtypeName in TYPE_NAME_TO_CONFIG) {
        if (subtypeName.toLowerCase() !== subtypeName) {
            throw new TypeError(`Type names may not contain uppercase letters.  Offender: "${subtypeName}"`);
        }
    }
}

/**
 * Gets the appropriate TrackConfig from a trackModel.  This function is separate from TrackConfig because it would
 * cause a circular dependency.
 * 
 * @param {TrackModel} trackModel - track model
 * @return {TrackConfig} renderer for that track model
 */
export function getTrackConfig(trackModel: TrackModel): TrackConfig {
    let type = trackModel.type || trackModel.filetype || "";
    type = type.toLowerCase();
    const TrackConfigSubtype = TYPE_NAME_TO_CONFIG[type];
    if (TrackConfigSubtype) {
        return new TrackConfigSubtype(trackModel)
    } else {
        return new DefaultConfig(trackModel);
    }
}
