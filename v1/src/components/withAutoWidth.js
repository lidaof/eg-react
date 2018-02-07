import React from 'react';

/**
 * A function that returns a component that measures its width automatically.  The wrapped component will recieve this
 * width in the `width` property.
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 */
function withAutoWidth(WrappedComponent) {
    const displayName = typeof WrappedComponent === "string" ?
        WrappedComponent : WrappedComponent.displayName || WrappedComponent.name || 'Component';
    return class extends React.Component {
        static displayName = `WithAutoWidth(${displayName})`

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
            };
            this.divNode = null;
        }

        /**
         * Measures width.
         */
        componentDidMount() {
            this.setState({isMounted: true, width: this.divNode.offsetWidth});
        }

        /**
         * @inheritdoc
         */
        render() {
            return (
            <div ref={node => this.divNode = node}>
                {this.state.isMounted ? <WrappedComponent width={this.state.width} {...this.props} /> : null}
            </div>
            );
        }
    }
}

export default withAutoWidth;
