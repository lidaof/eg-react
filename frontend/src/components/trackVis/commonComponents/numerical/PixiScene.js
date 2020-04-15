import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import * as PIXI from "pixi.js";
import { colorString2number } from "../../../../util";

export class PixiScene extends React.PureComponent {
    static propTypes = {
        xToValue: PropTypes.array.isRequired,
        scales: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        backgroundColor: PropTypes.string,
        color: PropTypes.string,
        // colors: PropTypes.array,
        speed: PropTypes.array, //playing speed, 1-10, 1 is slowest, 10 is fastest
        steps: PropTypes.number, //total steps of animation
        currentStep: PropTypes.number, //current playing step, default is first step 0
    };

    static defaultProps = {
        currentStep: 0,
        speed: [5], //react-compound-slider require an array, to be FIXED
        // colors: [],
        color: "blue",
        backgroundColor: "white",
    };

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.container = null;
        this.particles = null;
        this.app = null;
        this.state = {
            currentStep: 0,
            isPlaying: true,
        };
        this.count = 0;
        // this.graphics = [];
        this.sprites = [];
        // this.colors = props.colors.length ? [...props.colors] : [];
        // if (props.steps) {
        //     if (this.colors.length < props.steps) {
        //         this.colors = repeatArray(this.colors, props.steps);
        //     }
        // }
        this.steps = this.getMaxSteps();
    }

    componentDidMount() {
        this.container = this.myRef.current;
        const { height, width, backgroundColor } = this.props;
        const bgColor = colorString2number(backgroundColor);
        this.app = new PIXI.Application({
            width,
            height,
            backgroundColor: bgColor,
            autoResize: true,
            resolution: window.devicePixelRatio,
        });
        this.particles = new PIXI.ParticleContainer(width, {
            scale: true,
            position: true,
            rotation: true,
            uvs: true,
            alpha: true,
        });
        this.container.appendChild(this.app.view);
        this.app.ticker.add(this.tick);
        // this.g = new PIXI.Graphics();
        // this.app.stage.addChild(this.g);
        // this.graphics.forEach(g => this.app.stage.addChild(g));
        // this.draw();
        // let color;
        // if(this.colors.length){
        //     color = colorString2number(this.colors[this.state.currentStep])
        // } else {
        //     color = colorString2number(this.props.color);
        // }
        const color = colorString2number(this.props.color);
        const g = new PIXI.Graphics();
        g.lineStyle(0);
        g.beginFill(0xffffff, 1);
        g.drawRect(0, 0, 1, 1);
        g.endFill();
        const tintColor = colorString2number(color);
        // const t = PIXI.RenderTexture.create(g.width, g.height);
        const t = this.app.renderer.generateTexture(g);
        this.app.renderer.render(g, t);
        for (let i = 0; i < width; i++) {
            // this.graphics.push(new PIXI.Graphics());
            const s = new PIXI.Sprite(t);
            s.tint = tintColor;
            this.sprites.push(s);
            this.particles.addChild(s);
            // this.app.stage.addChild(s);
        }
        this.app.stage.addChild(this.particles);
        window.addEventListener("resize", this.onWindowResize);
        this.app.renderer.plugins.interaction.on("pointerdown", this.onPointerDown);
    }

    componentWillUnmount() {
        this.app.ticker.remove(this.tick);
        window.removeEventListener("resize", this.onWindowResize);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.xToValue !== this.props.xToValue || prevState.currentStep !== this.state.currentStep) {
            this.steps = this.getMaxSteps();
            this.draw();
        }
        if (prevProps.color !== this.props.color) {
            const color = colorString2number(this.props.color);
            this.sprites.forEach((s) => (s.tint = color));
        }
        if (prevProps.backgroundColor !== this.props.backgroundColor) {
            this.app.renderer.backgroundColor = colorString2number(this.props.backgroundColor);
        }
        if (prevProps.height !== this.props.height || prevProps.width !== this.props.width) {
            this.app.renderer.resize(this.props.width, this.props.height);
        }
        if (prevProps.playing !== this.props.playing) {
            if (this.props.playing) {
                this.app.ticker.start();
            } else {
                this.app.ticker.stop();
            }
        }
    }
    onWindowResize = () => {
        const { height, width } = this.props;
        this.app.renderer.resize(width, height);
    };

    onPointerDown = (event) => {
        // console.log(event, event.data.originalEvent.which);
        if (event.data.originalEvent.which === 1) {
            // only left click
            this.setState((prevState) => {
                return { isPlaying: !prevState.isPlaying };
            });
            if (this.state.isPlaying) {
                this.app.ticker.start();
            } else {
                this.app.ticker.stop();
            }
        }
    };

    tick = () => {
        // const useSpeed = Array.isArray(this.props.speed) ? this.props.speed[0] : this.props.speed;
        this.count += 0.005 * this.props.speed[0];
        if (this.count >= this.steps) {
            this.count = 0;
        }
        this.setState({ currentStep: Math.round(this.count) });
    };

    getMaxSteps = () => {
        const max = this.props.steps ? this.props.steps : _.max(this.props.xToValue.map((v) => v.length));
        return max;
    };

    draw = () => {
        const { scales, height } = this.props;
        const { currentStep } = this.state;
        // this.graphics.forEach(g => g.clear());
        this.sprites.forEach((s) => s.scale.set(0));
        this.props.xToValue.forEach((value, x) => {
            const valueIndex = currentStep < value.length ? currentStep : currentStep % value.length;
            if (Number.isNaN(value[valueIndex])) {
                return;
            }
            const scaleHeight = scales.valueToY(value[valueIndex]) - height;
            // const g = this.graphics[x];
            // g.lineStyle(0);
            // g.beginFill(color, 1);
            // g.drawRect(x, TOP_PADDING, 1, scaleHeight);
            // g.endFill();
            const s = this.sprites[x];
            s.position.set(x, height);
            s.scale.set(1, scaleHeight);
        });
    };

    render() {
        const { height, width } = this.props;
        const style = { width: `${width}px`, height: `${height}px` };
        return <div style={style} ref={this.myRef}></div>;
    }
}
