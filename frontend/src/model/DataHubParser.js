import TrackModel from './TrackModel';
import sampleDict from './genomes/hg19/samples.json';
import assayDict from './genomes/hg19/assays.json';

class HubParser {
    constructor(tracksStartIndex=0) {
        this.tracksStartIndex = tracksStartIndex;
    }

    getTracksInHub(parsedJson, hubName) {
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
