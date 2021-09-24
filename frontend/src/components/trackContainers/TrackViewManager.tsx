import React from "react";
import memoizeOne from "memoize-one";

import { withTrackLegendWidth } from "../withTrackLegendWidth";

import { TrackModel } from "../../model/TrackModel";
import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import { ViewExpansion, RegionExpander } from "../../model/RegionExpander";
import { MultiAlignmentViewCalculator, MultiAlignment } from "../../model/alignment/MultiAlignmentViewCalculator";
import { GenomeConfig } from "../../model/genomes/GenomeConfig";
import { getTrackConfig } from "../trackConfig/getTrackConfig";

interface ViewManagerProps {
    genome: string; // The primary genome
    tracks: TrackModel[]; // Tracks
    viewRegion: DisplayedRegionModel; // Region that the user requests to view
    legendWidth: number;
    containerWidth: number;
    expansionAmount: RegionExpander;
    genomeConfig: GenomeConfig;
}

interface ViewManagerState {
    primaryView: ViewExpansion | null;
}

export interface ViewAndAlignment {
    primaryView: ViewExpansion;
    alignments: MultiAlignment;
}

interface WrappedComponentProps extends ViewManagerState {
    viewAndAlignmentPromise: Promise<ViewAndAlignment>;
    basesPerPixel: number;
}

export function withTrackView(WrappedComponent: React.ComponentType<WrappedComponentProps>) {
    class TrackViewManager extends React.Component<ViewManagerProps, ViewManagerState> {
        private _mostRecentAlignmentCalculator: MultiAlignmentViewCalculator;

        constructor(props: ViewManagerProps) {
            super(props);
            this._getAlignmentCalculator = memoizeOne(this._getAlignmentCalculator);
            this.fetchPrimaryView = memoizeOne(this.fetchPrimaryView);
            this.state = { primaryView: null };
            this._mostRecentAlignmentCalculator = new MultiAlignmentViewCalculator(props.genomeConfig, []);
        }

        componentDidMount() {
            this.componentDidUpdate();
        }

        componentDidUpdate() {
            this.fetchPrimaryView(this.props.viewRegion, this.props.tracks, this.getVisualizationWidth());
        }

        getVisualizationWidth() {
            if (this.props.tracks.length === 1 && this.props.tracks[0].type === "g3d") {
                return Math.max(100, this.props.containerWidth);
            } else {
                return Math.max(100, this.props.containerWidth - this.props.legendWidth);
            }
        }

        private _getAlignmentCalculator(primaryGenomeConfig: GenomeConfig, tracks: TrackModel[]) {
            this._mostRecentAlignmentCalculator.cleanUp();
            this._mostRecentAlignmentCalculator = new MultiAlignmentViewCalculator(
                primaryGenomeConfig,
                tracks.filter(track => getTrackConfig(track).isGenomeAlignTrack())
            );
            return this._mostRecentAlignmentCalculator;
        }

        async fetchPrimaryView(viewRegion: DisplayedRegionModel, tracks: TrackModel[], visWidth: number) {
            const unalignedPrimaryView = this.props.expansionAmount.calculateExpansion(viewRegion, visWidth);
            const returnValue: ViewAndAlignment = {
                primaryView: unalignedPrimaryView,
                alignments: {}
            };
            try {
                const alignmentCalculator = this._getAlignmentCalculator(this.props.genomeConfig, this.props.tracks);
                const alignments = await alignmentCalculator.multiAlign(unalignedPrimaryView);
                const alignmentDatas = Object.values(alignments);
                returnValue.primaryView = alignmentDatas.length > 0 ? alignmentDatas[0].primaryVisData : unalignedPrimaryView;
                returnValue.alignments = alignments;
            } catch (error) {
                console.error(error);
                console.error("Falling back to nonaligned primary view");
            }
            if (viewRegion === this.props.viewRegion) {
                this.setState({ primaryView: returnValue.primaryView });
            }
            return returnValue;
        }

        render() {
            /**
             * Why do we have both a promise for the view and the resolved version in the props, instead of only the
             * resolved version?  The order things happen is (region change) --> (fetch alignments) --> (fetch tracks
             * using the alignments).  But there's a catch: we also need to recalculate alignments when the view window
             * changes (e.g. when the browser window is resized), AND this should not cause a data fetch.  So we cannot
             * rely on a change in alignment data to fetch track data; we have to use region changes.  And that is why
             * we effectively need to pass a way of fetching alignments in a Promise to the track data fetcher.
             */
            const { viewRegion, tracks } = this.props;
            const visWidth = this.getVisualizationWidth();
            return <WrappedComponent
                basesPerPixel={this.props.viewRegion.getWidth() / visWidth}
                viewAndAlignmentPromise={this.fetchPrimaryView(viewRegion, tracks, visWidth)}
                primaryView={this.state.primaryView}
                {...this.props}
            />;
        }
    }

    return withTrackLegendWidth(TrackViewManager);
}
