import TrackModel from './TrackModel';
import sampleDict from './genomes/hg19/samples.json';
import assayDict from './genomes/hg19/assays.json';

class HubParser {
    getTracksInHub(parsedJson, hubName, oldHubFormat, tracksStartIndex=0) {
        let tracks = [];
        for (let plainObject of parsedJson.slice(tracksStartIndex)) {
            let newTrack = new TrackModel(plainObject);
            newTrack.datahub = hubName;
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
