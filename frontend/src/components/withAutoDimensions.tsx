import React from 'react';
import getComponentName from './getComponentName';

interface MeasurerState {
    isMounted: boolean;
    width: number;
    height: number;
}

interface Measurements {
    containerWidth: number;
    containerHeight: number;
}

/**
 * A function that enhances the input component's class so it measures its width and height automatically.
 * 
 * Consumed props: none
 * 
 * Injected props:
 *   - {number} `containerWidth` - measured width
 *   - {number} `containerHeight` - measured height
 * 
 * @param {typeof React.Component} WrappedComponent - React Component class to enhance
 * @return {typeof React.Component} component class that measures its width and height automatically
 * @author Silas Hsu
 */
function withAutoDimensions(WrappedComponent: React.ComponentType<Measurements>) {
    return class extends React.Component<{}, MeasurerState> {
        static displayName = `WithAutoDimensions(${getComponentName(WrappedComponent)})`;

        private _node: Element;

        /**
         * Initializes state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props: {}) {
            super(props);
            this.state = {
                isMounted: false,
                width: 0,
                height: 0,
            };
            this._node = null;
        }

        /**
         * Measures width.
         */
        componentDidMount() {
            this.setState({isMounted: true, width: this._node.clientWidth, height: this._node.clientHeight});
        }

        /**
         * @inheritdoc
         */
        render() {
            const {isMounted, width, height} = this.state;
            return (
            <div ref={node => this._node = node}>
                {isMounted && <WrappedComponent containerWidth={width} containerHeight={height} {...this.props} />}
            </div>
            );
        }
    }
}

export default withAutoDimensions;
