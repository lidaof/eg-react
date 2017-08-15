import SvgComponent from './SvgComponent';

const BOX_HEIGHT = 40;
const GOTO_BUTTON_WIDTH = 50;
const GOTO_BUTTON_HEIGHT = 50;
const GOTO_LABEL_HEIGHT = 11;

const GOTO_BUTTON_Y = BOX_HEIGHT/2 - GOTO_BUTTON_HEIGHT/2;
const LABEL_Y = GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2 - GOTO_LABEL_HEIGHT;
const LABEL_X_PADDING = 15;

class SelectedRegionBox extends SvgComponent {
    constructor(props) {
        super(props);

        this.box = this.group.rect().attr({
            height: BOX_HEIGHT,
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

    draw() {
        let svgWidth = this.getSvgWidth();
        let absRegion = this.props.selectedRegionModel.getAbsoluteRegion()
        let xStart = Math.max(-10, this.baseToX(absRegion.start));
        let xEnd = Math.min(svgWidth + 10, this.baseToX(absRegion.end));
        let width = Math.max(0, xEnd - xStart);

        this.box.x(xStart);
        this.box.width(width);

        if (xEnd <= 0) {
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
        } else if (xStart >= svgWidth) {
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
        } else {
            this.gotoButton.hide()
            this.gotoLabel.hide();
        }
    }
}

export default SelectedRegionBox;
