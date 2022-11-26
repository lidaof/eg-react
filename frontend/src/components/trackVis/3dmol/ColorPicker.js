import React from "react";
import reactCSS from "reactcss";
import { SketchPicker } from "react-color";
import colorParse from "color-parse";

export class ColorPicker extends React.Component {
    static defaultProps = {
        label: "",
        fullWidth: false,
        clickDisabled: false,
    };

    constructor(props) {
        super(props);
        const parsed = colorParse(props.initColor);
        this.state = {
            displayColorPicker: false,
            color: {
                r: parsed.values[0],
                g: parsed.values[1],
                b: parsed.values[2],
                a: parsed.alpha,
            },
            targetHap: "",
        };
    }

    componentDidUpdate(_, prevState) {
        if (prevState.targetHap !== this.state.targetHap) {
            const toBeParsed = this.state.targetHap ? this.props.sepInitColor[this.state.targetHap] : this.props.initColor;
            if (!toBeParsed) return;
            const parsed = colorParse(toBeParsed);
            const [r, g, b] = parsed.values;
            this.setState({
                color: { r, g, b, a: parsed.alpha }
            })
        }
    }

    handleClick = () => {
        if (!this.props.clickDisabled) {
            this.setState({ displayColorPicker: !this.state.displayColorPicker });
        }
    };

    handleClose = () => {
        this.setState({ displayColorPicker: false });
    };

    handleChange = (color) => {
        this.setState({ color: color.rgb });
        const { onUpdateLegendColor, colorKey, getChangedColor } = this.props;
        if (onUpdateLegendColor) {
            if (this.state.targetHap) {
                onUpdateLegendColor(colorKey, color.hex, this.state.targetHap);
            } else {
                onUpdateLegendColor(colorKey, color.hex);
            }
        }
        if (getChangedColor) {
            getChangedColor(color.hex);
        }
    };

    setTargetHap = (e) => {
        this.setState({ targetHap: e.target.value });
    }

    render() {
        const brightness = (0.299 * this.state.color.r + 0.587 * this.state.color.g + 0.114 * this.state.color.b) / 255;
        const color = brightness < 0.5 ? "white" : "black";
        const width = this.props.fullWidth ? "unset" : "24px";

        const styles = reactCSS({
            default: {
                color: {
                    color,
                    width,
                    height: "24px",
                    borderRadius: "2px",
                    textAlign: "center",
                    border: "1px solid black",
                    background: `rgba(${this.state.color.r}, ${this.state.color.g}, ${this.state.color.b}, ${this.state.color.a})`,
                },
                swatch: {
                    padding: "5px",
                    background: "#fff",
                    borderRadius: "1px",
                    //   boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
                    // display: "inline-block",
                    cursor: this.props.clickDisabled ? "auto" : "pointer",
                },
                popover: {
                    position: "absolute",
                    zIndex: "2",
                    display: "inline-block",
                    backgroundColor: "white",
                },
                cover: {
                    position: "fixed",
                    top: "0px",
                    right: "0px",
                    bottom: "0px",
                    left: "0px",
                    zIndex: -1,
                },
            },
        });

        return (
            <div>
                <div style={styles.swatch} onClick={this.handleClick}>
                    <div style={styles.color}>{this.props.label}</div>
                </div>
                {this.state.displayColorPicker ? (
                    <div style={styles.popover}>
                        <div style={styles.cover} onClick={this.handleClose} />
                        <div>
                            <div>
                                <select value={this.state.targetHap} onChange={this.setTargetHap} style={{ width: 200 }}>
                                    <option value="">all</option>
                                    {this.props.haps && this.props.haps.map(h => (
                                        <>
                                            <option value={h}>{h}</option>
                                        </>
                                    ))}
                                </select>
                                {this.props.message && (
                                    <p style={{ fontSize: 10, }}>{this.props.message}</p>
                                )}
                            </div>
                            <SketchPicker color={this.state.color} onChangeComplete={this.handleChange} />
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
}
