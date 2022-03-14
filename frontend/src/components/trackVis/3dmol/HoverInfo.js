import React from "react";
import { notify } from "react-notify-toast";
import ChromosomeInterval from "../../../model/interval/ChromosomeInterval";
import Feature from "../../../model/Feature";
import RegionSet from "../../../model/RegionSet";
import FlankingStrategy from "../../../model/FlankingStrategy";

export const HoverInfo = ({
    atom,
    resolution,
    x,
    y,
    onNewViewRegion,
    viewRegion,
    removeHover,
    addToLabel,
    selectedSet,
    onSetSelected,
    genomeConfig,
}) => {
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

    const addToRegionSetView = () => {
        const atomFeature = new Feature(undefined, locus);
        let newSet;
        if (selectedSet) {
            newSet = selectedSet.cloneAndAddFeature(atomFeature);
        } else {
            const currentChrInterval = viewRegion.getGenomeIntervals()[0];
            const currentFeature = new Feature(undefined, currentChrInterval);
            newSet = new RegionSet(
                "3D set",
                [currentFeature, atomFeature],
                genomeConfig.genome,
                new FlankingStrategy()
            );
        }
        onSetSelected(newSet);
    };

    const closeSetView = () => {
        onSetSelected(null);
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
                <div style={{ display: "flex", gap: 5 }}>
                    <button className="btn btn-sm btn-success" onClick={addToRegionSetView}>
                        Add to set view
                    </button>
                    <button className="btn btn-sm btn-info" onClick={closeSetView}>
                        Close set view
                    </button>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                    <button className="btn btn-sm btn-success" onClick={addAsShape}>
                        Label as shape
                    </button>
                    <button className="btn btn-sm btn-info" onClick={addAsArrow}>
                        Label as arrow
                    </button>
                </div>
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
