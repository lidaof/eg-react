import Feature from "./Feature";
import ChromosomeInterval from "./interval/ChromosomeInterval";
import BedRecord from "../dataSources/bed/BedRecord";

enum ImageRecordColumnIndex {
    VALUE = 3,
}

/**
 * A data container for a idr images.
 *
 * @author Daofeng Li
 */
class ImageRecord extends Feature {
    /*
    Input， strings like following
    chr11	448267	491393	[{"imageId": "1324597", "details": {"Plate Name": "0308-01--2007-04-03", "Well Name": "a24", "Well": "615846", "Channels": "dapi: DNA;vsvg-cfp: CFP-tsO45G ;pm-647: cell surface tsO45G", "siRNA Identifier": "SI00695583", "Antisense Sequence": "UAUUGGUUCUCUUUGCUCGtg", "Sense Sequence": "CGAGCAAAGAGAACCAAUAtt"}}, {"imageId": "1325145", "details": {"Plate Name": "0308-02--2007-04-04", "Well Name": "a24", "Well": "616394", "Channels": "dapi: DNA;vsvg-cfp: CFP-tsO45G ;pm-647: cell surface tsO45G", "siRNA Identifier": "SI00695583", "Antisense Sequence": "UAUUGGUUCUCUUUGCUCGtg", "Sense Sequence": "CGAGCAAAGAGAACCAAUAtt"}}, {"imageId": "1325612", "details": {"Plate Name": "0308-03--2007-04-04", "Well Name": "a24", "Well": "616862", "Channels": "dapi: DNA;vsvg-cfp: CFP-tsO45G ;pm-647: cell surface tsO45G", "siRNA Identifier": "SI00695583", "Antisense Sequence": "UAUUGGUUCUCUUUGCUCGtg", "Sense Sequence": "CGAGCAAAGAGAACCAAUAtt"}}, {"imageId": "1326011", "details": {"Plate Name": "0308-04--2007-04-14", "Well Name": "a24", "Well": "617261", "Channels": "dapi: DNA;vsvg-cfp: CFP-tsO45G ;pm-647: cell surface tsO45G", "siRNA Identifier": "SI00695583", "Antisense Sequence": "UAUUGGUUCUCUUUGCUCGtg", "Sense Sequence": "CGAGCAAAGAGAACCAAUAtt"}}, {"imageId": "1326277", "details": {"Plate Name": "0308-05--2007-04-15", "Well Name": "a24", "Well": "617526", "Channels": "dapi: DNA;vsvg-cfp: CFP-tsO45G ;pm-647: cell surface tsO45G", "siRNA Identifier": "SI00695583", "Antisense Sequence": "UAUUGGUUCUCUUUGCUCGtg", "Sense Sequence": "CGAGCAAAGAGAACCAAUAtt"}}]
    /**
     * Constructs a new ImageRecord, given a string from tabix
     *
     */
    images: any[];
    constructor(bedRecord: BedRecord) {
        const locus = new ChromosomeInterval(bedRecord.chr, bedRecord.start, bedRecord.end);
        super("", locus);
        this.images = JSON.parse(bedRecord[ImageRecordColumnIndex.VALUE]);
    }
}

export default ImageRecord;
