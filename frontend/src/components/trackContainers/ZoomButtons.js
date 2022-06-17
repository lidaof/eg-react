import React from 'react';
import PropTypes from 'prop-types';
import ButtonGroup from './ButtonGroup';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';

const ZOOMS = [
    { factor: 0.2, text: "+5", title: "Zoom in 5-fold" },
    { factor: 0.5, text: "+1", title: `Zoom in 1-fold
(Alt+I)` },
    { factor: 2/3, text: "+⅓", title: "Zoom in 1/3-fold" },
    { factor: 4/3, text: "-⅓", title: "Zoom out 1/3-fold" },
    { factor: 2, text: "-1", title: `Zoom out 1-fold
(Alt+O)` },
    { factor: 5, text: "-5", title: "Zoom out 5-fold" },
];
ZoomButtons.propTypes = {
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    onNewRegion: PropTypes.func.isRequired,
    zoomOut: PropTypes.func.isRequired,
}
function ZoomButtons(props) {
    // const zoomOut = factor => {
    //     const newRegion = props.viewRegion.clone().zoom(factor);
    //     props.onNewRegion(...newRegion.getContextCoordinates());
    // };
    const buttons = ZOOMS.map((zoom, index) =>
        <button
            key={index}
            className="btn btn-outline-dark"
            title={zoom.title}
            style={{fontFamily: "monospace"}}
            onClick={() => props.zoomOut(zoom.factor)}
        >
            {zoom.text}
        </button>
    );

    return <ButtonGroup buttons={buttons} />;
}

export default ZoomButtons;
