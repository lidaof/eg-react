import React from "react";
import _ from "lodash";

import { ViewAndAlignment } from "./TrackViewManager";
import { getTrackConfig } from "../trackConfig/getTrackConfig";
import { TrackConfig } from "../trackConfig/TrackConfig";
import DataSource from "../../dataSources/DataSource";

import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import { TrackModel } from "../../model/TrackModel";
import NavigationContext from "../../model/NavigationContext";
import { GuaranteeMap } from "../../model/GuaranteeMap";
import { Alignment } from "../../model/alignment/MultiAlignmentViewCalculator";
import { GenomeConfig } from "../../model/genomes/GenomeConfig";

interface TrackDataMap {
    [id: number]: TrackData;
}

interface DataManagerProps {
    genome: string; // The primary genome
    tracks: TrackModel[]; // Tracks
    viewRegion: DisplayedRegionModel; // Region that the user requested
    basesPerPixel: number;
    genomeConfig: GenomeConfig;
    viewAndAlignmentPromise: Promise<ViewAndAlignment>;
}

export interface TrackData {
    alignment: Alignment;
    visRegion: DisplayedRegionModel;
    data: any[];
    meta?: any; // track file meta information
    isLoading: boolean;
    error?: any;
}
const INITIAL_TRACK_DATA: TrackData = {
    alignment: null,
    visRegion: new DisplayedRegionModel(new NavigationContext("", [NavigationContext.makeGap(1000)])),
    data: [],
    meta: {},
    isLoading: true,
    error: null,
};

export function withTrackData(WrappedComponent: React.ComponentType<{ trackData: TrackDataMap }>) {
    return class TrackDataManager extends React.Component<DataManagerProps, TrackDataMap> {
        private _dataSourceManager: DataSourceManager;

        constructor(props: DataManagerProps) {
            super(props);
            this._dataSourceManager = new DataSourceManager();
            this.state = {};
        }

        componentDidMount() {
            this.fetchAllTracks();
        }

        componentDidUpdate(prevProps: DataManagerProps) {
            if (this.props.viewRegion !== prevProps.viewRegion) {
                this.fetchAllTracks(
                    trackConfig => trackConfig.shouldFetchBecauseRegionChange(trackConfig.getOptions())
                );
            } else if (this.props.tracks !== prevProps.tracks) {
                this.detectChangedTracks(prevProps.tracks); // Fetch some
            } else if (this.props.viewAndAlignmentPromise !== prevProps.viewAndAlignmentPromise) {
                this.fetchAllTracks(trackConfig => trackConfig.isGenomeAlignTrack());
            }
        }

        componentWillUnmount() {
            this._dataSourceManager.cleanUpAll();
        }

        isViewStillFresh(region: DisplayedRegionModel) {
            return region === this.props.viewRegion;
        }

        detectChangedTracks(prevTracks: TrackModel[]) {
            const currentTracks = this.props.tracks;
            const prevTrackForId = new Map();
            for (const track of prevTracks) {
                prevTrackForId.set(track.getId(), track);
            }

            const addedTracks = _.differenceBy(currentTracks, prevTracks, (track) => track.getId());
            const removedTracks = _.differenceBy(prevTracks, currentTracks, (track) => track.getId());
            const keptTracks = _.intersectionBy(currentTracks, prevTracks, (track) => track.getId());
            for (const track of addedTracks) {
                this.fetchTrack(track);
            }

            for (const track of keptTracks) {
                const prevTrack = prevTrackForId.get(track.getId());
                const config = getTrackConfig(track);
                const prevConfig = getTrackConfig(prevTrack);
                if (config.shouldFetchBecauseOptionChange(prevConfig.getOptions(), config.getOptions())) {
                    this.fetchTrack(track);
                }
            }

            // Clean up the data sources and state of removed tracks
            const deletionUpdate = {};
            for (const track of removedTracks) {
                const id = track.getId();
                this._dataSourceManager.cleanUp(id);
                delete deletionUpdate[id];
            }
            this.setState(deletionUpdate);
        }

        fetchAllTracks(filter=(trackConfig: TrackConfig) => true) {
            for (const track of this.props.tracks) {
                const config = getTrackConfig(track);
                if (filter(config)) {
                    this.fetchTrack(track);
                }
            }
        }

        async fetchTrack(track: TrackModel) {
            const requestedRegion = this.props.viewRegion;
            this.dispatchTrackUpdate(track, { isLoading: true });

            const { primaryView, alignments } = await this.props.viewAndAlignmentPromise;
            const genome = track.querygenome || track.getMetadata("genome");
            const trackConfig = getTrackConfig(track);
            const options = trackConfig.getOptions();

            let visRegion, alignment = null;
            if (!genome || genome === this.props.genome) { // Is primary genome?
                visRegion = primaryView.visRegion;
            } else {
                alignment = alignments[genome];
                visRegion = alignment.queryRegion;
            }

            const dataRegion = options.fetchViewWindowOnly ? primaryView.viewWindowRegion : visRegion;
            const dataSource = this._dataSourceManager.getDataSource(track);
            try {
                const rawData = await dataSource.getData(dataRegion, this.props.basesPerPixel, options);
                if (this.isViewStillFresh(requestedRegion)) {
                    this.dispatchTrackUpdate(track, {
                        alignment,
                        visRegion,
                        data: trackConfig.formatData(rawData),
                        meta: dataSource.getCurrentMeta(dataRegion, this.props.basesPerPixel, options),
                        isLoading: false,
                        error: null,
                    });
                }
            } catch (error) {
                if (this.isViewStillFresh(requestedRegion)) {
                    console.error(error);
                    this.dispatchTrackUpdate(track, {
                        isLoading: false,
                        error,
                    });
                }
            }
        }

        dispatchTrackUpdate(track: TrackModel, newTrackState: Partial<TrackData>) {
            const id = track.getId();
            this.setState((prevState) => {
                const update = {};
                const prevTrackData = prevState[id] || INITIAL_TRACK_DATA;
                update[id] = {
                    ...prevTrackData,
                    ...newTrackState,
                };
                return update;
            });
        }

        getTrackData() {
            const ids = this.props.tracks.map((track) => track.getId());
            const result: TrackDataMap = {};
            let isMissingData = false;
            for (const id of ids) {
                if (!(id in this.state)) {
                    result[id] = INITIAL_TRACK_DATA;
                    isMissingData = true;
                }
            }

            if (isMissingData) {
                return Object.assign(result, this.state);
            } else {
                return this.state;
            }
        }

        render() {
            return <WrappedComponent trackData={this.getTrackData()} {...this.props} />;
        }
    };
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