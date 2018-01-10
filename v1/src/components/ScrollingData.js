import React from 'react';
import PropTypes from 'prop-types';

/**
 * A component that purposely makes child visualizer elements wider, so they can be scrolled.  Such elements include
 * <svg>, <canvas> and <SvgContainer>, which will be widened an amount depending on the regionExpander props.  Widened
 * elements will start horizontally centered, and can be offset with the xOffset prop.
 * 
 * Details: any child <svg>'s or <canvas>'s will have the the following props changed:
 *    * width
 *    * height
 *    * style, which will have certain positioning attributes merged in.
 * Any other children will be left unchanged.
 * 
 * @author Silas Hsu
 */
class ScrollingData extends React.Component {
    static propTypes = {
        width: PropTypes.number.isRequired, // The width of this component
        height: PropTypes.number.isRequired, // The height of this component
        viewExpansion: PropTypes.object.isRequired, // Determines how wide to make child elements
        xOffset: PropTypes.number, // How much to offset children's horizontal position
    }

    static defaultProps = {
        xOffset: 0,
    }

    /**
     * Renders a <div> with `overflow: hidden` and any of this component's children.  <svg> and <canvas> elements will
     * have their width and height set, and certain style props related to positioning will be merged in as well.
     */
    render() {
        let left = 0;
        if (this.props.xOffset > 0) {
            left = Math.min(this.props.xOffset, this.props.viewExpansion.leftExtraPixels);
        } else {
            left = Math.max(-this.props.viewExpansion.rightExtraPixels, this.props.xOffset);
        }

        const displayComponentStyle = {
            display: "block",
            position: "relative",
            marginLeft: -this.props.viewExpansion.leftExtraPixels,
            left: left
        };

        const children = React.Children.map(this.props.children, child => {
            if (!child) {
                return null;
            }
            
            let propsToMerge = null;
            if (child.type === "svg" || child.type === "canvas" || child.type.name === "SvgContainer") {
                const style = Object.assign({}, displayComponentStyle, child.props.style || {});
                propsToMerge = {
                    style: style,
                    width: this.props.viewExpansion.expandedWidth,
                    height: this.props.height
                };
            }

            if (propsToMerge) {
                return React.cloneElement(child, propsToMerge);
            }
            return child;
        });

        const divStyle = {
            overflow: "hidden",
            display: "inline-block",
            width: this.props.width,
        };

        return (
        <div style={divStyle}>
            {children}
        </div>
        );
    }
}

export default ScrollingData;
