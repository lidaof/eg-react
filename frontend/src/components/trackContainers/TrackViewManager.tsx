import React from 'react';
import memoizeOne from 'memoize-one';

import TrackLegend from '../trackVis/commonComponents/TrackLegend';

import { TrackModel } from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { RegionExpander, ViewExpansion } from '../../model/RegionExpander';
import { GuaranteeMap } from '../../model/GuaranteeMap';
import { AlignmentViewCalculator, Alignment } from '../../model/alignment/AlignmentViewCalculator';

interface DataManagerProps {
    genome: string; // The primary genome
    tracks: TrackModel[]; // Tracks
    viewRegion: DisplayedRegionModel; // Region that the user requests to view
    containerWidth: number;
}

interface DataManagerState {
    primaryView: ViewExpansion;
}

export interface AlignmentPromises {
    [genome: string]: Promise<Alignment>
}

interface WrappedComponentProps {
    alignments: AlignmentPromises;
    basesPerPixel: number;
    primaryViewPromise: Promise<ViewExpansion>;
    primaryView: ViewExpansion;
}

const REGION_EXPANDER = new RegionExpander(1);

export function withTrackView(WrappedComponent: React.ComponentType<WrappedComponentProps>) {
    return class TrackViewManager extends React.Component<DataManagerProps, DataManagerState> {
        private _primaryGenome: string;
        private _alignmentCalculatorForGenome: GuaranteeMap<string, AlignmentViewCalculator>

        constructor(props: DataManagerProps) {
            super(props);
            this._primaryGenome = props.genome;
            this._alignmentCalculatorForGenome = new GuaranteeMap(
                queryGenome => new AlignmentViewCalculator(this._primaryGenome, queryGenome)
            );
            this.state = {
                primaryView: null,
            };
            this.fetchPrimaryView = memoizeOne(this.fetchPrimaryView);
            this.fetchPrimaryView(props.viewRegion, props.tracks);
        }

        getVisualizationWidth() {
            return Math.max(1, this.props.containerWidth - TrackLegend.WIDTH);
        }

        getSecondaryGenomes(tracks: TrackModel[]) {
            const genomeSet = new Set(tracks.map(track => track.getMetadata('genome')));
            genomeSet.delete(this._primaryGenome);
            genomeSet.delete(undefined);
            return Array.from(genomeSet);
        }

        async fetchPrimaryView(viewRegion: DisplayedRegionModel, tracks: TrackModel[]): Promise<ViewExpansion> {
            const visData = REGION_EXPANDER.calculateExpansion(viewRegion, this.getVisualizationWidth());
            const secondaryGenome = this.getSecondaryGenomes(tracks)[0]; // Just the first one
            if (!secondaryGenome) {
                return visData;
            }

            const alignmentCalculator = this._alignmentCalculatorForGenome.get(secondaryGenome);
            try {
                const alignment = await alignmentCalculator.align(visData);
                this.setState({ primaryView: alignment.primaryVisData });
                return alignment.primaryVisData;
            } catch (error) {
                console.error(error);
                console.error("Falling back to nonaligned primary view");
                this.setState({ primaryView: visData });
                return visData;
            }
        }

        fetchAlignments(viewRegion: DisplayedRegionModel, tracks: TrackModel[]): AlignmentPromises {
            const secondaryGenomes = this.getSecondaryGenomes(tracks);
            const visData = REGION_EXPANDER.calculateExpansion(viewRegion, this.getVisualizationWidth());
            const alignmentForGenome: AlignmentPromises = {};
            for (const genome of secondaryGenomes) {
                const alignmentCalculator = this._alignmentCalculatorForGenome.get(genome);
                alignmentForGenome[genome] = alignmentCalculator.align(visData);
            }
            return alignmentForGenome;
        }

        render() {
            if (!this.state.primaryView) {
                return <div style={{textAlign: 'center'}} >Loading alignment...</div>;
            }

            /*
            We can get away with calling these functions every render because of clever use of memoizeOne.
            In fact, since this.getPrimaryViewPromise() asynchronously sets state, we MUST use memoizeOne to prevent
            infinite loops!
            */
            return <WrappedComponent
                alignments={this.fetchAlignments(this.props.viewRegion, this.props.tracks)}
                basesPerPixel={this.props.viewRegion.getWidth() / this.getVisualizationWidth()}
                primaryViewPromise={this.fetchPrimaryView(this.props.viewRegion, this.props.tracks)}
                primaryView={this.state.primaryView}
                {...this.props}
            />;
        }
    }
}
