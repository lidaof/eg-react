import $ from 'jquery';
import JSON5 from 'json5';
import TrackModel from './TrackModel';

class HubParser {
    constructor(tracksStartIndex=1) {
        this.tracksStartIndex = tracksStartIndex;
    }

    getJson(url) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: url,
                dataType: "text", // Expected type of data from server
            })
            .done(data => {
                try {
                    resolve(JSON5.parse(data));
                } catch (error) {
                    reject(error);
                }
            })
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
        for (let plainObject of hub.slice(this.tracksStartIndex)) {
            let newTrack = new TrackModel(plainObject);
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
