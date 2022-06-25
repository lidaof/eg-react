import React from "react";

const DEFAULT_STYLE = {
    color: "red",
    textAlign: "center",
    backgroundColor: "var(--bg-color)",
    border: "1px solid red",
    padding: 3,
};

/**
 * Displays error messages with reasonable default style.  Use it like a <div>: it accepts all props that <div>s accept,
 * plus `width` and `height`.
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - error message to render
 */
function ErrorMessage(props) {
    const { width, height, style, ...otherProps } = props;
    const mergedStyle = Object.assign({}, DEFAULT_STYLE, { width: width, height: height }, style);
    return <div style={mergedStyle} {...otherProps} />;
}

export default ErrorMessage;
