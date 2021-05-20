import React, { useState } from "react";
import _ from "lodash";
import { CheckCircleIcon, XCircleIcon } from "@primer/octicons-react";
import { ColorPicker } from "./ColorPicker";
import { usePrevious } from "./ShapeList";

export const ArrowList = (props) => {
    const { arrows, onUpdateMyArrows, onDeleteArrowByKey, onSetMessage } = props;
    // console.log(props);
    if (_.isEmpty(arrows)) return null;
    return (
        <>
            <p className="font-italic">Arrows:</p>
            <ol style={{ marginBottom: 0, paddingLeft: 8 }}>
                {Object.keys(arrows).map((s) => {
                    return (
                        <li key={s}>
                            <ArrowMenu
                                id={s}
                                arrow={arrows[s]}
                                onUpdateMyArrows={onUpdateMyArrows}
                                onDeleteArrowByKey={onDeleteArrowByKey}
                                onSetMessage={onSetMessage}
                            />
                        </li>
                    );
                })}
            </ol>
        </>
    );
};

ArrowList.defaultProps = {
    arrows: {},
    onUpdateMyArrows: () => {},
    onDeleteArrowByKey: () => {},
    onSetMessage: () => {},
};

const ArrowMenu = (props) => {
    const { id, arrow, onUpdateMyArrows, onDeleteArrowByKey, onSetMessage } = props;
    const [color, setColor] = useState(arrow.color);
    const [x, setX] = useState(arrow.start.x);
    const [y, setY] = useState(arrow.start.y);
    const [z, setZ] = useState(arrow.start.z);
    const [radius, setRadius] = useState(arrow.radius);
    const prevRadius = usePrevious(radius);
    const prevColor = usePrevious(color);
    const prevX = usePrevious(x);
    const prevY = usePrevious(y);
    const prevZ = usePrevious(z);
    const updateArrow = () => {
        if (x === prevX && y === prevY && z === prevZ && color === prevColor && prevRadius === radius) {
            onSetMessage("no attribute changed, abort...");
            return;
        }
        const newArrow = {
            start: { x, y, z },
            color,
            radius,
            locus: arrow.locus,
            loci: arrow.loci,
        };
        onUpdateMyArrows(id, newArrow);
    };

    return (
        <div className="arrow-list">
            <div style={{ display: "flex", alignItems: "baseline" }}>
                <ColorPicker label={id} initColor={color} getChangedColor={setColor} fullWidth={true} />
                <label>
                    radius:
                    <input
                        type="number"
                        value={radius}
                        onChange={(e) => setRadius(Number.parseFloat(e.target.value || 0))}
                    />
                </label>
            </div>
            <div style={{ display: "flex", alignItems: "baseline" }}>
                <label>
                    From x:
                    <input type="number" value={x} onChange={(e) => setX(Number.parseFloat(e.target.value || 0))} />
                </label>
                <label>
                    y:
                    <input type="number" value={y} onChange={(e) => setY(Number.parseFloat(e.target.value || 0))} />
                </label>
                <label>
                    z:
                    <input type="number" value={z} onChange={(e) => setZ(Number.parseFloat(e.target.value || 0))} />
                </label>

                <button title="Update" className="btn btn-primary btn-sm btn-dense" onClick={updateArrow}>
                    <CheckCircleIcon size={16} />
                </button>
                <button
                    title="Delete"
                    className="btn btn-warning btn-sm btn-dense"
                    onClick={() => onDeleteArrowByKey(id)}
                >
                    <XCircleIcon size={16} />
                </button>
            </div>
        </div>
    );
};
