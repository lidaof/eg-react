import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';

/**
 * A React component that contains a <svg> element.  This component's children will automatically recieve a ref to the
 * SVG node, a DisplayedRegionModel, and a LinearDrawingModel once the component mounts.  Note that the children will
 * be mounted as siblings to the SVG node, and not children to the SVG node.  For specifying direct children of the SVG,
 * a different component would be more appropriate.
 * 
 * @see SvgComponent
 * @author Silas Hsu
 */
class SvgContainer extends React.Component {
    static propTypes = {
        /**
         * The current region in which to draw; will be passed to child elements.
         */
        model: PropTypes.instanceOf(DisplayedRegionModel).isRequired,

        /**
         * Function for getting a reference to the native SVG element.  Has the signature
         *     (svgNode: SVGAnimatedString): void
         *         `svgNode` - the native SVG node mounted in the DOM
         */
        svgRef: PropTypes.func,

        svgStyle: PropTypes.object, // Inline CSS to pass to the SVG node
        onContextMenu: PropTypes.func, // Called when a right click happens in the SVG to open the context menu
        onWheel: PropTypes.func, // Called when the mouse wheel is scrolled over the SVG
        viewBoxX: PropTypes.number, // X pixels to translate the SVG's viewBox
        viewBoxY: PropTypes.number, // Y pixels to translate the SVG's viewBox
    }

    static defaultProps = {
        viewBoxX: 0,
        viewBoxY: 0
    }

    constructor(props) {
        super(props);
        this.state = {
            svgDidMount: false,
        }
        this.svgNode = null;
        this.svgId = _.uniqueId();
        this.svgWidth = 0;
        this.svgHeight = 0;
        this.drawModel = null;

        this.handleSvgRef = this.handleSvgRef.bind(this);
    }

    /**
     * Sets state so we can mount our children, and creates a new LinearDrawingModel for them to receive.
     * 
     * @override
     */
    componentDidMount() {
        this.setState({svgDidMount: true});
        this.svgWidth = this.svgNode.clientWidth;
        this.svgHeight = this.svgNode.clientHeight;
        this.drawModel = new LinearDrawingModel(this.props.model, this.svgWidth, this.svgNode);
    }

    /**
     * Updates the LinearDrawingModel to pass to the children if necessary.
     * 
     * @param {object} nextProps - next props that the component will receive
     * @override
     */
    componentWillUpdate(nextProps) {
        if (this.props.model !== nextProps.model) {
            this.drawModel = new LinearDrawingModel(nextProps.model, this.svgWidth, this.svgNode);
        }
    }

    /**
     * Saves the ref to the SVG node and passes it to any interested parents
     * 
     * @param {SVGAnimatedString} node - a SVG DOM node
     */
    handleSvgRef(node) {
        this.svgNode = node;
        if (this.props.svgRef) {
            this.props.svgRef(this.svgNode);
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
            model: this.props.model,
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
        if (this.state.svgDidMount) {
            children = this.giveChildrenProps(this.props.children);
        }

        let isTranslate = this.props.viewBoxX !== 0 || this.props.viewBoxY !== 0;
        let viewBoxString = isTranslate ?
            `${this.props.viewBoxX} ${this.props.viewBoxY} ${this.svgWidth} ${this.svgHeight}` : null;
        return (
        <div>
            <svg
                style={this.props.svgStyle}
                viewBox={viewBoxString}
                width="100%"
                height="100%"
                id={this.svgId}
                ref={this.handleSvgRef}
                onWheel={this.props.onWheel}
                onContextMenu={this.props.onContextMenu}
            ></svg>
            {children}
        </div>
        );
    }
}

export default SvgContainer;
