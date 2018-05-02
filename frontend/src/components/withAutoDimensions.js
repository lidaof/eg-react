import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from './getComponentName';

/**
 * A function that enhances the input component's class so it measures its width and height automatically.
 * 
 * Consumed props: none
 * 
 * Injected props:
 *   - {number} `width` - measured width
 *   - {number} `height` - measured height
 * 
 * @param {typeof React.Component} WrappedComponent - React Component class to enhance
 * @return {typeof React.Component} component class that measures its width and height automatically
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

withAutoDimensions.INJECTED_PROPS = {
    width: PropTypes.number,
    height: PropTypes.number,
};

export default withAutoDimensions;
