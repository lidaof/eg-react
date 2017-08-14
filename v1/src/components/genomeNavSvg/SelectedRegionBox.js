import SvgComponent from './SvgComponent';

const BOX_HEIGHT = 40;
const GOTO_BUTTON_WIDTH = 50;
const GOTO_BUTTON_HEIGHT = 50;
const GOTO_LABEL_HEIGHT = 11;

const GOTO_BUTTON_Y = BOX_HEIGHT/2 - GOTO_BUTTON_HEIGHT/2;

class SelectedRegionBox extends SvgComponent {
    constructor(parentSvg, displayedRegionModel, selectedRegionModel, gotoButtonCallback) {
        super(parentSvg, displayedRegionModel);
        this.selectedRegionModel = selectedRegionModel;
        this.gotoButtonCallback = gotoButtonCallback;

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
        this.gotoButton.on('mousedown', this.gotoButtonPressed, this);

        this.gotoLabel = this.group.text("GOTO");
        this.gotoLabel.font({
            size: GOTO_LABEL_HEIGHT,
            "font-style": "italic",
        });
        this.gotoLabel.on('mousedown', this.gotoButtonPressed, this);

        this.redraw();
    }

    gotoButtonPressed(event) {
        event.stopPropagation();
        event.preventDefault();
        this.gotoButtonCallback(event);
    }

    redraw() {
        let svgWidth = this.getSvgWidth();
        let absRegion = this.selectedRegionModel.getAbsoluteRegion()
        let xStart = Math.max(-10, this.baseToX(absRegion.start));
        let xEnd = Math.min(svgWidth + 10, this.baseToX(absRegion.end));
        let width = Math.max(0, xEnd - xStart);

        this.box.x(xStart);
        this.box.width(width);

        if (xEnd <= 0) {
            this.gotoButton.plot([
                [0, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2],
                [GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y],
                [GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT]
            ]);
            this.gotoLabel.move(15, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2 - GOTO_LABEL_HEIGHT/2);
            this.gotoLabel.font({
                anchor: 'start',
            });
        } else if (xStart >= svgWidth) {
            this.gotoButton.plot([
                [svgWidth, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2],
                [svgWidth - GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y],
                [svgWidth - GOTO_BUTTON_WIDTH, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT]
            ]);
            this.gotoLabel.move(svgWidth - 15, GOTO_BUTTON_Y + GOTO_BUTTON_HEIGHT/2 - GOTO_LABEL_HEIGHT/2);
            this.gotoLabel.font({
                anchor: 'end',
            });
        } else {
            this.gotoButton.move(10000, 10000); // Move it to somewhere it won't be seen
            this.gotoLabel.move(10000, 10000);
        }
    }
}

export default SelectedRegionBox;
