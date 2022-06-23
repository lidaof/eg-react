import TrackModel from "./TrackModel";
import sampleDict from "./genomes/hg19/samples.json";
import assayDict from "./genomes/hg19/assays.json";

class HubParser {
    getTracksInHub(parsedJson, hubName, hubGenome, oldHubFormat, tracksStartIndex = 0, hubBase = "") {
        let tracks = [],
            url,
            newTrack;
        for (let plainObject of parsedJson.slice(tracksStartIndex)) {
            if (plainObject.url) {
                if (!plainObject.url.toLowerCase().startsWith("http")) {
                    // relative path
                    if (plainObject.type && plainObject.type.toLowerCase() === "cool") {
                        url = plainObject.url;
                    } else {
                        if (hubBase.length > 0) {
                            url = `${hubBase}/${plainObject.url}`;
                        } else {
                            continue;
                        }
                    }
                } else {
                    url = plainObject.url;
                }
                newTrack = new TrackModel({ ...plainObject, url });
            } else {
                // native track
                newTrack = new TrackModel(plainObject);
            }
            newTrack.datahub = hubName;
            if (!newTrack.metadata.genome && hubGenome !== "") {
                // Don't overwrite existing metadata.genome in hubs
                newTrack.metadata.genome = hubGenome;
            }
            if (oldHubFormat) {
                let assay = assayDict[newTrack.metadata.Assay] || ["unknown"];
                let sample = sampleDict[newTrack.metadata.Sample] || ["unknown"];
                newTrack.metadata.Assay = assay.slice(0, -1);
                newTrack.metadata.assayDetails = assay[assay.length - 1];
                newTrack.metadata.Sample = sample.slice(0, -1);
                newTrack.sampleDetails = sample[sample.length - 1];
            }
            tracks.push(newTrack);
        }
        return tracks;
    }
}

export default HubParser;
