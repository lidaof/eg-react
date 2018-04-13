import React from 'react';

/**
 * A message in a <p> that says "x items too small - zoom in to view".
 * 
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - message to render
 * @author Silas Hsu
 */
function HiddenItemsMessage(props) {
    if (!props.numHidden) {
        return null;
    }

    const itemOrItems = props.numHidden === 1 ? "item" : "items";
    return (
    <p style={{margin: 0, width: props.width, fontStyle: "italic", fontSize: "smaller", textAlign: "center"}} >
        {`${props.numHidden} ${itemOrItems} too small - zoom in to view`}
    </p>
    );
}

export default HiddenItemsMessage;
