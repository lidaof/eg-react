import React from "react";
import { ColorPicker } from "./ColorPicker";

export const Legend = (props) => {
    const { colorScale, onUpdateLegendColor, haps } = props;
    if (!colorScale) return null;
    const [min, max] = colorScale.domain();
    const color1 = colorScale(min);
    const color2 = colorScale((min + max) * 0.25);
    const color3 = colorScale((min + max) * 0.5);
    const color4 = colorScale((min + max) * 0.75);
    const color5 = colorScale(max);
    // console.log(color1, color2, color3, color4, color5)

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div>
                <ColorPicker
                    key={props.targetHap}
                    onUpdateLegendColor={onUpdateLegendColor}
                    colorKey="legendMinColor"
                    initColor={color1}
                    setTargetHap={props.setTargetHap}
                    targetHap={props.targetHap}
                    haps={haps}
                />
            </div>
            <svg height="40" width="300" style={{ display: "block" }}>
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color1} stopOpacity="1" />
                        <stop offset="25%" stopColor={color2} stopOpacity="1" />
                        <stop offset="50%" stopColor={color3} stopOpacity="1" />
                        <stop offset="75%" stopColor={color4} stopOpacity="1" />
                        <stop offset="100%" stopColor={color5} stopOpacity="1" />
                    </linearGradient>
                </defs>
                <rect x="50" y="0" width="200" height="40" fill="url(#grad1)" />
                <text fill="#000" fontSize="16" fontFamily="Arial" x="6" y="28">
                    {min}
                </text>
                <text fill="#000" fontSize="16" fontFamily="Arial" x="253" y="28">
                    {max}
                </text>
                Sorry, your browser does not support inline SVG.
            </svg>
            <div>
                <ColorPicker
                    key={props.targetHap}
                    onUpdateLegendColor={onUpdateLegendColor}
                    colorKey="legendMaxColor"
                    initColor={color5}
                    setTargetHap={props.setTargetHap}
                    targetHap={props.targetHap}
                    haps={haps}
                />
            </div>
        </div>
    );
};

Legend.defaultProps = {
    colorScale: null,
};
