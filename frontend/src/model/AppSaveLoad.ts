import TrackModel from './TrackModel';
import RegionSet from './RegionSet';
import DisplayedRegionModel from './DisplayedRegionModel';
import { getGenomeConfig } from './genomes/allGenomes';
import { AppState, DEFAULT_TRACK_LEGEND_WIDTH } from '../AppState';
import OpenInterval from './interval/OpenInterval';
// import { withFirebase } from 'react-redux-firebase'

/**
 * Converter of app state to plain objects and JSON.  In other words, app state serializer.
 * 
 * @author Silas Hsu
 * @see {AppState}
 */
export class AppStateSaver {
    /**
     * @param {Object} appState - app state tree
     * @return {string} - JSON representing app state
     */
    toJSON(appState: AppState) {
        return JSON.stringify(this.toObject(appState));
    }

    /**
     * @param {Object} appState - app state tree
     * @return {Object} plain object representing app state
     */
    toObject(appState: AppState) {
        const regionSetViewIndex = appState.regionSets.findIndex(set => set === appState.regionSetView);
        const object = {
            genomeName: appState.genomeName,
            viewInterval: appState.viewRegion ? appState.viewRegion.getContextCoordinates().serialize() : null,
            tracks: appState.tracks,
            metadataTerms: appState.metadataTerms,
            regionSets: appState.regionSets.map(set => set.serialize()),
            regionSetViewIndex,
            trackLegendWidth: appState.trackLegendWidth,
            sessionId: appState.sessionId,
            sessionStatus: appState.sessionStatus,
        };
        return object;
    }
}

/**
 * Converter of JSON and plain objects to app state.  In other words, app state deserializer.
 * 
 * @author Silas Hsu
 * @see {AppState}
 */
export class AppStateLoader {
    /**
     * @param {string} blob - JSON representing app state
     * @return {Object} app state tree parsed from JSON
     */
    fromJSON(blob: string) {
        return this.fromObject(JSON.parse(blob));
    }

    /**
     * @param {AppState} object - plain object representing app state
     * @return {Object} app state tree inferred from the object
     * @throws {Error} on deserialization errors
     */
    fromObject(object: any): AppState {
        const regionSets = object.regionSets.map(RegionSet.deserialize);
        const regionSetView = regionSets[object.regionSetViewIndex] || null;
        return {
            genomeName: object.genomeName,
            viewRegion: this._restoreViewRegion(object, regionSetView),
            tracks: object.tracks.map((data: any) => new TrackModel(data)),
            metadataTerms: object.metadataTerms,
            regionSets,
            regionSetView,
            trackLegendWidth: object.trackLegendWidth || DEFAULT_TRACK_LEGEND_WIDTH,
            sessionId: object.sessionId,
            sessionStatus: object.sessionStatus,
        };
    }

    /**
     * Infers the DisplayedRegionModel from the plain object representing app state.  Takes a already-deserialized
     * RegionSet as an optional parameter, because if the app was in region set view when it was saved, we will want to
     * restore that, not the genome view.
     * 
     * @param {Object} object - plain object representing app state
     * @param {RegionSet} [regionSetView] - (optional) already-deserialized RegionSet from the object
     * @return {DisplayedRegionModel} - inferred view region
     */
    _restoreViewRegion(object: any, regionSetView: RegionSet) {
        const genomeConfig = getGenomeConfig(object.genomeName);
        if (!genomeConfig) {
            return null;
        }

        const viewInterval = OpenInterval.deserialize(object.viewInterval);
        if (regionSetView) {
            return new DisplayedRegionModel(regionSetView.makeNavContext(), ...viewInterval);
        } else {
            return new DisplayedRegionModel(genomeConfig.navContext, ...viewInterval);
        }
    }
}
