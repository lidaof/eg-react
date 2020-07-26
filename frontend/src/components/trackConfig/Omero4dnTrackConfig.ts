import { TrackModel } from "../../model/TrackModel";
import { OmeroTrackConfig } from "./OmeroTrackConfig";
import _ from "lodash";

const IMAGE_URL = "https://omero.hms.harvard.edu/webgateway/render_thumbnail";
const IMAGE_URL_SUFFIX = "360/";
const DETAIL_URL = "https://omero.hms.harvard.edu/pathviewer/vanilla-viewer";
const THUMBNAIL_DATA = "https://omero.hms.harvard.edu/webgateway/get_thumbnails";
const THUMBNAIL_URL = "https://omero.hms.harvard.edu/webgateway/render_thumbnail";
const THUMBNAIL_URL_SUFFIX = "100/";

export class Omero4dnTrackConfig extends OmeroTrackConfig {
    constructor(trackModel: TrackModel) {
        super(trackModel);
        const apiConfig = {
            imageUrl: IMAGE_URL,
            imageUrlSuffix: IMAGE_URL_SUFFIX,
            detailUrl: DETAIL_URL,
            thumbnailUrl: THUMBNAIL_URL,
            thumbnailUrlSuffix: THUMBNAIL_URL_SUFFIX,
            thumbnailData: THUMBNAIL_DATA,
        };
        if (_.isEmpty(trackModel.apiConfig)) {
            trackModel.apiConfig = apiConfig;
        }
        trackModel.options = { ...trackModel.options, imageAspectRatio: 1, imageHeight: [100] };
    }
}
