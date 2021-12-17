import React from "react";
import { ColorPicker } from "./ColorPicker";

export const StaticLegend = (props) => {
    const { categories } = props;
    // console.log(props);
    if (!categories) return null;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
            {Object.keys(categories).map((k) => {
                return (
                    <div key={k} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <ColorPicker initColor={categories[k]} clickDisabled={true} />
                        <div>{k}</div>
                    </div>
                );
            })}
        </div>
    );
};

StaticLegend.defaultProps = {
    categories: null,
};
