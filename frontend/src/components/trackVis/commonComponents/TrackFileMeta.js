import _ from "lodash";
import React from "react";
import PropTypes from "prop-types";
import OpenInterval from "model/interval/OpenInterval";

export class TrackFileMeta extends React.Component {
    static propTypes = {
        meta: PropTypes.object.isRequired,
        viewWindow: PropTypes.instanceOf(OpenInterval).isRequired,
    };

    render() {
        const { meta, viewWindow } = this.props;
        if (_.isEmpty(meta)) {
            return null;
        } else {
            return (
                <div
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        left: `${viewWindow.start + 10}px`,
                        backgroundColor: "rgba(255, 255, 255, 0.5)",
                        padding: "0 2px",
                    }}
                >
                    {Object.entries(meta).map((value) => (
                        <div key={value[0]}>
                            <span style={{ fontWeight: "bold" }}>{value[0]}</span>: <span>{value[1]}</span>
                        </div>
                    ))}
                </div>
            );
        }
    }
}
