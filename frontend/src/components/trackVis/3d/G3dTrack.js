import React from "react";
import PropTypes from "prop-types";
import Track from "../commonComponents/Track";
import { ThreeScene } from "./ThreeScene";
import { TrackFileMeta } from "../commonComponents/TrackFileMeta";

export const DEFAULT_OPTIONS = {
    height: 500,
    backgroundColor: "black",
    region: "region",
    resolution: 200000,
    showChromLabels: true,
};

/**
 * Track displaying 3d structure.
 *
 * @author Daofeng Li
 */
class G3dTrack extends React.PureComponent {
    static propTypes = Object.assign({}, Track.propsFromTrackContainer, {
        data: PropTypes.array.isRequired,
        options: PropTypes.shape({
            height: PropTypes.number.isRequired, // Height of the track
        }).isRequired,
        isLoading: PropTypes.bool, // If true, applies loading styling
        error: PropTypes.any, // If present, applies error styling
    });

    render() {
        const { data, width, options, meta, viewWindow } = this.props;
        // const newProps = {
        //         ...this.props,
        //         onContextMenu: () => null,
        //         onClick: () => null,
        //     };
        return (
            <Track
                {...this.props}
                // legend={<TrackLegend trackModel={trackModel} height={options.height} />}
                legend={null}
                visualizer={
                    <div>
                        <ThreeScene data={data} width={width} height={options.height} options={options} />
                        <TrackFileMeta meta={meta} viewWindow={viewWindow} />
                    </div>
                }
            />
        );
    }
}

export default G3dTrack;
