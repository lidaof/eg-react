import React from "react";
import _ from "lodash";

import { getTrackConfig } from "../trackConfig/getTrackConfig";
import DataSource from "../../dataSources/DataSource";

import DisplayedRegionModel from "../../model/DisplayedRegionModel";
import { TrackModel } from "../../model/TrackModel";
import NavigationContext from "../../model/NavigationContext";
import { GuaranteeMap } from "../../model/GuaranteeMap";
import { ViewExpansion } from "../../model/RegionExpander";
import {
  Alignment,
  MultiAlignment
} from "../../model/alignment/MultiAlignmentViewCalculator";
import { GenomeConfig } from "../../model/genomes/GenomeConfig";
interface TrackDataMap {
  [id: number]: TrackData;
}

interface DataManagerProps {
  genome: string; // The primary genome
  tracks: TrackModel[]; // Tracks
  viewRegion: DisplayedRegionModel; // Region that the user requested
  basesPerPixel: number;
  alignments: MultiAlignment;
  primaryViewPromise: Promise<ViewExpansion>;
  genomeConfig: GenomeConfig;
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
  visRegion: new DisplayedRegionModel(
    new NavigationContext("", [NavigationContext.makeGap(1000)])
  ),
  data: [],
  isLoading: true,
  error: null
};

export function withTrackData(
  WrappedComponent: React.ComponentType<{ trackData: TrackDataMap }>
) {
  return class TrackDataManager extends React.Component<
    DataManagerProps,
    TrackDataMap
    > {
    private _dataSourceManager: DataSourceManager;
    private _primaryGenome: string;
    private _primaryGenomeConfig: GenomeConfig;

    constructor(props: DataManagerProps) {
      super(props);
      this._primaryGenome = props.genome;
      this._primaryGenomeConfig = props.genomeConfig;
      this._dataSourceManager = new DataSourceManager();
      this.state = {};
    }

    componentDidMount() {
      this.initTracksFetch();
    }

    componentDidUpdate(prevProps: DataManagerProps) {
      if (this.props.viewRegion !== prevProps.viewRegion) {
        this.fetchAllTracks(prevProps.viewRegion, this.props.viewRegion);
      } else if (this.props.tracks !== prevProps.tracks) {
        this.detectChangedTracks(prevProps.tracks, prevProps.viewRegion); // Fetch some
      }
    }

    componentWillUnmount() {
      this._dataSourceManager.cleanUpAll();
    }

    isViewStillFresh(region: DisplayedRegionModel) {
      return region === this.props.viewRegion;
    }

    detectChangedTracks(
      prevTracks: TrackModel[],
      prevRegion: DisplayedRegionModel
    ) {
      const currentTracks = this.props.tracks;
      const prevTrackForId = new Map();
      for (const track of prevTracks) {
        prevTrackForId.set(track.getId(), track);
      }

      const addedTracks = _.differenceBy(currentTracks, prevTracks, track =>
        track.getId()
      );
      const removedTracks = _.differenceBy(prevTracks, currentTracks, track =>
        track.getId()
      );
      const keptTracks = _.intersectionBy(currentTracks, prevTracks, track =>
        track.getId()
      );
      for (const track of addedTracks) {
        this.fetchTrack(track);
      }

      for (const track of keptTracks) {
        const prevTrack = prevTrackForId.get(track.getId());
        const config = getTrackConfig(track);
        const prevConfig = getTrackConfig(prevTrack);
        if (
          config.shouldFetchBecauseOptionChange(
            prevConfig.getOptions(),
            config.getOptions()
          )
        ) {
          this.fetchTrack(track);
        } else if (
          config.shouldFetchBecauseRegionChange(
            config.getOptions(),
            prevRegion,
            this.props.viewRegion
          )
        ) {
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

    initTracksFetch() {
      for (const track of this.props.tracks) {
        this.fetchTrack(track);
      }
    }

    fetchAllTracks(
      prevRegion: DisplayedRegionModel,
      currRegion: DisplayedRegionModel
    ) {
      for (const track of this.props.tracks) {
        const config = getTrackConfig(track);
        if (
          config.shouldFetchBecauseRegionChange(
            config.getOptions(),
            prevRegion,
            currRegion
          )
        ) {
          this.fetchTrack(track);
        }
      }
    }

    async fetchTrack(track: TrackModel) {
      this.dispatchTrackUpdate(track, { isLoading: true });

      const view = this.props.viewRegion;
      // for genome align track, use the primay genome as genome
      const genome = track.querygenome || track.getMetadata("genome");
      try {
        let visRegion;
        let alignment = null;
        if (!genome || genome === this._primaryGenome) {
          const primaryView = await this.props.primaryViewPromise;
          visRegion = primaryView.visRegion;
        } else {
          const alignments = await this.props.alignments;
          alignment = alignments[genome];
          visRegion = alignment.queryRegion;
        }

        if (!this.isViewStillFresh(view)) {
          return;
        }

        const trackConfig = getTrackConfig(track);
        const dataSource = this._dataSourceManager.getDataSource(track);
        const rawData = await dataSource.getData(
          visRegion,
          this.props.basesPerPixel,
          trackConfig.getOptions()
        );

        if (this.isViewStillFresh(view)) {
          this.dispatchTrackUpdate(track, {
            alignment,
            visRegion,
            data: trackConfig.formatData(rawData),
            isLoading: false,
            error: null
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
        const update = {};
        const prevTrackData = prevState[id] || INITIAL_TRACK_DATA;
        update[id] = {
          ...prevTrackData,
          ...newTrackState
        };
        return update;
      });
    }

    getTrackData() {
      const ids = this.props.tracks.map(track => track.getId());
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
      return (
        <WrappedComponent trackData={this.getTrackData()} {...this.props} />
      );
    }
  };
}

class DataSourceManager {
  private _dataSourceForTrackId: GuaranteeMap<number, DataSource>;
  constructor() {
    const initDataSource = (id: number, track: TrackModel) =>
      getTrackConfig(track).initDataSource();
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
