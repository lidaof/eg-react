import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from './getComponentName';

/**
 * An override for the input Component class' style.  Returns a Component class whose entire width is only partially
 * visible, and can be horizontally scrolled via the `xOffset` prop.  By default, the visible window is horizontally
 * centered.
 * 
 * Consumed props:
 *  - `viewExpansion`
 *  - `xOffset`
 *  - `outerStyle`
 *  - `style`
 *  - `width`
 * 
 * Injected props:
 *  - {number} `width` - width to render
 *  - {Object} `style` - CSS of the widened component.  Some parent styles may be overriden.
 * 
 * @param {typeof React.Component} WrappedComponent - Component class to enhance
 * @return {typeof React.Component} component class whose entire width is only partially visible
 * @author Silas Hsu
 */
function withExpandedWidth(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withExpandedWidth(${getComponentName(WrappedComponent)})`;

        static propTypes = {
            viewExpansion: PropTypes.object.isRequired, // Info on the width of this component
            xOffset: PropTypes.number, // How much to offset children's horizontal position
            outerStyle: PropTypes.object, // Style of the outer div
            style: PropTypes.object, // Style to merge of wrapped component.  Some styles may be overriden
        };

        static defaultProps = {
            xOffset: 0
        };

        render() {
            const {viewExpansion, xOffset, outerStyle, style, ...remainingProps} = this.props;
            let left = 0;
            if (xOffset > 0) {
                // Dragging stuff on the left into view.  So, we limit to how many pixels exist on the left.
                left = Math.min(xOffset, viewExpansion.viewWindow.start);
            } else {
                // Ditto for dragging stuff on the right into view.
                const numPixelsOnRight = viewExpansion.expandedWidth - viewExpansion.viewWindow.end;
                left = Math.max(-numPixelsOnRight, xOffset);
            }

            const divStyle = Object.assign(outerStyle || {}, {
                overflowX: "hidden",
                width: viewExpansion.viewWindow.getLength(),
            });

            const wrappedStyle = Object.assign(style || {}, {
                position: "relative",
                // This centers the view window, rather than it starting at the leftmost part of the wrapped component.
                marginLeft: -viewExpansion.viewWindow.start,
                left: left
            });

            return (
            <div style={divStyle}>
                <WrappedComponent
                    {...remainingProps}
                    width={viewExpansion.expandedWidth}
                    style={wrappedStyle}
                />
            </div>
            );
        }
    }
}

withExpandedWidth.INJECTED_PROPS = {
    width: PropTypes.number,
    style: PropTypes.object
};

export default withExpandedWidth;
