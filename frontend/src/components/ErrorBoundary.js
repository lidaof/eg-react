import React from 'react';
import PropTypes from 'prop-types';

// eslint-disable-next-line jsx-a11y/accessible-emoji
const DEFAULT_ERROR_ELEMENT = <div style={{backgroundColor: "pink", textAlign: "center"}}>😵 Component crashed 😵</div>;

/**
 * A component that catches errors in child elements, and can display a custom error message.
 * 
 * @author Silas Hsu
 */
class ErrorBoundary extends React.Component {
    static propTypes = {
        getErrorElement: PropTypes.func, // Custom error element to render.  Signature: (error: any): JSX.Element
    };

    static defaultProps = {
        getErrorElement: error => DEFAULT_ERROR_ELEMENT
    };

    constructor(props) {
        super(props);
        this.state = {
            error: null
        };
    }

    componentDidCatch(error, info) {
        this.setState({error: error});
    }

    render() {
        if (this.state.error) {
            return this.props.getErrorElement(this.state.error);
        } else {
            return this.props.children;
        }
    }
}

export default ErrorBoundary;
