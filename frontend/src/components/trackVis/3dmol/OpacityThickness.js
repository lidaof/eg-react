import React from "react";

export const OpacityThickness = (props) => {
    const { onUpdate, opacity, thickness } = props;
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
                tube thickness:{" "}
                <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.1}
                    value={thickness}
                    onChange={(e) => onUpdate("cartoonThickness", Number.parseFloat(e.target.value || 0))}
                />
            </label>
        </div>
    );
};

OpacityThickness.defaultProps = {};
