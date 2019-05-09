import React from 'react';
import memoizeOne from 'memoize-one';

import { withTrackLegendWidth } from '../withTrackLegendWidth';

import { TrackModel } from '../../model/TrackModel';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { ViewExpansion } from '../../model/RegionExpander';
import { GuaranteeMap } from '../../model/GuaranteeMap';
import { AlignmentViewCalculator, Alignment } from '../../model/alignment/AlignmentViewCalculator';

interface DataManagerProps {
    genome: string; // The primary genome
    tracks: TrackModel[]; // Tracks
    viewRegion: DisplayedRegionModel; // Region that the user requests to view
    legendWidth: number;
    containerWidth: number;
    expansionAmount: any;
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

export function withTrackView(WrappedComponent: React.ComponentType<WrappedComponentProps>) {
    class TrackViewManager extends React.Component<DataManagerProps, DataManagerState> {
        private _primaryGenome: string;
        private _alignmentCalculatorForGenome: GuaranteeMap<string, AlignmentViewCalculator>

        constructor(props: DataManagerProps) {
            super(props);
            this._primaryGenome = props.genome;
            this._alignmentCalculatorForGenome = new GuaranteeMap(
                queryGenome => new AlignmentViewCalculator(this._primaryGenome, queryGenome)
            );
            this.state = {
                primaryView: 
                    this.props.expansionAmount.calculateExpansion(props.viewRegion, this.getVisualizationWidth())
            };
            this.fetchPrimaryView = memoizeOne(this.fetchPrimaryView);
        }

        getVisualizationWidth() {
            return Math.max(1, this.props.containerWidth - this.props.legendWidth);
        }

        getSecondaryGenomes(tracks: TrackModel[]) {
            const genomeSet = new Set(tracks.map(track => track.querygenome || track.getMetadata('genome')));
            genomeSet.delete(this._primaryGenome);
            genomeSet.delete(undefined);
            return Array.from(genomeSet);
        }

        async fetchPrimaryView(viewRegion: DisplayedRegionModel, tracks: TrackModel[]): Promise<ViewExpansion> {
            const visData = this.props.expansionAmount.calculateExpansion(viewRegion, this.getVisualizationWidth());
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
            const visData = this.props.expansionAmount.calculateExpansion(viewRegion, this.getVisualizationWidth());
            const alignmentForGenome: AlignmentPromises = {};
            for (const genome of secondaryGenomes) {
                const alignmentCalculator = this._alignmentCalculatorForGenome.get(genome);
                alignmentForGenome[genome] = alignmentCalculator.align(visData);
            }
            return alignmentForGenome;
        }

        async componentDidUpdate(prevProps: DataManagerProps) {
            if (this.props.viewRegion !== prevProps.viewRegion || this.props.tracks !== prevProps.tracks) {
                const primaryView = await this.fetchPrimaryView(this.props.viewRegion, this.props.tracks);
                this.setState({primaryView});
            }
        }

        render() {
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

    return withTrackLegendWidth(TrackViewManager);
}
