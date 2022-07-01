import React, { useState } from "react";

interface ButtonProps {
    children: string;
    style?: React.CSSProperties;
    color?: "primary" | "secondary" | "inherit";
    onClick?: (event?: React.MouseEvent<HTMLDivElement>) => void;
    href?: string;
}

function Button(props: ButtonProps) {
    const {
        children,
        style,
        onClick,
        href
    } = props;

    const handleClick = (event?: React.MouseEvent<HTMLDivElement>) => {
        if (onClick) onClick(event);
        if (href) window.open(href, "_blank");
    };

    return (
        <div
            className="eg-button"
            style={style}
            onClick={handleClick}
        >
            <span>{children}</span>
        </div>
    )
}

export default Button;