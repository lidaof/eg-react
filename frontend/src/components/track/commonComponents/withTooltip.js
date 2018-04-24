import React from 'react';

function withTooltip(WrappedComponent) {
    return class extends React.Component {
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

        hideTooltip(tooltip) {
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

export default withTooltip;
