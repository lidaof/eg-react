import React from 'react';
import PropTypes from 'prop-types';
import getComponentName from '../../../getComponentName';

/**
 * A function that enhances the input component's class so it will automatically get callbacks for showing and hiding
 * tooltips (or more generally, a sibling component).  It is not difficult to render tooltips as a child element, but
 * that requires state.  This function takes care of that annoying boilerplate.
 * 
 * Consumed props: none
 * 
 * Injected props:
 *  - {function} `onShowTooltip`: callback, signature (tooltip: JSX.Element): void.  Call this with an element to render
 * it as a sibling.
 *  - {function} `onHideTooltip`: callback, signature (void): void.  Call this to stop showing the element from the
 * previous call to `onShowTooltip`.
 *  
 * @param {typeof React.Component} WrappedComponent - component class to enhance with tooltip callbacks
 * @return {typeof React.Component} component class that automatically receives tooltip callbacks
 * @author Silas Hsu
 */
function withTooltip(WrappedComponent) {
    return class extends React.Component {
        static displayName = `withTooltip(${getComponentName(WrappedComponent)})`;

        constructor(props) {
            super(props);
            this.state = {
                tooltip: null
            };
            this.showTooltip = this.showTooltip.bind(this);
            this.hideTooltip = this.hideTooltip.bind(this);
        }

        showTooltip(tooltip) {
            this.setState({tooltip: tooltip});
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
withTooltip.INJECTED_PROPS = {
    onShowTooltip: PropTypes.func,
    onHideTooltip: PropTypes.func
};

export default withTooltip;
