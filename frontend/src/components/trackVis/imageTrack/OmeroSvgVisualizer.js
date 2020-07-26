import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import _ from "lodash";
import OpenInterval from "model/interval/OpenInterval";
import { MAX_NUMBER_THUMBNAILS, THUMBNAIL_PADDING } from "./OmeroTrack";
import { ensureMaxListLength } from "../../../util";
import TrackModel from "model/TrackModel";

export class OmeroSvgVisualizer extends React.PureComponent {
    static propTypes = {
        options: PropTypes.object,
        data: PropTypes.array.isRequired,
        viewWindow: PropTypes.instanceOf(OpenInterval),
        width: PropTypes.number,
        trackModel: PropTypes.instanceOf(TrackModel),
        imageAspectRatio: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.state = {
            imageData: [],
        };
    }

    async componentDidMount() {
        await this.fetchAllImage();
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.data !== this.props.data) {
            await this.fetchAllImage();
        }
    }

    fetchAllImage = async () => {
        const { data } = this.props;
        const imageAllIds = _.flatten(data.map((d) => d.images.map((img) => img.imageId)));
        const imageIds = ensureMaxListLength(imageAllIds, MAX_NUMBER_THUMBNAILS);
        const promises = imageIds.map((id) => this.fetchImageData(id));
        const imageData = await Promise.all(promises);
        this.setState({ imageData });
    };

    fetchImageData = async (imgId) => {
        try {
            const { thumbnailData } = this.props.trackModel.apiConfig;
            const url = `${thumbnailData}/?id=${imgId}`;
            const req = await axios.get(url);
            return req.data[imgId];
        } catch (error) {
            console.error(error);
        }
    };

    render() {
        const { viewWindow, width, height, thumbnailHeight, imageAspectRatio } = this.props;
        const { imageData } = this.state;
        const imageWidth = thumbnailHeight * imageAspectRatio;
        let x = 0,
            y = THUMBNAIL_PADDING,
            rowImgCount = 0;
        const imgs = imageData.map((img, idx) => {
            x = viewWindow.start + (idx - rowImgCount) * (THUMBNAIL_PADDING + imageWidth);
            if (x + imageWidth > viewWindow.end) {
                x = viewWindow.start;
                y += THUMBNAIL_PADDING + thumbnailHeight;
                rowImgCount = idx;
            }
            return <image key={idx} xlinkHref={img} x={x} y={y} height={thumbnailHeight} width={imageWidth} />;
        });
        return (
            <svg
                width={width}
                height={height}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
            >
                {imgs}
            </svg>
        );
    }
}
