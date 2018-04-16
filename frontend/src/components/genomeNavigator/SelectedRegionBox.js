import React from 'react';
import PropTypes from 'prop-types';

import TranslatableG from '../TranslatableG';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import LinearDrawingModel from '../../model/LinearDrawingModel';

const BOX_HEIGHT = 40;
const GOTO_BUTTON_WIDTH = 50;
const GOTO_BUTTON_HEIGHT = 50;
const GOTO_LABEL_HEIGHT = 11;

const GOTO_BUTTON_Y = BOX_HEIGHT/2 - GOTO_BUTTON_HEIGHT/2;
const LABEL_Y = GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2 + 3;
const LABEL_X_PADDING = 15;

const BOX_STYLE = {
    stroke: "#090",
    fill: "#0f0",
    fillOpacity: 0.25,
};

const TEXT_STYLE = {
    fontSize: GOTO_LABEL_HEIGHT,
    fontStyle: "italic",
};

/**
 * A box that shows the currently selected region, or a GOTO button if the currently selected region is out of view.
 * 
 * @author Silas Hsu
 */
class SelectedRegionBox extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Entire region being visualized
        width: PropTypes.number.isRequired, // Draw width of the view region
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // Region that is selected

        /**
         * Called when the user presses the "GOTO" button to quicky scroll the view to the selected track region.
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the interval to scroll to
         *         `newEnd`: the absolute base number of the end of the interval to scroll to
         */
        onNewViewRequested: PropTypes.func.isRequired, // Function that takes arguments [number, number]
    }

    constructor(props) {
        super(props);
        this.gotoPressed = this.gotoPressed.bind(this);
    }

    /**
     * Handle a press of the GOTO button.  Calculates a new view and propagates it to this component's parent.
     * 
     * @param {React.SyntheticEvent} event - event fired from the GOTO button
     */
    gotoPressed(event) {
        let selectedAbsRegion = this.props.selectedRegion.getAbsoluteRegion();
        let halfWidth = 0;
        if (this.props.selectedRegion.getWidth() < this.props.viewRegion.getWidth()) {
            halfWidth = this.props.viewRegion.getWidth() * 0.5;
        } else {
            halfWidth = this.props.selectedRegion.getWidth() * 3;
        }
        let regionCenter = (selectedAbsRegion.end + selectedAbsRegion.start) * 0.5;
        this.props.onNewViewRequested(regionCenter - halfWidth, regionCenter + halfWidth);
    }

    /**
     * Moves the box and GOTO button to where it needs to go and shows/hides the GOTO button as needed.
     * 
     * @override
     */
    render() {
        const {viewRegion, selectedRegion, x, y} = this.props;
        const drawModel = new LinearDrawingModel(viewRegion, this.props.width);
        let drawWidth = drawModel.getDrawWidth();
        let absRegion = selectedRegion.getAbsoluteRegion();

        // We limit the box's start and end X because SVGs don't like to be billions of pixels wide.
        let xStart = Math.max(-10, drawModel.baseToX(absRegion.start));
        let xEnd = Math.min(drawWidth + 10, drawModel.baseToX(absRegion.end));
        let width = Math.max(0, xEnd - xStart);
        const box = <rect x={xStart} y={0} width={width} height={BOX_HEIGHT} style={BOX_STYLE} />;

        let gotoButton = null;
        let gotoText = null;
        if (xEnd <= 0) { // Arrow pointing left
            const points = [
                [0, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2],
                [GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y],
                [GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT]
            ];
            gotoButton = <polygon points={points} style={BOX_STYLE} onClick={this.gotoPressed} />;
            gotoText = (<text
                x={LABEL_X_PADDING}
                y={LABEL_Y}
                style={{...TEXT_STYLE, textAnchor: "start"}}
                onClick={this.gotoPressed}
            >
                GOTO
            </text>);
        } else if (xStart >= drawWidth) { // Arrow pointing right
            const points = [
                [drawWidth, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2],
                [drawWidth - GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y],
                [drawWidth - GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT]
            ];
            gotoButton = <polygon points={points} style={BOX_STYLE} onClick={this.gotoPressed}/>;
            gotoText = (<text
                x={drawWidth - LABEL_X_PADDING}
                y={LABEL_Y}
                style={{...TEXT_STYLE, textAnchor: "end"}}
                onClick={this.gotoPressed}
            >
                GOTO
            </text>);
        }
        return (
        <TranslatableG x={x} y={y} >
            {box}
            {gotoButton}
            {gotoText}
        </TranslatableG>
        );
    }
}

export default SelectedRegionBox;
