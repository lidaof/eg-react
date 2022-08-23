import {
    Tooltip, Typography, TypographyVariant
} from "@material-ui/core";
import React, { useState } from "react";
import SnackbarEngine from "../../SnackbarEngine";

interface InlineEditableProps {
    value: string;
    onChange: (value: string) => void;
    variant: TypographyVariant;
    prohibitedValues?: string[];
}

function InlineEditable(props: InlineEditableProps) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(props.value);
    const [hovering, setHovering] = useState(false);

    const handleClick = () => { setValue(props.value); setEditing(true); };
    const handleBlur = () => setEditing(false);
    const handleFinish = () => {
        setEditing(false);
        if (!value) return;
        if ((props.prohibitedValues && props.prohibitedValues).includes(value.toLowerCase())) return SnackbarEngine.error("You can't set to this reserved value!");
        props.onChange(value);
    };
    const handleFocus = (event: React.FocusEvent<any>) => event.target.select();

    const handleMouseEnter = () => setHovering(true);
    const handleMouseLeave = () => setHovering(false);

    let body;

    if (editing) {
        body = (
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleFinish}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleFinish();
                    } else if (e.key === "Escape") {
                        handleBlur();
                    }
                }}
                autoFocus
                onFocus={handleFocus}
                style={{
                    width: value.length + "ch",
                    minWidth: 75,
                }}
            />
        );
    } else {
        body = (
            <Typography variant={props.variant}>
                {props.value}
            </Typography>
        );
    }

    const divStyle: React.HTMLAttributes<HTMLDivElement>["style"] = {};

    if (hovering && !editing) {
        divStyle.outline = "1px solid #C4C4C4";
    }

    if (editing) {
        return (
            <div
                onClick={handleClick}
                onBlur={handleBlur}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={divStyle}
            >
                {body}
            </div>
        )
    } else {
        return (
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Tooltip
                    title="Click to edit"
                    arrow
                    placement="top"
                    onClick={handleClick}
                    style={divStyle}
                >
                    {body}
                </Tooltip>
            </div>
        )
    }

}

export default InlineEditable;