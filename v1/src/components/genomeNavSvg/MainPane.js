import SvgComponent from './SvgComponent';
import Chromosomes from './Chromosomes';
import SelectedRegionBox from './SelectedRegionBox';
import SelectionBox from './SelectionBox';
import Ruler from './Ruler';

const WHEEL_ZOOM_SPEED = 0.15;

const LEFT_BUTTON = 0;
const RIGHT_BUTTON = 2;

const CHROMOSOME_Y = 30;
const SELECT_BOX_Y = 20;
const SELECTED_BOX_Y = 30;
const RULER_Y = CHROMOSOME_Y + 40;

class MainPane extends SvgComponent {

    constructor(parentSvg, displayedRegionModel, props) {
        super(parentSvg, displayedRegionModel);
        this.props = props;
        this.selectBox = null;
        this.dragOriginData = null;

         // Order matters here; it dictates what is drawn on top of what -- bottommost to topmost
        this.childComponents = [
            new Chromosomes(this.svg, this.model).offsetBy(0, CHROMOSOME_Y),
            new Ruler(this.svg, this.model).offsetBy(0, RULER_Y),
            new SelectedRegionBox(this.svg, this.model, this.props.selectedRegionModel,
                this.props.gotoSelectedRegionCallback)
                .offsetBy(0, SELECTED_BOX_Y),
        ];

        this.svg.on('contextmenu', event => event.preventDefault());
        this.svg.on('mousedown', this.mousedown, this);
        this.svg.on('mousemove', this.mousemove, this);
        this.svg.on('mouseup', this.mouseupOrMouseleave, this);
        this.svg.on('mouseleave', this.mouseupOrMouseleave, this);
        this.svg.on('wheel', this.mousewheel, this);
        this.redraw();
    }

    gotoSelectedRegion() {
        let selectedAbsRegion = this.props.selectedRegionModel.getAbsoluteRegion();
        let halfWidth = this.props.selectedRegionModel.getWidth() * 3;
        this.model.setRegion(selectedAbsRegion.start - halfWidth, selectedAbsRegion.end + halfWidth, true);
        this.redraw();
    }

    offsetBy(x, y) {
        this.svg.transform({x: x, y: y});
        return this;
    }

    redraw() {
        for (let component of this.childComponents) {
            component.redraw();
        }
    }

    selectRegion(startBase, endBase) {
        this.props.selectedRegionModel.setRegion(startBase, endBase); // TODO Call parent stuff in future version
        //this.props.newRegionSelectedCallback(startBase, endBase);
        this.redraw(); // This call may be done by the parent in future versions
    }

    mousedown(event) {
        event.preventDefault();
        if (event.button === LEFT_BUTTON) { // Select a region
            this.selectBox = new SelectionBox(this.svg, this.model, this.domXToSvgX(event.clientX),
                this.selectBoxCallback.bind(this)
            );
            this.selectBox.offsetBy(0, SELECT_BOX_Y);
        } else if (event.button === RIGHT_BUTTON) { // Drag the display
            this.dragOriginData = {
                region: this.model.getAbsoluteRegion(),
                x: event.clientX,
                y: event.clientY,
            }
        }
    }

    mousemove(event) {
        event.preventDefault();
        if (this.dragOriginData !== null) { // Dragging the view around
            let baseDiff = this.xWidthToBases(this.dragOriginData.x - event.clientX);
            this.model.setRegion(
                this.dragOriginData.region.start + baseDiff,
                this.dragOriginData.region.end + baseDiff,
                true
            );
            this.redraw();
        }
    }

    mouseupOrMouseleave(event) {
        this.dragOriginData = null; // Stopped dragging the view
    }

    selectBoxCallback(startBase, endBase) {
        this.selectBox.remove();
        this.selectBox = null;
        if (endBase - startBase > 80) { // TODO let the parent take care of this
            this.selectRegion(startBase, endBase);
        }
    }

    mousewheel(event) {
        event.preventDefault();
        this.mouseupOrMouseleave();

        let svgWidth = this.getSvgWidth();
        let focusPoint = event.clientX / svgWidth; // Proportion-based, not base-based.
        if (event.deltaY > 0) { // Mouse wheel turned towards user, or spun downwards -- zoom out
            this.props.zoomCallback(1 + WHEEL_ZOOM_SPEED, focusPoint);
        } else if (event.deltaY < 0) { // Zoom in
            this.props.zoomCallback(1 - WHEEL_ZOOM_SPEED, focusPoint);
        }
        this.redraw();
    }
}

export default MainPane;
