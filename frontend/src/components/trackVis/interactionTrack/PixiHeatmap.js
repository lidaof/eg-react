import React from "react";
import PropTypes from "prop-types";
import * as PIXI from "pixi.js";
import pointInPolygon from "point-in-polygon";
import HoverTooltipContext from "../commonComponents/tooltip/HoverTooltipContext";
import { colorString2number } from "../../../util";

const ANGLE = Math.PI / 4;
const SIDE_SCALE = Math.sin(ANGLE);

export class PixiHeatmap extends React.PureComponent {
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
        this.subcontainer = null;
        this.app = null;
        this.state = {
            currentStep: 0,
            isPlaying: true,
        };
        this.count = 0;
        this.subs = []; //holder for sub containers for each sprite sets from each track
        this.hmData = [];
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
        if (prevProps.placedInteractionsArray !== this.props.placedInteractionsArray) {
            this.drawHeatmap();
        }
        if (prevProps.color !== this.props.color) {
            const color = colorString2number(this.props.color);
            this.subs.forEach((c) => c.children.forEach((s) => (s.tint = color)));
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
            this.hmData.push([]);
        }
        this.subs.forEach((c) => this.subcontainer.addChild(c));
    };

    resetSubs = () => {
        this.subs.forEach((c) => c.removeChildren());
        this.hmData = this.hmData.map(() => []);
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

    drawHeatmap = () => {
        const { opacityScale, color, color2, viewWindow, height, placedInteractionsArray } = this.props;
        if (this.subs.length) {
            this.resetSubs();
        } else {
            this.initializeSubs();
        }
        const g = new PIXI.Graphics();
        g.lineStyle(0);
        g.beginFill(0xffffff, 1);
        g.drawRect(0, 0, 1, 1);
        g.endFill();
        const t = PIXI.RenderTexture.create(g.width, g.height);
        this.app.renderer.render(g, t);
        placedInteractionsArray.forEach((placedInteractions, index) => {
            placedInteractions.forEach((placedInteraction) => {
                const score = placedInteraction.interaction.score;
                if (!score) {
                    return null;
                }
                const { xSpan1, xSpan2 } = placedInteraction;
                if (xSpan1.end < viewWindow.start && xSpan2.start > viewWindow.end) {
                    return null;
                }
                const gapCenter = (xSpan1.end + xSpan2.start) / 2;
                const gapLength = xSpan2.start - xSpan1.end;
                const topX = gapCenter;
                const topY = 0.5 * gapLength;
                const halfSpan1 = Math.max(0.5 * xSpan1.getLength(), 1);
                const halfSpan2 = Math.max(0.5 * xSpan2.getLength(), 1);
                const colorToUse = score >= 0 ? color : color2;
                const tintColor = colorString2number(colorToUse);
                const bottomY = topY + halfSpan1 + halfSpan2;
                const points = [
                    // Going counterclockwise
                    [topX, topY], // Top
                    [topX - halfSpan1, topY + halfSpan1], // Left
                    [topX - halfSpan1 + halfSpan2, bottomY], // Bottom = left + halfSpan2
                    [topX + halfSpan2, topY + halfSpan2], // Right
                ];
                const s = new PIXI.Sprite(t);
                s.tint = tintColor;
                s.position.set(topX, topY);
                s.scale.set(SIDE_SCALE * xSpan2.getLength(), SIDE_SCALE * xSpan1.getLength());
                s.pivot.set(0);
                s.rotation = ANGLE;
                s.alpha = opacityScale(score);
                this.subs[index].addChild(s);
                // only push the points in screen
                if (topX + halfSpan2 > viewWindow.start && topX - halfSpan1 < viewWindow.end && topY < height) {
                    this.hmData[index].push({
                        points,
                        interaction: placedInteraction.interaction,
                    });
                }
            });
        });
    };

    /**
     * Renders the default tooltip that is displayed on hover.
     *
     * @param {number} relativeX - x coordinate of hover relative to the visualizer
     * @param {number} relativeY - y coordinate of hover relative to the visualizer
     * @return {JSX.Element} tooltip to render
     */
    renderTooltip = (relativeX, relativeY) => {
        const { trackModel } = this.props;
        const polygons = this.findPolygon(relativeX, relativeY);
        if (polygons.length) {
            return (
                <div>
                    {polygons.map((polygon, i) => {
                        return (
                            <div key={i}>
                                <div>
                                    <strong>{trackModel.tracks[i].label}</strong>
                                </div>
                                <div>Locus1: {polygon.interaction.locus1.toString()}</div>
                                <div>Locus2: {polygon.interaction.locus2.toString()}</div>
                                <div>Score: {polygon.interaction.score}</div>
                            </div>
                        );
                    })}
                </div>
            );
        } else {
            return null;
        }
    };

    findPolygon = (x, y) => {
        const polygons = [];
        for (const hmData of this.hmData) {
            for (const item of hmData) {
                if (pointInPolygon([x, y], item.points)) {
                    polygons.push(item);
                    break;
                }
            }
        }
        return polygons;
    };

    render() {
        const { height, width } = this.props;
        const style = { width: `${width}px`, height: `${height}px` };
        return (
            <HoverTooltipContext getTooltipContents={this.renderTooltip} useRelativeY={true}>
                <div style={style} ref={this.myRef}></div>;
            </HoverTooltipContext>
        );
    }
}
