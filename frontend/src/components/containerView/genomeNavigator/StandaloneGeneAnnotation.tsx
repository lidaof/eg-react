import React from 'react';
import { GeneAnnotation } from '../../trackVis/geneAnnotationTrack/GeneAnnotation';
import Gene from '../../../model/Gene';
import { PlacedFeature } from '../../../model/FeaturePlacer';
import OpenInterval from '../../../model/interval/OpenInterval';
import { FeatureSegment } from '../../../model/interval/FeatureSegment';

interface StandaloneGeneAnnotationProps {
    gene: Gene;
    contextLocation: OpenInterval;
    xSpan: OpenInterval;
    elementWidth: number;
}

/**
 * A SVG containing a happy solo GeneAnnotation.
 * 
 * @author Silas Hsu
 */
export function StandaloneGeneAnnotation(props: StandaloneGeneAnnotationProps): JSX.Element {
    const {gene, contextLocation, xSpan, elementWidth} = props;
    const placedGene: PlacedFeature = {
        feature: gene,
        visiblePart: new FeatureSegment(gene),
        contextLocation,
        xSpan,
        isReverse: false
    };
    return <svg width={elementWidth} height={GeneAnnotation.HEIGHT} >
        <GeneAnnotation placedGene={placedGene} />
    </svg>;
}
