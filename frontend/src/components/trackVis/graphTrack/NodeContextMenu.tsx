import React from "react";
import { notify } from "react-notify-toast";
import ChromosomeInterval from "../../../model/interval/ChromosomeInterval";
import DisplayedRegionModel from "model/DisplayedRegionModel";

interface NodeContextMenuProps {
    node: any;
    x: number;
    y: number;
    viewRegion: DisplayedRegionModel;
    onNewViewRegion: (start: number, end: number) => void;
    removeNodeContextMenu: () => void;
}

export const NodeContextMenu = ({
    node,
    x,
    y,
    onNewViewRegion,
    viewRegion,
    removeNodeContextMenu,
}: NodeContextMenuProps) => {
    if (!node) return null;
    const navContext = viewRegion.getNavigationContext();
    const locus = new ChromosomeInterval(node.chr, node.start, node.end);
    const jumpToNode = () => {
        const interval = navContext.convertGenomeIntervalToBases(locus)[0];
        if (interval) {
            onNewViewRegion(interval.start, interval.end);
        } else {
            notify.show("Region not available for this node", "error", 2000);
        }
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
                {node.chr}:{node.start}-{node.end}
            </div>
            <div className="hoverButtons">
                <button className="btn btn-sm btn-primary" onClick={jumpToNode}>
                    Browser region
                </button>
                <button className="btn btn-sm btn-seconday" onClick={removeNodeContextMenu}>
                    Close
                </button>
            </div>
        </div>
    );
};

NodeContextMenu.defaultProps = {
    node: null,
    x: 0,
    y: 0,
};
