import React, { useState } from "react";
import _ from "lodash";
import { CheckCircleIcon, XCircleIcon } from "@primer/octicons-react";
import { ColorPicker } from "./ColorPicker";

export const ShapeList = (props) => {
    const { shapes, onUpdateMyShapes, onDeleteShapeByKey, onSetMessage } = props;
    // console.log(props);
    if (_.isEmpty(shapes)) return null;
    return (
        <>
            <p className="font-italic">Labels:</p>
            <ol style={{ marginBottom: 0, paddingLeft: 8 }}>
                {Object.keys(shapes).map((s) => {
                    return (
                        <li key={s}>
                            <ShapeMenu
                                id={s}
                                shape={shapes[s]}
                                onUpdateMyShapes={onUpdateMyShapes}
                                onDeleteShapeByKey={onDeleteShapeByKey}
                                onSetMessage={onSetMessage}
                            />
                        </li>
                    );
                })}
            </ol>
        </>
    );
};

ShapeList.defaultProps = {
    shapes: {},
    onUpdateMyShapes: () => {},
    onDeleteShapeByKey: () => {},
    onSetMessage: () => {},
};

const ShapeMenu = (props) => {
    const { id, shape, onUpdateMyShapes, onDeleteShapeByKey, onSetMessage } = props;
    const [label, setLabel] = useState(shape.label);
    const [color, setColor] = useState(shape.color);
    const [outline, setOutline] = useState(shape.outline);
    const [size, setSize] = useState(shape.size);
    const [wireframe, setWireframe] = useState(shape.wireframe);
    const prevLabel = usePrevious(label);
    const prevColor = usePrevious(color);
    const prevOutline = usePrevious(outline);
    const prevSize = usePrevious(size);
    const prevWireframe = usePrevious(wireframe);
    const updateShape = () => {
        if (
            label === prevLabel &&
            color === prevColor &&
            outline === prevOutline &&
            prevSize === size &&
            prevWireframe === wireframe
        ) {
            onSetMessage("no attribute changed, abort...");
            return;
        }
        const newShape = {
            label,
            color,
            outline,
            locus: shape.locus,
            loci: shape.loci,
            size,
            wireframe,
        };
        onUpdateMyShapes(id, newShape);
    };

    return (
        <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap" }} className="arrow-list">
            <ColorPicker label={id} initColor={color} getChangedColor={setColor} fullWidth={true} />
            <label>
                size:
                <input
                    style={{ width: "6ch" }}
                    type="number"
                    value={size}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(e) => setSize(Number.parseInt(e.target.value))}
                />
            </label>
            {shape.locus !== null && (
                <input
                    type="text"
                    defaultValue={shape.label}
                    size="10"
                    style={{ width: "unset" }}
                    onChange={(e) => setLabel(e.target.value.trim())}
                />
            )}
            <select value={outline} onChange={(e) => setOutline(e.target.value)}>
                {["sphere", "box"].map((r) => (
                    <option key={r} value={r}>
                        {r}
                    </option>
                ))}
            </select>
            <label>
                frame:
                <input type="checkbox" checked={wireframe} onChange={() => setWireframe(!wireframe)} />
            </label>
            <button title="Update" className="btn btn-primary btn-sm btn-dense" onClick={updateShape}>
                <CheckCircleIcon size={16} />
            </button>
            <button title="Delete" className="btn btn-warning btn-sm btn-dense" onClick={() => onDeleteShapeByKey(id)}>
                <XCircleIcon size={16} />
            </button>
        </div>
    );
};

//custom Hook
export function usePrevious(data) {
    const ref = React.useRef();
    React.useEffect(() => {
        ref.current = data;
    }, [data]);
    return ref.current;
}
