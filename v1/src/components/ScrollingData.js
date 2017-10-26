import React from 'react';
import PropTypes from 'prop-types';
import RegionExpander from '../model/RegionExpander';

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
        regionExpander: PropTypes.instanceOf(RegionExpander).isRequired, // Determines how wide to make child elements
        xOffset: PropTypes.number, // How much to offset children's horizontal position
    }

    static defaultProps = {
        regionExpander: RegionExpander.makeIdentityExpander(),
        xOffset: 0,
    }

    /**
     * Renders a <div> with `overflow: hidden` and any of this component's children.  <svg> and <canvas> elements will
     * have their width and height set, and certain style props related to positioning will be merged in as well.
     */
    render() {
        const displayComponentStyle = {
            display: "block",
            position: "relative",
            marginLeft: -this.props.width * this.props.regionExpander.multipleOnEachSide,
            left: this.props.xOffset,
        };

        const children = React.Children.map(this.props.children, child => {
            if (!child) {
                return null;
            }
            
            let propsToMerge = null;
            if (child.type === "svg" || child.type === "canvas") {
                const style = Object.assign({}, displayComponentStyle, child.props.style || {});
                propsToMerge = {
                    style: style,
                    width: this.props.regionExpander.expandWidth(this.props.width),
                    height: this.props.height
                };
            } else if (child.type.name === "SvgContainer") {
                // We want to merge into the SvgContainer.props.svgProps, not SvgContainer.props, so it's more complex.
                const svgProps = child.props.svgProps || {};
                const style = Object.assign({}, displayComponentStyle, svgProps.style || {});
                propsToMerge = {
                    svgProps: Object.assign({}, svgProps, {
                        style: style,
                        width: this.props.regionExpander.expandWidth(this.props.width),
                        height: this.props.height
                    })
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
