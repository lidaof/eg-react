import React from "react";
import PropTypes from "prop-types";

/**
 * A component that display full size of image from omero server.
 *
 * @author Daofeng Li
 */

class OmeroContainer extends React.PureComponent {
    static propTypes = {
        imageId: PropTypes.string.isRequired,
        imageUrl: PropTypes.string.isRequired,
        imageUrlSuffix: PropTypes.string.isRequired,
        detailUrl: PropTypes.string.isRequired,
    };

    render() {
        const { imageId, imageUrl, imageUrlSuffix, detailUrl } = this.props;
        const imgUrl = `${imageUrl}/${imageId}/${imageUrlSuffix}`;
        const igmDetailUrl = `${detailUrl}/${imageId}/`;
        return (
            <div>
                <div>
                    <a
                        className="btn btn-primary btn-sm"
                        href={igmDetailUrl}
                        role="button"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ position: "absolute", top: "2px", right: "2px" }}
                    >
                        View in OMERO
                    </a>
                </div>
                <img style={{ width: "100%", height: "auto" }} src={imgUrl} alt={imageId} />
            </div>
        );
    }
}

export default OmeroContainer;
