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
        color: "blue",
        backgroundColor: "var(--bg-color)",
        dynamicColors: [],
        useDynamicColors: false,
    };

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.container = null;
        this.particles = null;
        this.app = null;
        this.t = null;
        this.centerLine = null;
        this.state = {
            currentStep: 0,
            isPlaying: true,
            prevStep: 0,
        };
        this.count = 0;
        // this.graphics = [];
        this.sprites = [];
        this.labels = [];
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
        // this.particles = new PIXI.ParticleContainer(width, {
        //     scale: true,
        //     position: true,
        //     rotation: true,
        //     uvs: true,
        //     alpha: true,
        //     autoResize: true,
        // });
        //somehow paticles get that bug when more sprites added, auto rezie not working, need force refresh
        // changed to container
        this.particles = new PIXI.Container();
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
        const g = new PIXI.Graphics();
        g.lineStyle(0);
        g.beginFill(0xffffff, 1);
        g.drawRect(0, 0, 1, 1);
        g.endFill();
        const color = colorString2number(this.props.color);
        const tintColor = colorString2number(color);
        // const t = PIXI.RenderTexture.create(g.width, g.height);
        this.t = this.app.renderer.generateTexture(g);
        this.app.renderer.render(g, this.t);
        for (let i = 0; i < width; i++) {
            // this.graphics.push(new PIXI.Graphics());
            const s = new PIXI.Sprite(this.t);
            s.tint = tintColor;
            this.sprites.push(s);
            this.particles.addChild(s);
            // this.app.stage.addChild(s);
        }
        this.app.stage.addChild(this.particles);
        window.addEventListener("resize", this.onWindowResize);
        this.app.renderer.plugins.interaction.on("pointerdown", this.onPointerDown);
        const style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 16,
        });
        if (this.props.dynamicLabels && this.props.dynamicLabels.length) {
            this.props.dynamicLabels.forEach((label) => {
                const t = new PIXI.Text(label, style);
                t.position.set(this.props.viewWindow.start + 5, 5);
                t.visible = false;
                this.labels.push(t);
            });
        }
        if (this.labels.length) {
            this.labels.forEach((t) => this.app.stage.addChild(t));
        }
        this.centerLine = new PIXI.Sprite(this.t);
        this.centerLine.visible = false;
        this.particles.addChild(this.centerLine);
    }

    componentWillUnmount() {
        this.app.ticker.remove(this.tick);
        window.removeEventListener("resize", this.onWindowResize);
    }

    componentDidUpdate(prevProps, prevState) {
        const { currentStep, prevStep } = this.state;
        if (prevProps.height !== this.props.height || prevProps.width !== this.props.width) {
            this.onWindowResize();
            if (prevProps.width !== this.props.width) {
                this.handleWidthChange();
            }
        }
        if (prevProps.xToValue !== this.props.xToValue || prevState.currentStep !== currentStep) {
            this.steps = this.getMaxSteps();
            this.draw();
            if (this.labels.length) {
                if (currentStep < this.labels.length && prevStep < this.labels.length) {
                    this.labels[currentStep].visible = true;
                    this.labels[prevStep].visible = false;
                }
            }
        }
        if (prevProps.color !== this.props.color) {
            if (!(this.props.useDynamicColors && this.props.dynamicColors.length)) {
                const color = colorString2number(this.props.color);
                this.sprites.forEach((s) => (s.tint = color));
            }
        }
        if (prevProps.useDynamicColors !== this.props.useDynamicColors) {
            if (!this.props.useDynamicColors) {
                const color = colorString2number(this.props.color);
                this.sprites.forEach((s) => (s.tint = color));
            }
        }
        if (prevProps.backgroundColor !== this.props.backgroundColor) {
            this.app.renderer.backgroundColor = colorString2number(this.props.backgroundColor);
        }

        if (prevProps.playing !== this.props.playing) {
            if (this.props.playing) {
                this.app.ticker.start();
            } else {
                this.app.ticker.stop();
            }
        }
        if (prevProps.viewWindow !== this.props.viewWindow) {
            if (this.labels.length) {
                this.labels.forEach((t) => t.position.set(this.props.viewWindow.start + 5, 5));
            }
        }
    }

    handleWidthChange = () => {
        this.particles.removeChildren();
        this.sprites = [];
        const color = colorString2number(this.props.color); // need set a color even with dynamic colors otherwise track become empty
        const tintColor = colorString2number(color);
        for (let i = 0; i < this.props.width; i++) {
            const s = new PIXI.Sprite(this.t);
            s.tint = tintColor;
            this.sprites.push(s);
            this.particles.addChild(s);
        }
    };

    onWindowResize = () => {
        const { height, width } = this.props;
        this.app.renderer.resize(width, height);
    };

    onPointerDown = (event) => {
        // console.log(event, event.data.originalEvent.which);
        if (event.data.originalEvent.which === 2) {
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
        if (this.count >= this.steps - 1) {
            this.count = 0;
        }
        let step = Math.round(this.count);
        let prevStep = step - 1;
        if (prevStep < 0) {
            prevStep = this.steps - 1;
        }
        this.setState({ currentStep: step, prevStep });
    };

    getMaxSteps = () => {
        const max = this.props.steps ? this.props.steps : _.max(this.props.xToValue.map((v) => v.length));
        return max;
    };

    draw = () => {
        // console.log(this.sprites.length, this.particles.width);
        const { scales, useDynamicColors, dynamicColors, width } = this.props;
        const { currentStep } = this.state;
        // this.graphics.forEach(g => g.clear());
        this.sprites.forEach((s) => s.scale.set(0));
        const y = scales.valueToY(0); // for nagative values, move start position to center
        if (scales.min < 0) {
            // has negative values
            this.centerLine.position.set(0, y);
            this.centerLine.tint = 0x000;
            this.centerLine.scale.set(width, 0.5);
            this.centerLine.visible = true;
        } else {
            this.centerLine.visible = false;
        }
        this.props.xToValue.forEach((value, x) => {
            const valueIndex = currentStep < value.length ? currentStep : currentStep % value.length;
            if (Number.isNaN(value[valueIndex])) {
                return;
            }
            const scaleHeight = scales.valueToY(value[valueIndex]) - y;
            // const g = this.graphics[x];
            // g.lineStyle(0);
            // g.beginFill(color, 1);
            // g.drawRect(x, TOP_PADDING, 1, scaleHeight);
            // g.endFill();
            // console.log(y, height);
            const s = this.sprites[x];
            if (s) {
                s.position.set(x, y);
                s.scale.set(1, scaleHeight);
                if (useDynamicColors && dynamicColors.length) {
                    const colorIndex =
                        currentStep < dynamicColors.length ? currentStep : currentStep % dynamicColors.length;
                    const color = colorString2number(dynamicColors[colorIndex]);
                    s.tint = color;
                }
            }
        });
    };

    render() {
        const { height, width } = this.props;
        const style = { width: `${width}px`, height: `${height}px` };
        return <div style={style} ref={this.myRef}></div>;
    }
}
