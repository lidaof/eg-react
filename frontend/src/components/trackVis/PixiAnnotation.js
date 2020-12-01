import React from "react";
import PropTypes from "prop-types";
import * as PIXI from "pixi.js";
// import HoverTooltipContext from "../commonComponents/tooltip/HoverTooltipContext";
import { colorString2number } from "../../util";

import { TOP_PADDING, ROW_VERTICAL_PADDING } from "./bedTrack/DynamicBedTrack";

export class PixiAnnotation extends React.PureComponent {
    static propTypes = {
        arrangeResults: PropTypes.array.isRequired,
        viewWindow: PropTypes.object.isRequired,
        height: PropTypes.number.isRequired,
        width: PropTypes.number.isRequired,
        backgroundColor: PropTypes.string,
        color: PropTypes.string,
        color2: PropTypes.string,
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
        dynamicColors: [],
        useDynamicColors: false,
    };

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.container = null;
        this.subcontainer = null;
        this.app = null;
        this.state = {
            currentStep: 0,
            isPlaying: true,
        };
        this.count = 0;
        this.subs = []; //holder for sub containers for each sprite sets from each track
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
    }

    componentWillUnmount() {
        this.app.ticker.remove(this.tick);
        window.removeEventListener("resize", this.onWindowResize);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.arrangeResults !== this.props.arrangeResults) {
            this.drawAnnotations();
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
        }
    }

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

    initializeSubs = () => {
        this.subs = [];
        this.steps = this.getMaxSteps();
        for (let i = 0; i < this.steps; i++) {
            this.subs.push(new PIXI.Container());
        }
        this.subs.forEach((c) => this.subcontainer.addChild(c));
    };

    resetSubs = () => {
        this.subs.forEach((c) => c.removeChildren());
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
        const max = this.props.steps ? this.props.steps : this.props.arrangeResults.length;
        return max;
    };

    drawAnnotations = () => {
        const {
            color,
            color2,
            viewWindow,
            height,
            arrangeResults,
            trackModel,
            rowHeight,
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
        const bedStyle = new PIXI.TextStyle({
            fontFamily: "Arial",
            fontSize: rowHeight,
        });
        const g = new PIXI.Graphics();
        g.lineStyle(0);
        g.beginFill(0xffffff, 1);
        g.drawRect(0, 0, 1, 1);
        g.endFill();
        let colorEach;
        const t = PIXI.RenderTexture.create(g.width, g.height);
        this.app.renderer.render(g, t);
        arrangeResults.forEach((placementGroup, index) => {
            if (useDynamicColors && dynamicColors.length) {
                const colorIndex = index < dynamicColors.length ? index : index % dynamicColors.length;
                colorEach = dynamicColors[colorIndex];
            } else {
                colorEach = color;
            }
            placementGroup.placements.forEach((placement) => {
                const { xSpan, row, feature } = placement;
                const colorToUse =
                    !(useDynamicColors && dynamicColors.length) && feature.getIsReverseStrand() ? color2 : colorEach;
                const tintColor = colorString2number(colorToUse);
                const itemWidth = Math.max(2, xSpan.end - xSpan.start);
                const s = new PIXI.Sprite(t);
                s.tint = tintColor;
                const itemY = row * (rowHeight + ROW_VERTICAL_PADDING) + TOP_PADDING;
                s.position.set(xSpan.start, itemY);
                s.scale.set(itemWidth, rowHeight);
                this.subs[index].addChild(s);
                const textStyle = { ...bedStyle, fill: colorEach };
                const st = new PIXI.Text(feature.getName(), textStyle);
                st.position.set(xSpan.end + 2, itemY - TOP_PADDING);
                this.subs[index].addChild(st);
            });
            const label = trackModel.tracks[index].label ? trackModel.tracks[index].label : "";
            if (label) {
                const t = new PIXI.Text(trackModel.tracks[index].label, style);
                t.position.set(viewWindow.start + 5, height - 21);
                this.subs[index].addChild(t);
            }
        });
        g.destroy();
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
