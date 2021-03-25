import React from "react";
import PropTypes from "prop-types";
import * as PIXI from "pixi.js";
// import HoverTooltipContext from "../commonComponents/tooltip/HoverTooltipContext";
import { colorString2number } from "../../../util";

const ITEM_LIMIT = 1000;

export class PixiArc extends React.PureComponent {
    static propTypes = {
        placedInteractionsArray: PropTypes.array.isRequired,
        viewWindow: PropTypes.object.isRequired,
        opacityScale: PropTypes.func.isRequired,
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        backgroundColor: PropTypes.string,
        color: PropTypes.string,
        color2: PropTypes.string,
        speed: PropTypes.array, //playing speed, 1-10, 1 is slowest, 10 is fastest
        steps: PropTypes.number, //total steps of animation
        currentStep: PropTypes.number, //current playing step, default is first step 0
        lineWidth: PropTypes.number,
    };

    static defaultProps = {
        currentStep: 0,
        speed: [5], //react-compound-slider require an array, to be FIXED
        // colors: [],
        color: "blue",
        backgroundColor: "white",
        lineWidth: 1,
        dynamicColors: [],
        useDynamicColors: false,
    };

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.container = null;
        this.subcontainer = null;
        this.app = null;
        // this.g = null;
        this.state = {
            currentStep: 0,
            isPlaying: true,
        };
        this.count = 0;
        this.steps = 0;
        this.subs = []; //holder for sub containers for each sprite sets from each track
        this.arcData = [];
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
        this.subcontainer = new PIXI.Container();
        this.container.appendChild(this.app.view);
        this.app.ticker.add(this.tick);
        this.app.stage.addChild(this.subcontainer);
        window.addEventListener("resize", this.onWindowResize);
        this.app.renderer.plugins.interaction.on("pointerdown", this.onPointerDown);
        // this.g = new PIXI.Graphics();
        this.steps = this.getMaxSteps();
        this.drawArc();
    }

    componentWillUnmount() {
        this.app.ticker.remove(this.tick);
        window.removeEventListener("resize", this.onWindowResize);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.placedInteractionsArray !== this.props.placedInteractionsArray) {
            this.drawArc();
        }
        if (prevProps.color !== this.props.color) {
            if (!(this.props.useDynamicColors && this.props.dynamicColors.length)) {
                const color = colorString2number(this.props.color);
                this.subs.forEach((c) => c.children.forEach((s) => (s.tint = color)));
            }
        }
        if (prevProps.useDynamicColors !== this.props.useDynamicColors) {
            if (!this.props.useDynamicColors) {
                const color = colorString2number(this.props.color);
                this.subs.forEach((c) => c.children.forEach((s) => (s.tint = color)));
            }
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
        if (prevState.currentStep !== this.state.currentStep) {
            this.subs.forEach((c, i) => {
                if (i === this.state.currentStep) {
                    c.visible = true;
                } else {
                    c.visible = false;
                }
            });
            if (this.props.viewer3dNumFrames) {
                if (this.props.viewer3dNumFrames.viewer3d && this.props.viewer3dNumFrames.numFrames !== 0) {
                    this.props.viewer3dNumFrames.viewer3d
                        .setFrame(this.state.currentStep % this.props.viewer3dNumFrames.numFrames)
                        .then(() => this.props.viewer3dNumFrames.viewer3d.render());
                }
            }
        }
    }

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

    initializeSubs = () => {
        this.subs = [];
        this.steps = this.getMaxSteps();
        for (let i = 0; i < this.steps; i++) {
            this.subs.push(new PIXI.Graphics());
            this.arcData.push([]);
        }
        this.subs.forEach((c) => this.subcontainer.addChild(c));
    };

    resetSubs = () => {
        this.subs.forEach((c) => {
            c.clear();
            c.removeChildren();
        });
        this.arcData = this.arcData.map(() => []);
    };

    onWindowResize = () => {
        const { height, width } = this.props;
        this.app.renderer.resize(width, height);
    };

    tick = () => {
        this.count += 0.005 * this.props.speed[0];
        if (this.count >= this.steps - 1) {
            this.count = 0;
        }
        this.setState({ currentStep: Math.round(this.count) });
    };

    getMaxSteps = () => {
        const max = this.props.steps ? this.props.steps : this.props.placedInteractionsArray.length;
        return max;
    };

    drawArc = () => {
        const {
            opacityScale,
            color,
            color2,
            viewWindow,
            height,
            placedInteractionsArray,
            trackModel,
            lineWidth,
            useDynamicColors,
            dynamicColors,
        } = this.props;
        if (this.subs.length) {
            this.resetSubs();
        } else {
            this.initializeSubs();
        }
        const style = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: 16,
        });
        // const g = new PIXI.Graphics();
        // const radius = Math.SQRT2 * 0.5 * width - lineWidth * 0.5;
        // g.moveTo(width, 0);
        // g.lineStyle(lineWidth, 0xffffff, 1);
        // g.arc(0.5 * width, -0.5 * width, radius, Math.SQRT1_2, Math.PI - Math.SQRT1_2);
        // const t = this.app.renderer.generateTexture(g);
        let colorEach;
        placedInteractionsArray.forEach((placedInteractions, index) => {
            const sortedInteractions = placedInteractions
                .slice()
                .sort((a, b) => b.interaction.score - a.interaction.score);
            const slicedInteractions = sortedInteractions.slice(0, ITEM_LIMIT); // Only render ITEM_LIMIT highest scores
            if (useDynamicColors && dynamicColors.length) {
                const colorIndex = index < dynamicColors.length ? index : index % dynamicColors.length;
                colorEach = dynamicColors[colorIndex];
            } else {
                colorEach = color;
            }
            slicedInteractions.forEach((placedInteraction) => {
                const score = placedInteraction.interaction.score;
                if (!score) {
                    return;
                }
                const { xSpan1, xSpan2 } = placedInteraction;
                let xSpan1Center, xSpan2Center;
                if (xSpan1.start === xSpan2.start && xSpan1.end === xSpan2.end) {
                    // inter-region arc
                    xSpan1Center = xSpan1.start;
                    xSpan2Center = xSpan1.end;
                } else {
                    xSpan1Center = 0.5 * (xSpan1.start + xSpan1.end);
                    xSpan2Center = 0.5 * (xSpan2.start + xSpan2.end);
                }
                const spanCenter = 0.5 * (xSpan1Center + xSpan2Center);
                const spanLength = xSpan2Center - xSpan1Center;
                const halfLength = 0.5 * spanLength;
                if (spanLength < 1) {
                    return;
                }
                const radius = Math.max(0, Math.SQRT2 * halfLength - lineWidth * 0.5);
                const colorToUse = !(useDynamicColors && dynamicColors.length) && score < 0 ? color2 : colorEach;
                const tintColor = colorString2number(colorToUse);
                const g = this.subs[index];
                g.moveTo(xSpan2Center, 0);
                g.lineStyle(lineWidth, tintColor, opacityScale(score));
                g.arc(spanCenter, -halfLength, radius, Math.SQRT1_2, Math.PI - Math.SQRT1_2);
                // const t = this.app.renderer.generateTexture(g);
                // const s = new PIXI.Sprite(t);
                // s.tint = tintColor;
                // s.position.set(xSpan1Center, 0);
                // s.scale.set(spanLength / width);
                // s.alpha = opacityScale(score);
                // this.subs[index].addChild(s);
                // g.clear();
                this.arcData[index].push([spanCenter, -halfLength, radius, lineWidth, placedInteraction.interaction]);
            });
            const label = trackModel.tracks[index].label ? trackModel.tracks[index].label : "";
            if (label) {
                const t = new PIXI.Text(trackModel.tracks[index].label, style);
                t.position.set(viewWindow.start + 5, height - 21);
                this.subs[index].addChild(t);
            }
        });
        // g.destroy();
    };

    render() {
        const { height, width } = this.props;
        const style = { width: `${width}px`, height: `${height}px` };
        return (
            // <HoverTooltipContext getTooltipContents={this.renderTooltip} useRelativeY={true}>
            <div style={style} ref={this.myRef}></div>
            // </HoverTooltipContext>
        );
    }
}
