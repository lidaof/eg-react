import $ from 'jquery';
import JSON5 from 'json5';
import TrackModel from './model/TrackModel';

// const VOCAB_INDEX = 0;
const TRACKS_START_INDEX = 1;

class HubParser {
    getJson(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                dataType: "text", // Expected type of data from server
            })
            .done(data => resolve(JSON5.parse(data)))
            .fail(reject);
        });
    }

    async getTracksInHub(hubMetadata) {
        let jsonPromises = Promise.all([
            this.getJson(hubMetadata.url),
            this.getJson("/samples.json"),
            this.getJson("/assays.json"),
        ]);
        let jsons = await jsonPromises;
        let hub = jsons[0];
        let sampleDict = jsons[1];
        let assayDict = jsons[2];

        let tracks = [];
        for (let plainObject of hub.slice(TRACKS_START_INDEX)) {
            let newTrack = null;
            try {
                newTrack = new TrackModel(plainObject);
            } catch(error) { // Can't be converted to a TrackModel object
                if (error instanceof TypeError) {
                    console.warn(`Encounted a badly-formatted track in hub ${hubMetadata.name}:`);
                    console.warn(plainObject);
                    continue;
                }
            }

            let assay = assayDict[newTrack.metadata.Assay] || ["unknown"];
            let sample = sampleDict[newTrack.metadata.Sample] || ["unknown"];
            newTrack.datahub = hubMetadata.name;
            newTrack.metadata.Assay = assay.slice(0, -1);
            newTrack.metadata.assayDetails = assay[assay.length - 1];
            newTrack.metadata.Sample = sample.slice(0, -1);
            newTrack.sampleDetails = sample[sample.length - 1];
            tracks.push(newTrack);
        }

        return tracks;
    }
}

export default HubParser;
