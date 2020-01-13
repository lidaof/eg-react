import React from 'react';
import _ from 'lodash';
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
 * Injected props: {@link Measurements}
 * 
 * @param {typeof React.Component} WrappedComponent - React Component class to enhance
 * @return {typeof React.Component} component class that measures its width and height automatically
 * @author Silas Hsu
 */
function withAutoDimensions<P extends object>(
        WrappedComponent: React.ComponentType<Measurements>
    ): React.ComponentType<P>
{
    return class extends React.Component<P, MeasurerState> {
        static displayName = `WithAutoDimensions(${getComponentName(WrappedComponent as any)})`;

        private _node: Element;

        /**
         * Initializes state.
         * 
         * @param {Object} props - props as specified by React
         */
        constructor(props: P) {
            super(props);
            this.state = {
                isMounted: false,
                width: 0,
                height: 0,
            };
            this._node = null;
            this.setDimensions = _.debounce(this.setDimensions, 100);
        }

        setDimensions = () => {
            this.setState({isMounted: true, width: this._node.clientWidth, height: this._node.clientHeight});
        }

        /**
         * Measures width.
         */
        componentDidMount() {
            this.setDimensions();
            window.addEventListener("resize", this.setDimensions);
        }

        componentWillUnmount() {
            window.removeEventListener("resize", this.setDimensions);
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
