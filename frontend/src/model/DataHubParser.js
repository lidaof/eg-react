import axios from 'axios';
import TrackModel from './TrackModel';

class HubParser {
    constructor(tracksStartIndex=0) {
        this.tracksStartIndex = tracksStartIndex;
        this.samplesPromise = axios.get("/samples.json");
        this.assaysPromise = axios.get("/assays.json");
    }

    async getTracksInHub(parsedJson, hubName) {
        let jsonPromises = Promise.all([this.samplesPromise, this.assaysPromise]);
        let jsons = await jsonPromises;
        let sampleDict = jsons[0].data;
        let assayDict = jsons[1].data;

        let tracks = [];
        for (let plainObject of parsedJson.slice(this.tracksStartIndex)) {
            let newTrack = new TrackModel(plainObject);
            let assay = assayDict[newTrack.metadata.Assay] || ["unknown"];
            let sample = sampleDict[newTrack.metadata.Sample] || ["unknown"];
            newTrack.datahub = hubName;
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
