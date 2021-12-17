import React from "react";
import { notify } from "react-notify-toast";
import ChromosomeInterval from "model/interval/ChromosomeInterval";

export const HoverInfo = ({ atom, resolution, x, y, onNewViewRegion, viewRegion, removeHover, addToLabel }) => {
    if (!atom) return null;
    const navContext = viewRegion.getNavigationContext();
    const locus = new ChromosomeInterval(atom.chain, atom.properties.start, atom.properties.start + resolution);

    const jumpToAtom = () => {
        const interval = navContext.convertGenomeIntervalToBases(locus)[0];
        if (interval) {
            onNewViewRegion(...interval);
        } else {
            notify.show("Region not available for this atom", "error", 2000);
        }
    };

    const addAsShape = () => {
        addToLabel([locus], true);
    };

    const addAsArrow = () => {
        addToLabel([locus], false);
    };

    return (
        <div
            style={{
                padding: 5,
                position: "absolute",
                left: x,
                top: y,
                zIndex: 3,
                background: "rgb(191 228 173)",
                textAlign: "left",
                border: "solid 1px orange",
            }}
        >
            <div>
                {atom.chain} {atom.properties.start}
            </div>
            <div>Resolution: {resolution}</div>
            <div>{atom.properties.hap}</div>
            <div className="hoverButtons">
                <button className="btn btn-sm btn-primary" onClick={jumpToAtom}>
                    Browser region
                </button>
                <button className="btn btn-sm btn-success" onClick={addAsShape}>
                    Label as shape
                </button>
                <button className="btn btn-sm btn-info" onClick={addAsArrow}>
                    Label as arrow
                </button>
                <button className="btn btn-sm btn-seconday" onClick={removeHover}>
                    Close
                </button>
            </div>
        </div>
    );
};

HoverInfo.defaultProps = {
    atom: null,
    x: 0,
    y: 0,
};
