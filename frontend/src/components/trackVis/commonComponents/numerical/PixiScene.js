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
        // this.graphics = [];
        this.sprites = [];
    }

    componentDidMount() {
        this.container = this.myRef.current;
        const { height, width, backgroundColor } = this.props;
        this.app = new PIXI.Application({ width, height, backgroundColor });
        // this.particles = new PIXI.ParticleContainer();
        this.container.appendChild(this.app.view);
        this.app.ticker.add(this.tick);
        // this.g = new PIXI.Graphics();
        // this.app.stage.addChild(this.g);
        // this.graphics.forEach(g => this.app.stage.addChild(g));
        // this.draw();
        const g = new PIXI.Graphics();
        g.lineStyle(0);
        g.beginFill(this.props.color, 1);
        g.drawRect(0, 0, 1, 1);
        g.endFill();
        const t = PIXI.RenderTexture.create(g.width, g.height);
        this.app.renderer.render(g, t);
        for (let i = 0; i < width; i++) {
            // this.graphics.push(new PIXI.Graphics());
            const s = new PIXI.Sprite(t);
            this.sprites.push(s);
            // this.particles.addChild(s);
            this.app.stage.addChild(s);
        }
        // this.app.stage.addChild(this.particles);
    }

    componentWillUnmount() {
        this.app.ticker.remove(this.tick);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.xToValue !== this.props.prevProps || prevState.currentIndex !== this.state.currentIndex) {
            this.draw();
        }
    }

    tick = () => {
        this.count += 0.05;
        if (this.count > 9) {
            this.count = 0;
        }
        this.setState({ currentIndex: Math.round(this.count) });
    };

    draw = () => {
        const { scales } = this.props;
        // this.graphics.forEach(g => g.clear());
        this.sprites.forEach(s => s.scale.set(0));
        this.props.xToValue.forEach((value, x) => {
            if (Number.isNaN(value[0])) {
                return;
            }
            const drawHeight = scales.valueToY(value[this.state.currentIndex]);
            // const g = this.graphics[x];
            // g.lineStyle(0);
            // g.beginFill(color, 1);
            // g.drawRect(x, TOP_PADDING, 1, drawHeight);
            // g.endFill();
            const s = this.sprites[x];
            s.position.set(x, TOP_PADDING);
            s.scale.set(1, drawHeight);
        });
    };

    render() {
        const { height, width } = this.props;
        const style = { width: `${width}px`, height: `${height}px` };
        return <div style={style} ref={this.myRef}></div>;
    }
}
