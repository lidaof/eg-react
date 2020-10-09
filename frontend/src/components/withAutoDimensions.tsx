import React from "react";
import _ from "lodash";
import getComponentName from "./getComponentName";
import { ResizeObserver as ResizeObserverPolyfill } from "@juggle/resize-observer";

const ResizeObserver = (window as any).ResizeObserver || ResizeObserverPolyfill;

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
 * @author Daofeng Li
 * Silas and Daofeng updated to use ResizeObserver API in Jun 2020
 */
function withAutoDimensions<P extends object>(
    WrappedComponent: React.ComponentType<Measurements>
): React.ComponentType<P> {
    return class extends React.Component<P, MeasurerState> {
        static displayName = `WithAutoDimensions(${getComponentName(WrappedComponent as any)})`;

        private _node: Element;
        private myObserver: any;

        /**
         * Initializes state.
         *
         * @param {Object} props - props as specified by React
         */
        constructor(props: P) {
            super(props);
            this.state = {
                isMounted: false,
                width: 800,
                height: 600,
            };
            this._node = null;
            this.setDimensions = _.debounce(this.setDimensions, 100);

            this.myObserver = new ResizeObserver((entries: any) => {
                entries.forEach((entry: any) => {
                    // console.log(entry.contentRect.width, entry.contentRect.height);
                    const width = Math.max(100, entry.contentRect.width);
                    const height = Math.max(100, entry.contentRect.height);
                    this.setDimensions(width, height);
                });
            });
        }

        setMounted = () => {
            this.setState({ isMounted: true });
        };

        setDimensions = (width: number, height: number) => {
            // this.setState({ isMounted: true, width: this._node.clientWidth, height: this._node.clientHeight });
            // this.setState({ width, height });
            this.setState((prevState) => {
                if (prevState.width !== width || prevState.height !== height) {
                    return { width, height };
                }
                return null;
            });
        };

        /**
         * Measures width.
         */
        componentDidMount() {
            this.setMounted();
            // window.addEventListener("resize", this.setDimensions);
            this.myObserver.observe(this._node);
        }

        componentWillUnmount() {
            // window.removeEventListener("resize", this.setDimensions);
            this.myObserver.disconnect();
        }

        /**
         * @inheritdoc
         */
        render() {
            const { isMounted, width, height } = this.state;
            return (
                <div ref={(node) => (this._node = node)}>
                    {isMounted && <WrappedComponent containerWidth={width} containerHeight={height} {...this.props} />}
                </div>
            );
        }
    };
}

export default withAutoDimensions;
