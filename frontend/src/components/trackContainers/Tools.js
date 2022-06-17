import React from "react";
import PropTypes from "prop-types";
import ButtonGroup from "./ButtonGroup";

export const Tools = {
    DRAG: {
        buttonContent: "✋",
        title: `Drag tool
(Alt+H or Alt+D)`,
        cursor: "pointer",
    },
    REORDER: {
        buttonContent: "🔀",
        title: `Reorder tool
(Alt+R or Alt+S)`,
        cursor: "all-scroll",
    },
    ZOOM_IN: {
        buttonContent: "⬚🔍+",
        title: `Zoom-in tool
(Alt+M)`,
        cursor: "zoom-in",
    },
    HIGHLIGHT: {
        buttonContent: "⛅",
        title: `Highlight tool
(Alt+N)`,
        cursor: "ew-resize",
    },
};

ToolButtons.propTypes = {
    selectedTool: PropTypes.oneOf(Object.values(Tools)),
    onToolClicked: PropTypes.func.isRequired,
    allTools: PropTypes.object
};
export function ToolButtons(props) {
    let buttons = [];
    for (let toolName in Tools) {
        const tool = Tools[toolName];
        const className = tool === props.selectedTool ? "btn btn-primary" : "btn btn-light";
        buttons.push(
            <button key={toolName} className={className} title={tool.title} onClick={() => props.onToolClicked(tool)}>
                {tool.buttonContent}
            </button>
        );
    }

    return <ButtonGroup label="Tools:" buttons={buttons} />;
}
