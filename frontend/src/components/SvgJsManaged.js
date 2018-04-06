import React from 'react';
import SVG from 'svg.js';

/**
 * A <g> element managed by SVG.js.  Children of this component will be passed a reference to the SVG.js Element object
 * that represents the <g>.
 * 
 * @author Silas Hsu
 */
class SvgJsManaged extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isMounted: false
        };
        this.adoptedNode = null;
        this.handleRef = this.handleRef.bind(this);
    }

    componentDidMount() {
        this.setState({isMounted: true});
    }

    handleRef(node) {
        this.adoptedNode = SVG.adopt(node);
    }

    /**
     * Passes a SVG.Element object from SVG.js to the children, if the component has been mounted.
     * 
     * @return {React.Component[]} children to render
     */
    renderChildren() {
        if (!this.state.isMounted) {
            return [null];
        }
        return React.Children.map(this.props.children, (child) => {
            if (!child) {
                return null;
            }
            if (typeof child.type === "string") { // A native DOM element; we shouldn't give extra props to these.
                return child;
            }
            return React.cloneElement(child, {svgJs: this.adoptedNode});
        });
    }

    /**
     * @inheritdoc
     */
    render() {
        const {children, ...props} = this.props;
        return <g ref={this.handleRef} {...props}>{this.renderChildren()}</g>;
    }
}

export default SvgJsManaged;
