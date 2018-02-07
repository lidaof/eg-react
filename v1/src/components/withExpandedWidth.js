import React from 'react';
import PropTypes from 'prop-types';

/**
 * An override for the input Component's style.  Returns a Component that is wider than its visible portion, and can be
 * horizontally scrolled via the `xOffset` prop.  0 is horizontally centered.
 * 
 * @author Silas Hsu
 */
export default function withExpandedWidth(WrappedComponent) {
    const displayName = typeof WrappedComponent === "string" ?
        WrappedComponent : WrappedComponent.displayName || WrappedComponent.name || 'Component';
    return class extends React.Component {
        static displayName = `withExpandedWidth(${displayName})`;

        static propTypes = {
            visibleWidth: PropTypes.number.isRequired, // The *visible* width of this component
            viewExpansion: PropTypes.object.isRequired, // Info on the *actual* width of this component
            xOffset: PropTypes.number, // How much to offset children's horizontal position
            wrappedRef: PropTypes.func, // Accessor for ref to wrapped component
        };

        render() {
            let {visibleWidth, viewExpansion, xOffset, width, style, wrappedRef, ...remainingProps} = this.props;
            xOffset = xOffset || 0;
            let left = 0;
            if (xOffset > 0) {
                left = Math.min(xOffset, viewExpansion.leftExtraPixels);
            } else {
                left = Math.max(-viewExpansion.rightExtraPixels, xOffset);
            }

            const divStyle = {
                overflow: "hidden",
                width: visibleWidth,
            }

            const wrappedStyle = Object.assign(style || {}, {
                position: "relative",
                marginLeft: -viewExpansion.leftExtraPixels,
                left: left
            });

            return (
            <div style={divStyle}>
                <WrappedComponent
                    width={viewExpansion.expandedWidth}
                    style={wrappedStyle}
                    ref={wrappedRef}
                    {...remainingProps}
                />
            </div>
            );
        }
    }
}
