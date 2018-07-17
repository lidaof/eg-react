import React from 'react';
import memoizeOne from 'memoize-one';

import TrackLegend from '../trackVis/commonComponents/TrackLegend';
import ErrorMessage from '../ErrorMessage';

import { TrackModel } from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { AlignmentViewCalculator, Alignment } from '../../model/AlignmentViewCalculator';
import { RegionExpander, ViewExpansion } from '../../model/RegionExpander';

interface DataManagerProps {
    genome: string; // The primary genome
    tracks: TrackModel[]; // Tracks
    viewRegion: DisplayedRegionModel; // Region that the user requests to view
    width: number;
}

interface DataManagerState {
    error: any;
    primaryView: PrimaryView;
}

export interface PrimaryView extends ViewExpansion {
    viewWindowRegion: DisplayedRegionModel;
}

export interface AlignmentPromises {
    [genome: string]: Promise<Alignment>
}

interface WrappedComponentProps {
    alignments: AlignmentPromises;
    basesPerPixel: number;
    primaryViewPromise: Promise<PrimaryView>;
    primaryView: PrimaryView;
}

const REGION_EXPANDER = new RegionExpander(1);

export function withTrackView(WrappedComponent: React.ComponentType<WrappedComponentProps>) {
    return class TrackViewManager extends React.Component<DataManagerProps, DataManagerState> {
        private _primaryGenome: string;
        private _alignmentCalculator: AlignmentViewCalculator;

        constructor(props: DataManagerProps) {
            super(props);
            this._primaryGenome = props.genome;
            this._alignmentCalculator = new AlignmentViewCalculator(props.genome);
            this.state = {
                error: null,
                primaryView: null,
            };
            this.fetchPrimaryView = memoizeOne(this.fetchPrimaryView);
            this.fetchPrimaryView(props.viewRegion, props.tracks);
        }

        getVisualizationWidth() {
            return Math.max(1, this.props.width - TrackLegend.WIDTH);
        }

        getSecondaryGenomes(tracks: TrackModel[]) {
            const genomeSet = new Set(tracks.map(track => track.getMetadata('genome')));
            genomeSet.delete(this._primaryGenome);
            genomeSet.delete(undefined);
            return Array.from(genomeSet);
        }

        async fetchPrimaryView(viewRegion: DisplayedRegionModel, tracks: TrackModel[]): Promise<PrimaryView> {
            const secondaryGenomes = this.getSecondaryGenomes(tracks);
            const expansion = REGION_EXPANDER.calculateExpansion(viewRegion, this.getVisualizationWidth());
            try {
                const primaryRegion = await this._alignmentCalculator.computePrimaryRegion(
                    expansion.visRegion, expansion.visWidth, secondaryGenomes[0]
                );

                const primaryView = expansion as PrimaryView;
                primaryView.visRegion = primaryRegion;
                primaryView.viewWindowRegion = viewRegion;
                this.setState({ primaryView, error: null });
                return primaryView;
            } catch (error) {
                this.setState({ error });
                throw error;
            }
        }

        fetchAlignments(viewRegion: DisplayedRegionModel, tracks: TrackModel[]): AlignmentPromises {
            const secondaryGenomes = this.getSecondaryGenomes(tracks);
            const expansion = REGION_EXPANDER.calculateExpansion(viewRegion, this.getVisualizationWidth());
            const alignmentForGenome: AlignmentPromises = {};
            for (const genome of secondaryGenomes) {
                alignmentForGenome[genome] = this._alignmentCalculator.computeSecondaryRegion(
                    viewRegion, expansion.visRegion, expansion.visWidth, genome
                );
            }
            return alignmentForGenome;
        }

        render() {
            if (this.state.error) {
                return <ErrorMessage>Cannot display: primary alignment failed.</ErrorMessage>;
            } else if (!this.state.primaryView) {
                return null;
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
