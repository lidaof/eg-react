import React from 'react';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { scaleLinear } from 'd3-scale';

import { Heatmap } from './Heatmap';
import { ArcDisplay } from './ArcDisplay';

import Track, { PropsFromTrackContainer } from '../commonComponents/Track';
import TrackLegend from '../commonComponents/TrackLegend';
import configOptionMerging from '../commonComponents/configOptionMerging';
import withTooltip from '../commonComponents/tooltip/withTooltip';
import Tooltip from '../commonComponents/tooltip/Tooltip';

import { InteractionDisplayMode } from '../../../model/DisplayModes';
import { FeaturePlacer } from '../../../model/FeaturePlacer';
import { GenomeInteraction } from '../../../model/GenomeInteraction';

interface InteractionTrackProps extends PropsFromTrackContainer {
    data: GenomeInteraction[];
    options: {
        color: string;
        color2: string;
        backgroundColor?: string;
        displayMode: InteractionDisplayMode;
    }
    onShowTooltip(element: JSX.Element): void;
    onHideTooltip(): void;
}

export const DEFAULT_OPTIONS = {
    color: '#B8008A',
    color2: '#006385',
    backgroundColor: 'white',
    displayMode: InteractionDisplayMode.HEATMAP
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

class InteractionTrack extends React.Component<InteractionTrackProps, {}> {
    public featurePlacer: FeaturePlacer;

    constructor(props: InteractionTrackProps) {
        super(props);
        this.featurePlacer = new FeaturePlacer();
        this.featurePlacer.placeInteractions = memoizeOne(this.featurePlacer.placeInteractions);
        this.makeOpacityScale = memoizeOne(this.makeOpacityScale);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    makeOpacityScale(interactions: GenomeInteraction[]) {
        const maxScore = interactions.length > 0 ? _.maxBy(interactions, 'score').score : 0;
        return scaleLinear().domain([0, maxScore]).range([0, 1]).clamp(true);
    }

    showTooltip(event: React.MouseEvent, interaction: GenomeInteraction) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} ignoreMouse={true} >
                Score: {interaction.score}
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    }

    hideTooltip() {
        this.props.onHideTooltip();
    }

    render(): JSX.Element {
        const {data, trackModel, visRegion, width, viewWindow, options} = this.props;
        const visualizerProps = {
            placedInteractions: this.featurePlacer.placeInteractions(data, visRegion, width),
            viewWindow,
            width,
            opacityScale: this.makeOpacityScale(data),
            color: options.color,
            onInteractionHovered: this.showTooltip,
            onMouseOut: this.hideTooltip
        };

        let visualizer;
        if (options.displayMode === InteractionDisplayMode.HEATMAP) {
            visualizer = <Heatmap {...visualizerProps} />;
        } else {
            visualizer = <ArcDisplay {...visualizerProps} />;
        }

        return <Track
            {...this.props}
            legend={<TrackLegend trackModel={trackModel} />}
            visualizer={visualizer}
        />;
    }
}

export default withDefaultOptions(withTooltip(InteractionTrack as any));
