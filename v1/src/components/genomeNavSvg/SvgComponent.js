import React from 'react';

class SvgComponent extends React.Component {

    constructor(props) {
        super(props);
        this.group = this.props.svg.group();
    }

    readOffset() {
        let x = this.props.xOffset || 0;
        let y = this.props.yOffset || 0;
        this.group.transform({x: x, y: y});
    }

    componentDidMount() {
        this.readOffset();
        this.draw();
    }

    componentDidUpdate() {
        this.readOffset();
        this.draw();
    }

    componentWillUnmount() {
        this.group.remove();
    }

    getSvgWidth() {
        return this.props.svg.viewbox().width;
    }

    basesToXWidth(bases) {
        let pixelsPerBase = this.getSvgWidth() / this.props.model.getWidth();
        return bases * pixelsPerBase;
    }

    xWidthToBases(pixels) {
        let basesPerPixel = this.props.model.getWidth() / this.getSvgWidth();
        return pixels * basesPerPixel;
    }

    baseToX(base) {
        let pixelsPerBase = this.getSvgWidth() / this.props.model.getWidth();
        return (base - this.props.model.getAbsoluteRegion().start) * pixelsPerBase;
    }

    xToBase(pixel) {
        let basesPerPixel = this.props.model.getWidth() / this.getSvgWidth();
        return pixel * basesPerPixel + this.props.model.getAbsoluteRegion().start;
    }

    domXToSvgX(domX) {
        return domX - this.props.svg.node.getBoundingClientRect().left;
    }

    draw() {

    }

    render() {
        return null;
    }
}

export default SvgComponent;
