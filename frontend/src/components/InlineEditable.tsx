import React, { useState, useEffect } from "react";
import {
    TypographyVariant,
    Typography,
    TextField,
    Tooltip,
} from "@material-ui/core";

interface InlineEditableProps {
    value: string;
    onChange: (value: string) => void;
    variant: TypographyVariant;
}

function InlineEditable(props: InlineEditableProps) {
    const [editing, setEditing] = useState(false);
    const [hovering, setHovering] = useState(false);

    const handleClick = () => setEditing(true);
    const handleBlur = () => setEditing(false);

    const handleMouseEnter = () => setHovering(true);
    const handleMouseLeave = () => setHovering(false);

    let body;

    if (editing) {
        body = (
            <TextField
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                onBlur={() => setEditing(false)}
                autoFocus
                
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
            >
                {body}
            </div>
        )
    } else {
        return (
            <Tooltip
                title="Click to edit"
                arrow
                placement="top"
                onClick={handleClick}
                style={divStyle}
            >
                {body}
            </Tooltip>
        )
    }

}

export default InlineEditable;