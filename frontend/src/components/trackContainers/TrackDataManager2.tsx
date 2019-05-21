import React from 'react';
import _ from 'lodash';

// import { AlignmentPromises } from './TrackViewManager';
import { getTrackConfig } from '../trackConfig/getTrackConfig';
import DataSource from '../../dataSources/DataSource';

import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { TrackModel } from '../../model/TrackModel';
import NavigationContext from '../../model/NavigationContext';
import { GuaranteeMap } from '../../model/GuaranteeMap';
import { ViewExpansion } from '../../model/RegionExpander';
import { Alignment } from '../../model/alignment/AlignmentViewCalculator';

interface TrackDataMap {
    [id: number]: TrackData
}

interface DataManagerProps {
    genome: string; // The primary genome
    tracks: TrackModel[]; // Tracks
    viewRegion: DisplayedRegionModel; // Region that the user requested
    basesPerPixel: number;
    // alignments: AlignmentPromises;
    primaryViewPromise: Promise<ViewExpansion>;
}

export interface TrackData {
    alignment: Alignment;
    visRegion: DisplayedRegionModel;
    data: any[];
    isLoading: boolean;
    error?: any;
}
const INITIAL_TRACK_DATA: TrackData = {
    alignment: null,
    visRegion: new DisplayedRegionModel(new NavigationContext('', [NavigationContext.makeGap(1000)])),
    data: [],
    isLoading: true,
    error: null
};

export function withTrackData(WrappedComponent: React.ComponentType<{trackData: TrackDataMap}>) {
    return class TrackDataManager extends React.Component<DataManagerProps, {dataForId: TrackDataMap}> {
        private _dataSourceManager: DataSourceManager;
        private _primaryGenome: string;

        constructor(props: DataManagerProps) {
            super(props);
            this._primaryGenome = props.genome;
            this._dataSourceManager = new DataSourceManager();
            this.state = {
                dataForId: {}
            };
        }

        componentDidMount() {
            this.detectNeededTrackUpdates();
        }

        componentDidUpdate(prevProps: DataManagerProps) {
            if (this.props.viewRegion !== prevProps.viewRegion) {
                this.detectNeededTrackUpdates(); // Fetch all
            } else if (this.props.tracks !== prevProps.tracks) {
                this.detectNeededTrackUpdates(prevProps.tracks); // Fetch some
            }
        }

        componentWillUnmount() {
            this._dataSourceManager.cleanUpAll();
        }

        isViewStillFresh(region: DisplayedRegionModel) {
            return region === this.props.viewRegion;
        }

        detectNeededTrackUpdates(prevTracks: TrackModel[] = []) {
            const addedTracks = _.differenceBy(this.props.tracks, prevTracks, track => track.getId());
            const removedTracks = _.differenceBy(prevTracks, this.props.tracks, track => track.getId());
            for (const track of addedTracks) {
                this.fetchTrack(track);
            }

            // Clean up the data sources and state of removed tracks
            const deletionUpdate = _.clone(this.state.dataForId);
            for (const track of removedTracks) {
                const id = track.getId();
                this._dataSourceManager.cleanUp(id);
                delete deletionUpdate[id];
            }
            this.setState({dataForId: deletionUpdate});
        }

        async fetchTrack(track: TrackModel) {
            this.dispatchTrackUpdate(track, { isLoading: true });

            const view = this.props.viewRegion;
            const genome = track.getMetadata('genome');
            try {
                let visRegion;
                let alignment = null;
                if (!genome || genome === this._primaryGenome) {
                    const primaryView = await this.props.primaryViewPromise;
                    visRegion = primaryView.visRegion;
                } else {
                    // alignment = await this.props.alignments[genome];
                    // visRegion = alignment.queryRegion;
                }

                if (!this.isViewStillFresh(view)) {
                    return;
                }

                const trackConfig = getTrackConfig(track);
                const dataSource = this._dataSourceManager.getDataSource(track);
                const rawData = await dataSource.getData(visRegion, this.props.basesPerPixel, trackConfig.getOptions());
                
                if (this.isViewStillFresh(view)) {
                    this.dispatchTrackUpdate(track, {
                        alignment,
                        visRegion,
                        data: trackConfig.formatData(rawData),
                        isLoading: false,
                        error: null,
                    });
                }
            } catch (error) {
                if (this.isViewStillFresh(view)) {
                    console.error(error);
                    this.dispatchTrackUpdate(track, {
                        isLoading: false,
                        error
                    });
                }
            }
        }

        dispatchTrackUpdate(track: TrackModel, newTrackState: Partial<TrackData>) {
            const id = track.getId();
            this.setState(prevState => {
                const update = _.clone(prevState.dataForId);
                const prevTrackData = prevState[id] || INITIAL_TRACK_DATA;
                update[id] = {
                    ...prevTrackData,
                    ...newTrackState
                };
                return {dataForId: update};
            });
        }

        getTrackData() {
            const ids = this.props.tracks.map(track => track.getId());
            const result: TrackDataMap = {};
            let isMissingData = false;
            for (const id of ids) {
                if (!(id in this.state.dataForId)) {
                    result[id] = INITIAL_TRACK_DATA;
                    isMissingData = true;
                }
            }

            if (isMissingData) {
                return Object.assign(result, this.state.dataForId);
            } else {
                return this.state.dataForId;
            }
        }

        render() {
            return <WrappedComponent trackData={this.getTrackData()} {...this.props} />
        }
    }
}

class DataSourceManager {
    private _dataSourceForTrackId: GuaranteeMap<number, DataSource>;
    constructor() {
        const initDataSource = (id: number, track: TrackModel) => getTrackConfig(track).initDataSource();
        this._dataSourceForTrackId = new GuaranteeMap(initDataSource);
    }

    cleanUpAll() {
        for (const dataSource of this._dataSourceForTrackId.values()) {
            dataSource.cleanUp();
        }
        this._dataSourceForTrackId.clear();
    }

    cleanUp(id: number) {
        if (this._dataSourceForTrackId.has(id)) {
            this._dataSourceForTrackId.get(id).cleanUp();
            this._dataSourceForTrackId.delete(id);
        }
    }

    getDataSource(track: TrackModel): DataSource {
        return this._dataSourceForTrackId.get(track.getId(), track);
    }
}
