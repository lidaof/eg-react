import React from 'react';
import _ from 'lodash';
import memoizeOne from 'memoize-one';
import { scaleLinear } from 'd3-scale';

import { Heatmap } from './Heatmap';
import { ArcDisplay } from './ArcDisplay';

import Track, { PropsFromTrackContainer } from '../commonComponents/Track';
import TrackLegend from '../commonComponents/TrackLegend';
import configOptionMerging from '../commonComponents/configOptionMerging';
import { withTooltip, TooltipCallbacks } from '../commonComponents/tooltip/withTooltip';
import Tooltip from '../commonComponents/tooltip/Tooltip';

import { InteractionDisplayMode } from '../../../model/DisplayModes';
import { FeaturePlacer } from '../../../model/FeaturePlacer';
import { GenomeInteraction } from '../../../model/GenomeInteraction';
import { notify } from 'react-notify-toast';

interface InteractionTrackProps extends PropsFromTrackContainer, TooltipCallbacks {
    data: GenomeInteraction[];
    options: {
        color: string;
        color2: string;
        backgroundColor?: string;
        displayMode: InteractionDisplayMode;
        scoreScale?: string,
        scoreMax?: number,
        scoreMin?: number,
    }
}

export const DEFAULT_OPTIONS = {
    color: '#B8008A',
    color2: '#006385',
    backgroundColor: 'white',
    displayMode: InteractionDisplayMode.HEATMAP,
    scoreScale: 'auto',
};
const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

class InteractionTrack extends React.PureComponent<InteractionTrackProps, {}> {
    public featurePlacer: FeaturePlacer;

    constructor(props: InteractionTrackProps) {
        super(props);
        this.featurePlacer = new FeaturePlacer();
        this.featurePlacer.placeInteractions = memoizeOne(this.featurePlacer.placeInteractions);
        // this.makeOpacityScale = memoizeOne(this.makeOpacityScale);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }


    makeOpacityScale = () => {
        const {scoreScale, scoreMin, scoreMax} = this.props.options;
        if (scoreScale === 'auto') {
            const maxScore = this.props.data.length > 0 ? _.maxBy(this.props.data, 'score').score : 0;
            return scaleLinear().domain([0, maxScore]).range([0, 1]).clamp(true);
        } else {
            if (scoreMin >= scoreMax) {
                notify.show('Score min cannot be greater than Score max', 'error', 2000);
                return scaleLinear().domain([scoreMax-1, scoreMax]).range([0, 1]).clamp(true);
            }
            return scaleLinear().domain([scoreMin, scoreMax]).range([0, 1]).clamp(true);
        }
    }

    showTooltip(event: React.MouseEvent, interaction: GenomeInteraction) {
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} ignoreMouse={true} >
                <div>
                    <div>{interaction.locus1.toString()}</div>
                    <div>{interaction.locus2.toString()}</div>
                    <div>Score: {interaction.score}</div>
                </div>
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
            opacityScale: this.makeOpacityScale(),
            color: options.color,
            onInteractionHovered: this.showTooltip,
            onMouseOut: this.hideTooltip
        };
        console.log(this.makeOpacityScale().domain());
        let visualizer; // , height;
        if (options.displayMode === InteractionDisplayMode.HEATMAP) {
            visualizer = <Heatmap {...visualizerProps} />;
            // height = Heatmap.getHeight(visualizerProps);
        } else {
            visualizer = <ArcDisplay {...visualizerProps} />;
            // height = ArcDisplay.getHeight(visualizerProps);
        }

        return <Track
            {...this.props}
            // legend={<TrackLegend trackModel={trackModel} height={height} />}
            legend={<TrackLegend trackModel={trackModel} height={50} />}
            visualizer={visualizer}
        />;
    }
}

export default withDefaultOptions(withTooltip(InteractionTrack));
