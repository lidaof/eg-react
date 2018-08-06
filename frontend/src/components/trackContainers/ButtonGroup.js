import React from 'react';
import PropTypes from 'prop-types';

ButtonGroup.propTypes = {
    label: PropTypes.string,
    buttons: PropTypes.node
};
function ButtonGroup(props) {
    return <div style={{display: "flex", alignItems: "center"}}>
        { props.label && <span style={{marginRight: "1ch"}}>{props.label}</span> }
        {props.buttons}
    </div>;
}

export default ButtonGroup;
