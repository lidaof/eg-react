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
    }

    componentDidMount() {
        this.container = this.myRef.current;
        const { height, width, backgroundColor } = this.props;
        this.app = new PIXI.Application({ width, height, backgroundColor });
        this.container.appendChild(this.app.view);
        this.app.ticker.add(this.tick);
        this.g = new PIXI.Graphics();
        this.app.stage.addChild(this.g);
    }

    componentWillUnmount() {
        this.app.ticker.remove(this.tick);
    }

    // componentDidUpdate(prevProps, prevState) {
    //     if (prevProps.xToValue !== this.props.prevProps || prevState.currentIndex !== this.state.currentIndex) {
    //         this.draw();
    //     }
    // }

    tick = () => {
        this.count += 0.05;
        if (this.count > 9) {
            this.count = 0;
        }
        this.setState({ currentIndex: Math.round(this.count) });
    };

    draw = () => {
        this.g.lineStyle(0);
        const { scales, color, backgroundColor, height } = this.props;
        this.props.xToValue.forEach((value, x) => {
            if (Number.isNaN(value[0])) {
                return;
            }
            const drawHeight = scales.valueToY(value[this.state.currentIndex]);
            this.g.beginFill(backgroundColor, 0);
            this.g.drawRect(x, TOP_PADDING, 1, height);
            this.g.beginFill(color, 1);
            this.g.drawRect(x, TOP_PADDING, 1, drawHeight);
            this.g.endFill();
        });
    };

    render() {
        const { height, width } = this.props;
        const style = { width: `${width}px`, height: `${height}px` };
        return <div style={style} ref={this.myRef}></div>;
    }
}
