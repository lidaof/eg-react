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
            viewExpansion: PropTypes.object.isRequired, // Info on the width of this component
            xOffset: PropTypes.number, // How much to offset children's horizontal position
            innerRef: PropTypes.func, // Accessor for ref to wrapped component
        };

        static defaultProps = {
            xOffset: 0
        };

        render() {
            const {viewExpansion, xOffset, innerRef, style, ...remainingProps} = this.props;
            let left = 0;
            if (xOffset > 0) {
                // Dragging stuff on the left into view.  So, we limit to how many pixels exist on the left.
                left = Math.min(xOffset, viewExpansion.viewWindow.start);
            } else {
                // Ditto for dragging stuff on the right into view.
                const numPixelsOnRight = viewExpansion.expandedWidth - viewExpansion.viewWindow.end;
                left = Math.max(-numPixelsOnRight, xOffset);
            }

            const divStyle = {
                overflowX: "hidden",
                width: viewExpansion.viewWindow.getLength(),
            };

            const wrappedStyle = Object.assign(style || {}, {
                position: "relative",
                // This centers the view window, rather than it starting at the leftmost part of the wrapped component.
                marginLeft: -viewExpansion.viewWindow.start,
                left: left
            });

            return (
            <div style={divStyle}>
                <WrappedComponent
                    width={viewExpansion.expandedWidth}
                    style={wrappedStyle}
                    ref={innerRef}
                    {...remainingProps}
                />
            </div>
            );
        }
    }
}
