import DisplayedRegionModel from '../model/DisplayedRegionModel';
import DomDragListener from './DomDragListener';
import PropTypes from 'prop-types';
import React from 'react';
import SvgComponent from './SvgComponent';

class ViewDragListener extends SvgComponent {
    constructor(props) {
        super(props);

        this.dragOriginModel = null;

        this.dragStart = this.dragStart.bind(this);
        this.drag = this.drag.bind(this);
        this.dragEnd = this.dragEnd.bind(this);
    }

    dragStart(event) {
        this.dragOriginModel = this.props.model;
        if (this.props.onDragStart) {
            this.props.onDragStart(event);
        }
    }

    /**
     * If view dragging has been initialized, calcuates a new view region depending on where the mouse has been dragged.
     * 
     * @param {MouseEvent} event - a mousemove event fired from within this pane
     */
    drag(event, coordinateDiff) {
        if (this.props.onViewDrag && this.dragOriginModel) {
            let newRegion = this._getRegionOffsetByX(this.dragOriginModel, -coordinateDiff.dx);
            this.props.onViewDrag(newRegion.start, newRegion.end);
        }
    }

    dragEnd(event, coordinateDiff) {
        if (this.props.onViewDragEnd && this.dragOriginModel) {
            let newRegion = this._getRegionOffsetByX(this.dragOriginModel, -coordinateDiff.dx);
            this.props.onViewDragEnd(newRegion.start, newRegion.end);
        }
        this.dragOriginModel = null;
    }

    _getRegionOffsetByX(model, xDiff) {
        let baseDiff = this.scale.xWidthToBases(xDiff);
        let startRegion = model.getAbsoluteRegion();
        return {
            start: startRegion.start + baseDiff,
            end: startRegion.end + baseDiff,
        }
    }

    render() {
        return (
            <DomDragListener
                button={this.props.button}
                model={this.props.model}
                onDragStart={this.dragStart}
                onDrag={this.drag}
                onDragEnd={this.dragEnd}
                node={this.props.svgNode}
            />
        );
    }
}

export default ViewDragListener;

ViewDragListener.propTypes = {
    button: PropTypes.number.isRequired,
    model: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    onDragStart: PropTypes.func,
    onViewDrag: PropTypes.func,
    onViewDragEnd: PropTypes.func,
}
