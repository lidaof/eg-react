import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import Track from "../commonComponents/Track";
import configOptionMerging from "../commonComponents/configOptionMerging";
import TrackLegend from "../commonComponents/TrackLegend";
import { OmeroSvgVisualizer } from "./OmeroSvgVisualizer";
import OmeroHtmlVisualizer from "./OmeroHtmlVisualizer";
import { HiddenImagesMessage } from "../commonComponents/TrackMessage";
import { DefaultAggregators } from "model/FeatureAggregator";
import NumericalTrack from "../commonComponents/numerical/NumericalTrack";
import { AnnotationDisplayModes, NumericalDisplayModes } from "model/DisplayModes";

export const MAX_NUMBER_THUMBNAILS = 384; // image number of 1 run in idr web UI

export const THUMBNAIL_PADDING = 2;

export const DEFAULT_OPTIONS = {
    imageHeight: [73],
    backgroundColor: "white",
    fetchViewWindowOnly: true,
    imageAspectRatio: 1.315, // default ratio for IDR for many images as checked
    displayMode: AnnotationDisplayModes.FULL,
    height: 40, // default height for density mode
};

const withDefaultOptions = configOptionMerging(DEFAULT_OPTIONS);

/**
 * Track that displays idr images.
 
 */
class OmeroTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.trackContainerProps, {
        data: PropTypes.array.isRequired,
    });

    constructor(props) {
        super(props);
        this.state = {
            trackHeight: 100,
            numHidden: 0,
        };
    }

    componentDidMount() {
        this.calcTrackHeight();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.data !== this.props.data || prevProps.options.imageHeight !== this.props.imageHeight) {
            this.calcTrackHeight();
        }
    }

    calcTrackHeight = () => {
        const { data, viewWindow, options } = this.props;
        const totalImgCount = _.sum(data.map((item) => item.images.length));
        const imgCount = Math.min(totalImgCount, MAX_NUMBER_THUMBNAILS);
        const totalIamgeWidth = Math.max(
            (options.imageHeight[0] * options.imageAspectRatio + THUMBNAIL_PADDING) * imgCount - THUMBNAIL_PADDING,
            0
        );
        const screenWidth = viewWindow.end - viewWindow.start;
        const rowsNeed = Math.floor(totalIamgeWidth / screenWidth) + 1;
        const trackHeight = rowsNeed * (options.imageHeight[0] + THUMBNAIL_PADDING) - THUMBNAIL_PADDING;
        this.setState({ trackHeight, numHidden: totalImgCount - imgCount });
    };

    render() {
        const { trackModel, data, forceSvg, options, viewWindow, width, layoutModel, isThereG3dTrack, onSetImageInfo } =
            this.props;
        const { trackHeight, numHidden } = this.state;
        const visualizer = forceSvg ? (
            <OmeroSvgVisualizer
                data={data}
                viewWindow={viewWindow}
                width={width}
                thumbnailHeight={options.imageHeight[0]}
                height={trackHeight}
                trackModel={trackModel}
                imageAspectRatio={options.imageAspectRatio}
            />
        ) : (
            <OmeroHtmlVisualizer
                data={data}
                viewWindow={viewWindow}
                thumbnailHeight={options.imageHeight[0]}
                height={trackHeight}
                trackModel={trackModel}
                imageAspectRatio={options.imageAspectRatio}
                layoutModel={layoutModel} //html only for highlighting the panel when the image already rendered but same tooltip is clicked again
                isThereG3dTrack={isThereG3dTrack}
                onSetImageInfo={onSetImageInfo}
            />
        );
        const message = <HiddenImagesMessage numHidden={numHidden} />;
        if (options.displayMode === AnnotationDisplayModes.DENSITY) {
            const numericalOptions = {
                ...options,
                displayMode: NumericalDisplayModes.AUTO,
                aggregateMethod: DefaultAggregators.types.IMAGECOUNT,
            };
            return <NumericalTrack {...this.props} unit="image count" options={numericalOptions} />;
        } else {
            return (
                <Track
                    {...this.props}
                    legend={<TrackLegend trackModel={trackModel} height={trackHeight} />}
                    visualizer={visualizer}
                    message={message}
                />
            );
        }
    }
}

export default withDefaultOptions(OmeroTrack);
