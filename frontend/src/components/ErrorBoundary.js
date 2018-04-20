import React from 'react';
import PropTypes from 'prop-types';

const ERROR_STYLE = {
    backgroundColor: "pink",
    textAlign: "center"
};

/**
 * A component that catches errors in child elements, and can display a custom error message.
 * 
 * @author Silas Hsu
 */
class ErrorBoundary extends React.Component {
    static propTypes = {
        errorMessage: PropTypes.string, // Custom error message to display if any children crash
    };

    static defaultProps = {
        errorMessage: "😢 Component crashed 😢"
    };

    constructor(props) {
        super(props);
        this.state = {
            error: false
        };
    }

    componentDidCatch(error, info) {
        this.setState({error: true});
    }

    render() {
        if (this.state.error) {
            return <div style={ERROR_STYLE}>{this.props.errorMessage}</div>;
        } else {
            return this.props.children;
        }
    }
}

export default ErrorBoundary;
