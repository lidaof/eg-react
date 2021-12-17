import React from "react";

export const FrameListMenu = (props) => {
    const { frameList } = props;
    if (!frameList.length) return null;
    return (
        <div className="FrameListMenu">
            <label>Frames:</label>
            <ol>
                {frameList.map((frame, index) => {
                    return (
                        <li key={index}>
                            <span>{frame}</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

FrameListMenu.defaultProps = {
    frameList: [],
};
