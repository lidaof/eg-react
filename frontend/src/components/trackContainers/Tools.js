import React from 'react';
import PropTypes from 'prop-types';
import ButtonGroup from './ButtonGroup';
import UndoRedo from "./UndoRedo";
import History from "./History";

export const Tools = {
    DRAG: {
        buttonContent: "✋",
        title: "Drag tool",
        cursor: "pointer",
    },
    REORDER: {
        buttonContent: "🔀",
        title: "Reorder tool",
        cursor: "all-scroll",
    },
    ZOOM_IN: {
        buttonContent: "⬚🔍+",
        title: "Zoom-in tool",
        cursor: "zoom-in",
    },
};

ToolButtons.propTypes = {
    selectedTool: PropTypes.oneOf(Object.values(Tools)),
    onToolClicked: PropTypes.func.isRequired,
};
export function ToolButtons(props) {
    let buttons = [];
    for (let toolName in Tools) {
        const tool = Tools[toolName];
        const className = tool === props.selectedTool ? "btn btn-primary" : "btn btn-light";
        buttons.push(
            <button
                key={toolName}
                className={className}
                title={tool.title}
                onClick={() => props.onToolClicked(tool)}
            >
                {tool.buttonContent}
            </button>
        );
    }
    buttons.push(<UndoRedo key="undoredo" />);
    buttons.push(<History key="history" />)

    return <ButtonGroup label="Tools:" buttons={buttons} />;
}
