import React from "react";
import * as PIXI from "pixi.js";
import { TOP_PADDING } from "./DynamicNumericalTrack";

export class PixiScene extends React.PureComponent {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.container = null;
        this.app = null;
        this.state = {
            currentIndex: 0
        };
        this.count = 0;
        this.count2 = 0;
    }

    componentDidMount() {
        this.container = this.myRef.current;
        const { height, width, backgroundColor } = this.props;
        this.app = new PIXI.Application({ width, height, backgroundColor });
        this.container.appendChild(this.app.view);
        this.app.ticker.add(this.tick);
    }

    componentWillUnmount() {
        this.app.ticker.remove(this.tick);
    }

    tick = delta => {
        this.count += 0.05 * delta;
        if (this.count > 9) {
            this.count = 0;
        }
        this.setState({ currentIndex: Math.round(this.count) });
    };

    drawPixel = (value, x) => {
        if (Number.isNaN(value[0])) {
            return null;
        }
        const { scales, color } = this.props;
        const drawHeight = scales.valueToY(value[this.state.currentIndex]);
        // return <Rectangle key={x} x={x} y={TOP_PADDING} width={1} height={drawHeight} fill={color} />;
    };

    draw = () => {};

    render() {
        const { height, width } = this.props;
        const style = { width: `${width}px`, height: `${height}px` };
        return <div style={style} ref={this.myRef}></div>;
    }
}
