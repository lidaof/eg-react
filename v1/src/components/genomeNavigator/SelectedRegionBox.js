import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import PropTypes from 'prop-types';
import SvgComponent from '../SvgComponent';

const BOX_HEIGHT = 40;
const GOTO_BUTTON_WIDTH = 50;
const GOTO_BUTTON_HEIGHT = 50;
const GOTO_LABEL_HEIGHT = 11;

const GOTO_BUTTON_Y = BOX_HEIGHT/2 - GOTO_BUTTON_HEIGHT/2;
const LABEL_Y = GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2 - GOTO_LABEL_HEIGHT;
const LABEL_X_PADDING = 15;

/**
 * A box that shows the currently selected region, or a GOTO button if the currently selected region is out of view.
 * 
 * @author Silas Hsu
 */
class SelectedRegionBox extends SvgComponent {
    /**
     * Creates the box and GOTO button, and attaches event listeners
     * 
     * @param {Object} props - props as specified by React 
     */
    constructor(props) {
        super(props);

        this.box = this.group.rect(1, BOX_HEIGHT).attr({
            stroke: "#090",
            fill: "#0f0",
            "fill-opacity": 0.1,
        });

        this.gotoButton = this.group.polygon().attr({
            stroke: "#090",
            fill: "#0f0",
            "fill-opacity": 0.8,
        });
        this.gotoButton.on('mousedown', this.gotoPressed, this);

        this.gotoLabel = this.group.text("GOTO");
        this.gotoLabel.font({
            size: GOTO_LABEL_HEIGHT,
            "font-style": "italic",
        });
        this.gotoLabel.on('mousedown', this.gotoPressed, this);
    }

    /**
     * Handle a press of the GOTO button.  Calculates a new view and propagates it to this component's parent.
     * 
     * @param {MouseEvent} event - a mousedown event fired from the GOTO button
     */
    gotoPressed(event) {
        event.preventDefault()
        event.stopPropagation();
        let selectedAbsRegion = this.props.selectedRegionModel.getAbsoluteRegion();
        let halfWidth = 0;
        if (this.props.selectedRegionModel.getWidth() < this.props.model.getWidth()) {
            halfWidth = this.props.model.getWidth() * 0.5;
        } else {
            halfWidth = this.props.selectedRegionModel.getWidth() * 3;
        }
        let regionCenter = (selectedAbsRegion.end + selectedAbsRegion.start) * 0.5;
        this.props.gotoButtonCallback(regionCenter - halfWidth, regionCenter + halfWidth);
    }

    /**
     * Moves the box and GOTO button to where it needs to go and shows/hides the GOTO button as needed.
     * 
     * @override
     */
    render() {
        let svgWidth = this.props.drawModel.svgWidth;
        let absRegion = this.props.selectedRegionModel.getAbsoluteRegion();

        // We limit the box's start and end X because SVGs don't like to be billions of pixels wide.
        let xStart = Math.max(-10, this.props.drawModel.baseToX(absRegion.start));
        let xEnd = Math.min(svgWidth + 10, this.props.drawModel.baseToX(absRegion.end));
        let width = Math.max(0, xEnd - xStart);
        this.box.x(xStart);
        this.box.width(width);

        if (xEnd <= 0) { // Box out of view to the left
            this.gotoButton.show();
            this.gotoLabel.show();
            this.gotoButton.plot([
                [0, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2],
                [GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y],
                [GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT]
            ]);
            this.gotoLabel.attr({
                x: LABEL_X_PADDING,
                y: LABEL_Y,
                "text-anchor": "start",
            });
        } else if (xStart >= svgWidth) { // Box out of view to the right
            this.gotoButton.show();
            this.gotoLabel.show();
            this.gotoButton.plot([
                [svgWidth, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2],
                [svgWidth - GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y],
                [svgWidth - GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT]
            ]);
            this.gotoLabel.attr({
                x: svgWidth - LABEL_X_PADDING,
                y: LABEL_Y,
                "text-anchor": "end",
            });
        } else { // Box visible; hide the goto button
            this.gotoButton.hide()
            this.gotoLabel.hide();
        }

        return null;
    }
}

SelectedRegionBox.propTypes = {
    selectedRegionModel: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    gotoButtonCallback: PropTypes.func.isRequired, // Function that takes arguments [number, number]
}

export default SelectedRegionBox;
