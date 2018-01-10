import PropTypes from 'prop-types';
import React from 'react';

import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';

/**
 * A React component that renders a <svg> element.  Children that are custom React components will recieve the following
 * props, once the <svg> mounts:
 *     svgNode: a ref to the parent's svg
 *     drawModel: a LinearDrawingModel
 * 
 * This component requires a DisplayedRegionModel (`displayedRegion`) to calculate the drawing model; other props will
 * be passed directly to the <svg>.
 * 
 * @author Silas Hsu
 */
class SvgContainer extends React.Component {
    static propTypes = {
        /**
         * The current region in which to draw; will used to calculate the draw model.
         */
        displayedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        // All other props will be passed directly to the <svg>.
    };

    static defaultProps = {
        width: "100%",
        height: "100%",
    };

    constructor(props) {
        super(props);
        this.state = {
            svgNode: null
        };
        this.handleSvgRef = this.handleSvgRef.bind(this);
    }

    /**
     * Saves the ref to the SVG node and passes it to any interested parents
     * 
     * @param {SVGAnimatedString} node - a SVG DOM node
     */
    handleSvgRef(node) {
        if (this.props.ref) {
            this.props.ref(node);
        }
        this.setState({svgNode: node});
    }

    /**
     * Gives each child component props `svgNode` and `drawModel` props.
     * 
     * @return {React.Component[]} children to render
     */
    renderChildren() {
        const svgNode = this.state.svgNode;
        if (svgNode == null) {
            return [];
        }

        const width = typeof this.props.width === "number" ? this.props.width : svgNode.clientWidth;
        const drawModel = new LinearDrawingModel(this.props.displayedRegion, width);
        const propsToGive = {
            svgNode: svgNode,
            drawModel: drawModel,
        };
        
        return React.Children.map(this.props.children, (child) => {
            if (!child) {
                return null;
            }
            if (typeof child.type === "string") { // A native DOM element; we shouldn't give extra props to these.
                return child;
            }
            return React.cloneElement(child, propsToGive);
        });
    }

    /**
     * Outputs a SVG node, and then this component's children as siblings to the SVG once the SVG mounts.
     * 
     * @override
     */
    render() {
        let {displayedRegion, children, ...svgProps} = this.props;
        svgProps.ref = this.handleSvgRef;
        return <svg {...svgProps} >{this.renderChildren()}</svg>;
    }
}

export default SvgContainer;
