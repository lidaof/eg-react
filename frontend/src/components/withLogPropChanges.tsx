import React from 'react';

/**
 * *Used for debugging only.*
 * 
 * A function that enhances the input component's class so it logs prop changes.  Useful for finding out why a
 * React.PureComponent is rerendering.
 * 
 * Consumed props: none
 * 
 * Injected props: none
 *
 * @param {React.ComponentType} WrappedComponent - component class to enhance with prop change logging
 * @return {React.ComponentType} component that logs prop changes
 * @author Silas Hsu
 */
export function withLogPropChanges<P>(WrappedComponent: React.ComponentType<P>): React.ComponentType<P> {
    return class extends React.Component<P> {
        shouldComponentUpdate(nextProps: P) {
            for (const propName in nextProps) {
                if (this.props[propName] !== nextProps[propName]) {
                    console.log(propName);
                }
            }
            return true;
        }

        render() {
            return <WrappedComponent {...this.props} />
        }
    }
}
