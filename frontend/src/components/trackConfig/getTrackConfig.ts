import { TrackConfig } from "./TrackConfig";
import { BamTrackConfig } from "./BamTrackConfig";
import { BedTrackConfig } from "./BedTrackConfig";
import { DynamicBedTrackConfig } from "./DynamicBedTrackConfig";
import { QBedTrackConfig } from "./QBedTrackConfig";
import { CategoricalTrackConfig } from "./CategoricalTrackConfig";
import { BigBedTrackConfig } from "./BigBedTrackConfig";
import { BedGraphTrackConfig } from "./BedGraphTrackConfig";
import { BigWigTrackConfig } from "./BigWigTrackConfig";
import { GeneAnnotationTrackConfig } from "./GeneAnnotationTrackConfig";
import { HicTrackConfig } from "./HicTrackConfig";
import { LongRangeTrackConfig } from "./LongRangeTrackConfig";
import { LongRangeColorTrackConfig } from "./LongRangeColorTrackConfig";
import { BigInteractTrackConfig } from "./BigInteractTrackConfig";
import { CoolTrackConfig } from "./CoolTrackConfig";
import { MethylCTrackConfig } from "./MethylCTrackConfig";
import { RepeatMaskerTrackConfig } from "./RepeatMaskerTrackConfig";
import { GenomeAlignTrackConfig } from "./GenomeAlignTrackConfig";
import { RulerTrackConfig } from "./RulerTrackConfig";
import { TrackModel } from "../../model/TrackModel";
import { RefBedTrackConfig } from "./RefBedTrackConfig";
import { SnpTrackConfig } from "./SnpTrackConfig";
import { MatplotTrackConfig } from "./MatplotTrackConfig";
import { DynamicplotTrackConfig } from "./DynamicplotTrackConfig";
import { HammockTrackConfig } from "./HammockTrackConfig";
import { PairwiseSegmentTrackConfig } from "./PairwiseSegmentTrackConfig";
import { SnvSegmentTrackConfig } from "./SnvSegmentTrackConfig";
import { G3dTrackConfig } from "./G3dTrackConfig";
import { ProteinTrackConfig } from "./ProteinTrackConfig";
import { DynamicBedGraphTrackConfig } from "./DynamicBedGraphTrackConfig";
import { DynamicHicTrackConfig } from "./DynamicHicTrackConfig";
import { DynamicLongrangeTrackConfig } from "./DynamicLongrangeTrackConfig";
import { OmeroidrTrackConfig } from "./OmeroidrTrackConfig";
import { Omero4dnTrackConfig } from "./Omero4dnTrackConfig";
import { DynseqTrackConfig } from "./DynseqTrackConfig";
import { RgbpeakTrackConfig } from "./RgbpeakTrackConfig";
import { VcfTrackConfig } from "./VcfTrackConfig";
import { BoxplotTrackConfig } from "./BoxplotTrackConfig";
import { BedcolorTrackConfig } from "./BedcolorTrackConfig";
import { Rmskv2TrackConfig } from "./Rmskv2TrackConfig";
import { JasparTrackConfig } from "./JasparTrackConfig";

export const INTERACTION_TYPES = ["hic", "longrange", "biginteract"];
export const ALIGNMENT_TYPES = ["genomealign"];
export const DYNAMIC_TYPES = ["dynamic", "dbedgraph", "dynamichic", "dynamiclongrange"];

const TYPE_NAME_TO_CONFIG = {
    bam: BamTrackConfig,
    bed: BedTrackConfig,
    dynamicbed: DynamicBedTrackConfig,
    qbed: QBedTrackConfig,
    categorical: CategoricalTrackConfig,
    bedgraph: BedGraphTrackConfig,
    bigbed: BigBedTrackConfig,
    bigwig: BigWigTrackConfig,
    hic: HicTrackConfig,
    longrange: LongRangeTrackConfig,
    longrangecolor: LongRangeColorTrackConfig,
    biginteract: BigInteractTrackConfig,
    cool: CoolTrackConfig,
    geneannotation: GeneAnnotationTrackConfig,
    refbed: RefBedTrackConfig,
    methylc: MethylCTrackConfig,
    repeatmasker: RepeatMaskerTrackConfig,
    genomealign: GenomeAlignTrackConfig,
    snp: SnpTrackConfig,
    ruler: RulerTrackConfig,
    matplot: MatplotTrackConfig,
    dynamic: DynamicplotTrackConfig,
    hammock: HammockTrackConfig,
    g3d: G3dTrackConfig,
    pairwise: PairwiseSegmentTrackConfig,
    snv: PairwiseSegmentTrackConfig,
    snv2: SnvSegmentTrackConfig,
    protein: ProteinTrackConfig,
    dbedgraph: DynamicBedGraphTrackConfig,
    dynamichic: DynamicHicTrackConfig,
    dynamiclongrange: DynamicLongrangeTrackConfig,
    omeroidr: OmeroidrTrackConfig,
    omero4dn: Omero4dnTrackConfig,
    dynseq: DynseqTrackConfig,
    rgbpeak: RgbpeakTrackConfig,
    vcf: VcfTrackConfig,
    boxplot: BoxplotTrackConfig,
    bedcolor: BedcolorTrackConfig,
    rmskv2: Rmskv2TrackConfig,
    bigchain: GenomeAlignTrackConfig,
    jaspar: JasparTrackConfig,
};
const DefaultConfig = TrackConfig;

if (process.env.NODE_ENV !== "production") {
    // Check if all the subtypes are clean
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
        return new TrackConfigSubtype(trackModel);
    } else {
        return new DefaultConfig(trackModel);
    }
}
