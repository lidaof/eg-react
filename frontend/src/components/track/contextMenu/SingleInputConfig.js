import React from 'react';
import PropTypes from 'prop-types';
import "./TrackContextMenu.css";

/**
 * A context menu item that renders a single element for inputting data.
 * 
 * @author Silas Hsu
 */
class SingleInputConfig extends React.PureComponent {
    static propTypes = {
        label: PropTypes.string.isRequired, // Label for the input
        inputElement: PropTypes.node.isRequired, // Input element to render
        style: PropTypes.object, // Style for the entire container
        renderSetButton: PropTypes.bool, // Whether to render a button that says "Set"
        onSetPressed: PropTypes.func, // Callback for when the "Set" button is pressed
    };

    render() {
        const {label, inputElement, style, renderSetButton, onSetPressed} = this.props;
        let labelToRender, inputToRender;
        if (renderSetButton) {
            labelToRender = <label style={{display: "block", margin: 0}} >{label}</label>;
            inputToRender = (
                <div style={{display: "flex"}} >
                    {inputElement}
                    <button onClick={onSetPressed} >Set</button>
                </div>
            );
        } else {
            labelToRender = label;
            inputToRender = inputElement;
        }

        return <div className="TrackContextMenu-item" style={style}>{labelToRender} {inputToRender}</div>;
    }
}

export default SingleInputConfig;
