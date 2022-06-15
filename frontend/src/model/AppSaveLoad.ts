import TrackModel from "./TrackModel";
import RegionSet from "./RegionSet";
import DisplayedRegionModel from "./DisplayedRegionModel";
import { getGenomeConfig } from "./genomes/allGenomes";
import { AppState, DEFAULT_TRACK_LEGEND_WIDTH } from "../AppState";
import OpenInterval from "./interval/OpenInterval";
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
    toObject(appState: AppState): object {
        const regionSetViewIndex = appState.regionSets.findIndex((set) => set === appState.regionSetView);
        const object = {
            genomeName: appState.genomeName,
            viewInterval: appState.viewRegion ? appState.viewRegion.getContextCoordinates().serialize() : null,
            tracks: appState.tracks.filter((track) => !track.fileObj).map((track) => track.serialize()),
            metadataTerms: appState.metadataTerms,
            regionSets: appState.regionSets.map((set) => set.serialize()),
            regionSetViewIndex,
            trackLegendWidth: appState.trackLegendWidth,
            bundleId: appState.bundleId,
            isShowingNavigator: appState.isShowingNavigator,
            isShowingVR: appState.isShowingVR,
            layout: appState.layout,
            highlights: appState.highlights,

            // TODO: Add support for savings/loading containers. 
            // Currently, it fails because DisplayedRegionModel inside the containers isn't converted properly
            // containers: appState.containers,
            // compatabilityMode: appState.compatabilityMode,
            // threedTracks: appState.threedTracks.filter((track) => !track.fileObj).map((track) => track.serialize()),
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
        const regionSets = object.regionSets ? object.regionSets.map(RegionSet.deserialize) : [];
        const regionSetView = regionSets[object.regionSetViewIndex] || null;
        return {
            genomeName: object.genomeName,
            viewRegion: this._restoreViewRegion(object, regionSetView),
            tracks: object.tracks.map((data: any) => TrackModel.deserialize(data)),
            metadataTerms: object.metadataTerms || [],
            regionSets,
            regionSetView,
            trackLegendWidth: object.trackLegendWidth || DEFAULT_TRACK_LEGEND_WIDTH,
            bundleId: object.bundleId,
            isShowingNavigator: object.isShowingNavigator,
            isShowingVR: object.isShowingVR,
            layout: object.layout || {},
            highlights: object.highlights || [],

            containers: object.containers,
            compatabilityMode: object.compatabilityMode,
            // threedTracks: object.threedTracks.map((data: any) => TrackModel.deserialize(data)),
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

        let viewInterval;
        if (object.hasOwnProperty("viewInterval")) {
            viewInterval = OpenInterval.deserialize(object.viewInterval);
        } else {
            viewInterval = genomeConfig.navContext.parse(object.displayRegion);
        }
        if (regionSetView) {
            return new DisplayedRegionModel(regionSetView.makeNavContext(), ...viewInterval);
        } else {
            return new DisplayedRegionModel(genomeConfig.navContext, ...viewInterval);
        }
    }
}
