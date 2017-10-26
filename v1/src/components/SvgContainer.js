import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * A React component that contains a <svg> element.  This component's children will automatically recieve a ref to the
 * SVG node and a LinearDrawingModel once the component mounts.  Note that the children will be mounted as siblings to
 * the SVG node, and not children to the SVG node.  For specifying direct children of the SVG, a different component
 * would be more appropriate.
 * 
 * @see SvgComponent
 * @author Silas Hsu
 */
class SvgContainer extends React.Component {
    static propTypes = {
        /**
         * The current region in which to draw; will used to calculate the draw model.
         */
        model: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        /**
         * The width to use in calculating the draw model.  If not specified, defaults to the SVG's width.
         */
        drawModelWidth: PropTypes.number,

        style: PropTypes.object, // Inline CSS to pass the div parent node
        svgProps: PropTypes.object, // Props to pass to the SVG node.  Guess what?  refs work too!
    }

    static defaultProps = {
        svgProps: {}
    }

    constructor(props) {
        super(props);
        this.state = {
            isMounted: false,
        }
        this.svgNode = null;
        this.drawModel = null;

        this.handleSvgRef = this.handleSvgRef.bind(this);
    }

    /**
     * Sets state so we can mount our children, and creates a new LinearDrawingModel for them to receive.
     * 
     * @override
     */
    componentDidMount() {
        this.updateDrawModel(this.props);
        this.setState({isMounted: true});
    }

    /**
     * Updates the LinearDrawingModel to pass to the children if necessary.
     * 
     * @param {object} nextProps - next props that the component will receive
     * @override
     */
    componentWillUpdate(nextProps) {
        if (this.props.model !== nextProps.model || this.props.width !== nextProps.width) {
            this.updateDrawModel(nextProps)
        }
    }

    updateDrawModel(props) {
        let width = props.drawModelWidth || this.svgNode.clientWidth;
        this.drawModel = new LinearDrawingModel(props.model, width, this.svgNode);
    }

    /**
     * Saves the ref to the SVG node and passes it to any interested parents
     * 
     * @param {SVGAnimatedString} node - a SVG DOM node
     */
    handleSvgRef(node) {
        this.svgNode = node;
        if (this.props.svgProps.ref) {
            this.props.svgProps.ref(node);
        }
    }

    /**
     * Gives each component in the input array `svgNode`, `model`, and `drawModel` props.
     * 
     * @param {React.Component[]} children 
     */
    giveChildrenProps(children) {
        let propsToGive = {
            svgNode: this.svgNode,
            drawModel: this.drawModel,
        };
        
        return React.Children.map(children, (child) => {
            if (!child) {
                return null;
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
        let children = null;
        if (this.state.isMounted) {
            children = this.giveChildrenProps(this.props.children);
        }

        let svgProps = { // Defaults
            width: "100%",
            height: "100%",
        }
        Object.assign(svgProps, this.props.svgProps);
        // We override `this.props.svgProps.ref`, but we still pass the ref to interested parents in the `handleSvgRef`.
        svgProps.ref = this.handleSvgRef;

        return (
        <div style={this.props.style}>
            <svg {...svgProps} />
            {children}
        </div>
        );
    }
}

export default SvgContainer;
