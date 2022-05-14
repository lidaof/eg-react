import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import FlexLayout from "flexlayout-react";
import OpenInterval from "model/interval/OpenInterval";
import { MAX_NUMBER_THUMBNAILS } from "./OmeroTrack";
import { ensureMaxListLength } from "../../../util";
import { addTabSetToLayout, tabIdExistInLayout } from "../../../layoutUtils";
import { withTooltip } from "../commonComponents/tooltip/withTooltip";
import Tooltip from "../commonComponents/tooltip/Tooltip";
import { ObjectAsTable } from "components/trackContextMenu/TrackContextMenu";
import { GlobalActionCreators } from "../../../AppState";
import TrackModel from "model/TrackModel";

function mapStateToProps(state) {
    return {
        layout: state.browser.present.layout,
        // trackLegendWidth: state.browser.present.trackLegendWidth,
    };
}

const callbacks = {
    onSetLayout: GlobalActionCreators.setLayout,
};

class OmeroHtmlVisualizer extends React.PureComponent {
    static propTypes = {
        options: PropTypes.object,
        data: PropTypes.array.isRequired,
        viewWindow: PropTypes.instanceOf(OpenInterval),
        trackModel: PropTypes.instanceOf(TrackModel),
        imageAspectRatio: PropTypes.number,
    };

    newPanelWithImage = (imageId, imageUrl, imageUrlSuffix, detailUrl) => {
        const tabsetId = "tabset" + imageId;
        if (tabIdExistInLayout(this.props.layout, imageId)) {
            // image already rendered, highlight it by making the tabset active
            this.props.layoutModel.doAction(FlexLayout.Actions.setActiveTabset(tabsetId));
            return;
        }
        const addLayout = {
            type: "tabset",
            id: tabsetId,
            children: [
                {
                    type: "tab",
                    name: "Image",
                    component: "omero",
                    id: imageId,
                    config: {
                        imageId,
                        tabId: imageId,
                        imageUrl,
                        imageUrlSuffix,
                        detailUrl,
                    },
                },
            ],
        };
        const layout = addTabSetToLayout(addLayout, this.props.layout);
        // console.log(layout.layout.children);
        this.props.onSetLayout(layout);
    };

    renderTooltip = (event, imgHash, imgId, imageUrl, imageUrlSuffix, detailUrl) => {
        const dataTable = imgHash[imgId];
        const detailButton = dataTable.details.id ? (
            <a
                href={dataTable.details.id}
                role="button"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-sm"
            >
                See details in 4DN data portal
            </a>
        ) : null;
        // const button3d = this.props.isThereG3dTrack ? (
        //     <button className="btn btn-sm btn-warning" onClick={() => this.props.onSetImageInfo(dataTable)}>
        //         Show in 3D
        //     </button>
        // ) : null;
        // const button3dClear = this.props.isThereG3dTrack ? (
        //     <button className="btn btn-sm btn-secondary" onClick={() => this.props.onSetImageInfo(null)}>
        //         Remove from 3D
        //     </button>
        // ) : null;
        const tooltip = (
            <Tooltip pageX={event.pageX} pageY={event.pageY} onClose={this.props.onHideTooltip} hideArrow={true}>
                <div>
                    <button
                        type="button"
                        className="btn btn-info btn-sm"
                        onClick={() => this.newPanelWithImage(imgId, imageUrl, imageUrlSuffix, detailUrl)}
                    >
                        View larger image
                    </button>{" "}
                    {/* {detailButton} {button3d} {button3dClear} */}
                    {detailButton}
                </div>
                <ObjectAsTable content={dataTable.details} />
            </Tooltip>
        );
        this.props.onShowTooltip(tooltip);
    };

    render() {
        const { viewWindow, data, thumbnailHeight, height, trackModel, imageAspectRatio } = this.props;
        const imageHash = {};
        data.forEach((d) => {
            d.images.forEach((img) => {
                imageHash[img.imageId] = img;
            });
        });
        const imageAllIds = Object.keys(imageHash);
        const imageIds = ensureMaxListLength(imageAllIds, MAX_NUMBER_THUMBNAILS);
        const imageHeight = `${thumbnailHeight}px`;
        const imageWidth = `${thumbnailHeight * imageAspectRatio}px`;
        const containerWidth = `${viewWindow.end - viewWindow.start}px`;
        const leftPadding = `${viewWindow.start}px`;
        const gtc = `repeat(auto-fill, minmax(${imageWidth}, 1fr))`;
        const { thumbnailUrl, thumbnailUrlSuffix, imageUrl, imageUrlSuffix, detailUrl } = trackModel.apiConfig;
        const imgs = imageIds.map((imageId) => {
            const url = `${thumbnailUrl}/${imageId}/${thumbnailUrlSuffix}`;
            return (
                <div
                    key={imageId}
                    style={{ width: imageWidth, height: imageHeight, padding: 0 }}
                    onClick={(e) => this.renderTooltip(e, imageHash, imageId, imageUrl, imageUrlSuffix, detailUrl)}
                >
                    <img style={{ width: "100%", height: "auto" }} src={url} alt={imageId} />
                </div>
            );
        });
        return (
            <div
                style={{
                    position: "relative",
                    left: leftPadding,
                    width: containerWidth,
                    height,
                    display: "grid",
                    gap: "2px",
                    gridTemplateColumns: gtc,
                    justifyItems: "center",
                    alignItems: "start",
                    // marginTop: "2px",
                    marginBottom: "2px",
                }}
            >
                {imgs}
            </div>
        );
    }
}

const withAppState = connect(mapStateToProps, callbacks);
export default withAppState(withTooltip(OmeroHtmlVisualizer));
