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
        getFallbackElement: PropTypes.func, // Element to show on error.  Signature: (error: any): JSX.Element
        // Other props passed to children
    };

    static defaultProps = {
        getFallbackElement: error => DEFAULT_ERROR_ELEMENT
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
            return this.props.getFallbackElement(this.state.error);
        } else {
            const {getFallbackElement, children, ...otherProps} = this.props;
            return React.Children.map(this.props.children, child => React.cloneElement(child, otherProps));
        }
    }
}

export default ErrorBoundary;
