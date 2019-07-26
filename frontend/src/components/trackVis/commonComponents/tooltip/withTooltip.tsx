import React from 'react';
import getComponentName from '../../../getComponentName';

/**
 * Props that components can expect from withTooltip.
 */
export interface TooltipCallbacks {
    /**
     * Call this with an element to render it as a sibling.
     * 
     * @param {JSX.Element} tooltipElement - arbitary React element to render
     */
    onShowTooltip(tooltipElement: JSX.Element): void;

    /**
     * Call this to stop showing the element from a previous call to `onShowTooltip`.
     */
    onHideTooltip(): void;
}

/**
 * A function that enhances the input component's class so it will get callbacks for showing and hiding tooltips (or
 * more generally, a sibling component).  It is not difficult to render tooltips as a child element, but that requires
 * state.  This function takes care of that annoying boilerplate.
 * 
 * Consumed props: none
 * 
 * Injected props: {@link InjectedTooltipCallbacks}
 *  
 * @param {React.ComponentType} WrappedComponent - component class to enhance with tooltip callbacks
 * @return {React.ComponentType} component class that automatically receives tooltip callbacks
 * @author Silas Hsu
 */
export function withTooltip<P extends object>(
        WrappedComponent: React.ComponentType<TooltipCallbacks>
    ): React.ComponentType<P>
{
    return class extends React.Component<P, {tooltip: JSX.Element}> {
        static displayName = `withTooltip(${getComponentName(WrappedComponent as any)})`;

        constructor(props: P) {
            super(props);
            this.state = {
                tooltip: null
            };
            this.showTooltip = this.showTooltip.bind(this);
            this.hideTooltip = this.hideTooltip.bind(this);
        }

        showTooltip(tooltip: JSX.Element) {
            this.setState({tooltip});
        }

        hideTooltip() {
            this.setState({tooltip: null});
        }

        render() {
            return (
            <React.Fragment>
                <WrappedComponent onShowTooltip={this.showTooltip} onHideTooltip={this.hideTooltip} {...this.props} />
                {this.state.tooltip}
            </React.Fragment>
            );
        }
    }
}
