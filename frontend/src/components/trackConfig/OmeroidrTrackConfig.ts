import { TrackModel } from "./../../model/TrackModel";
import { OmeroTrackConfig } from "./OmeroTrackConfig";
import _ from "lodash";

const IMAGE_URL = "https://idr.openmicroscopy.org/webclient/render_image";
const IMAGE_URL_SUFFIX = "";
const DETAIL_URL = "https://idr.openmicroscopy.org/webclient/img_detail";
const THUMBNAIL_URL = "https://idr.openmicroscopy.org/webclient/render_thumbnail";
const THUMBNAIL_URL_SUFFIX = "";
const THUMBNAIL_DATA = "https://idr.openmicroscopy.org/webclient/get_thumbnails";

export class OmeroidrTrackConfig extends OmeroTrackConfig {
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
    }
}
