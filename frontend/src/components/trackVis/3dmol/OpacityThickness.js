import React from "react";

export const OpacityThickness = (props) => {
    const { onUpdate, opacity, thickness, highlightStyle } = props;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <label>
                line opacity:{" "}
                <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.1}
                    value={opacity}
                    onChange={(e) => onUpdate("lineOpacity", Number.parseFloat(e.target.value || 0))}
                />
            </label>
            <label>
                thickness/radius:{" "}
                <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={thickness}
                    onChange={(e) => onUpdate("cartoonThickness", Number.parseFloat(e.target.value || 0))}
                />
            </label>
            <label>
                paint style:{" "}
                <select value={highlightStyle} onChange={(e) => onUpdate("highlightStyle", e.target.value)}>
                    <option value="cartoon">cartoon</option>
                    <option value="sphere">sphere</option>
                    {/* <option value="cross">cross</option> */}
                    {/* <option value="line">line</option> */}
                </select>
            </label>
        </div>
    );
};

OpacityThickness.defaultProps = {};
