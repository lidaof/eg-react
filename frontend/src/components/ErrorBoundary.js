import React from "react";
import PropTypes from "prop-types";
import ErrorMessage from "./ErrorMessage";

// eslint-disable-next-line jsx-a11y/accessible-emoji
const DEFAULT_ERROR_ELEMENT = <ErrorMessage>😵 Component crashed 😵</ErrorMessage>;

/**
 * A component that catches errors in child elements, and can display a custom error message.
 *
 * @author Silas Hsu
 */
class ErrorBoundary extends React.Component {
    static propTypes = {
        getFallbackElement: PropTypes.func, // Element to show on error.  Signature: (error: any): JSX.Element
    };

    static defaultProps = {
        getFallbackElement: (error) => DEFAULT_ERROR_ELEMENT,
    };

    constructor(props) {
        super(props);
        this.state = {
            error: null,
        };
    }

    componentDidCatch(error, info) {
        console.error(error);
        this.setState({ error: error });
    }

    render() {
        if (this.state.error) {
            return this.props.getFallbackElement(this.state.error);
        } else {
            return this.props.children;
        }
    }
}

export default ErrorBoundary;
