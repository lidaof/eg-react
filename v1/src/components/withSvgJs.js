import React from 'react';
import PropTypes from 'prop-types';
import SVG from 'svg.js';

/**
 * A function that returns a Component which, given a <svg> ref, manages a <g> via the SVG.js library.  The wrapped
 * component will recieve via props a SVG.Element object (from SVG.js) that represents the <g>.
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @return {React.Component} component that automatically manages a <g> element
 * @author Silas Hsu
 */
function withSvgJs(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withSvgJs(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

        static propTypes = {
            svgNode: process.env.NODE_ENV !== "test" ? PropTypes.instanceOf(SVGElement) : () => undefined,
            x: PropTypes.number,
            y: PropTypes.number,
        };

        static defaultProps = {
            x: 0,
            y: 0,
        }

        /**
         * Creates a new SVG group to draw in.
         */
        constructor(props) {
            super(props);
            let svg = SVG.adopt(props.svgNode);
            this.group = svg.group();
            if (props.x !== 0 || props.y !== 0) {
                this.applyTranslation(props);
            }
        }

        /**
         * Reads `props.x` and `props.y` and translates the SVG group accordingly.
         * 
         * @param {Object} props
         */
        applyTranslation(props) {
            this.group.transform({x: props.x, y: props.y});
        }

        /**
         * Applies translation if it has changed.
         * 
         * @param {any} nextProps - next props that the component will receive
         * @override
         */
        componentWillUpdate(nextProps) {
            if (this.props.x !== nextProps.x || this.props.y !== nextProps.y) {
                this.applyOffset(nextProps);
            }
        }

        /**
         * Removes this component's <group> from the SVG.
         * 
         * @override
         */
        componentWillUnmount() {
            this.group.remove();
        }

        /**
         * @return {React.Component} the wrapped component
         * @override
         */
        render() {
            return <WrappedComponent group={this.group} {...this.props} />;
        }
    }
}

export default withSvgJs;
