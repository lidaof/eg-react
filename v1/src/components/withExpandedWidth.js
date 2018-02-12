import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from './getComponentName';

/**
 * An override for the input Component's style.  Returns a Component whose entire width is only partially visible, and
 * can be horizontally scrolled via the `xOffset` prop.  By default, the visible window is horizontally centered.
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @return {React.Component} component whose entire width is only partially visible
 * @author Silas Hsu
 */
export default function withExpandedWidth(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withExpandedWidth(${getComponentName(WrappedComponent)})`;

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
