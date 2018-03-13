import React from 'react';
import getComponentName from './getComponentName';

/**
 * A function that returns a component that measures its width and height automatically.  The wrapped component will
 * recieve the values as props.  Note that the parent can override these values.
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @return {React.Component} component that measures its width automatically
 * @author Silas Hsu
 */
function withAutoDimensions(WrappedComponent) {
    return class extends React.Component {
        static displayName = `WithAutoDimensions(${getComponentName(WrappedComponent)})`;

        /**
         * Initializes state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props) {
            super(props);
            this.state = {
                isMounted: false,
                width: 0,
                height: 0,
            };
            this.node = null;
        }

        /**
         * Measures width.
         */
        componentDidMount() {
            this.setState({isMounted: true, width: this.node.offsetWidth, height: this.node.offsetHeight});
        }

        /**
         * @inheritdoc
         */
        render() {
            return (
            <div ref={node => this.node = node}>
                {
                this.state.isMounted ?
                    <WrappedComponent width={this.state.width} height={this.state.height} {...this.props} />
                    :
                    null
                }
            </div>
            );
        }
    }
}

export default withAutoDimensions;
