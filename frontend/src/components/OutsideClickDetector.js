import React from 'react';
import PropTypes from 'prop-types';

/**
 * A component which detects clicks that happen outside of it.
 * 
 * @author Silas Hsu
 */
class OutsideClickDetector extends React.PureComponent {
    static propTypes = {
        /**
         * Callback for click events that happen outside this element.  Signature: (event: MouseEvent): void
         */
        onOutsideClick: PropTypes.func,

        /**
         * Ref to the inner DOM node.  Signature: (node: Node): void
         */
        innerRef: PropTypes.func
    };

    constructor(props) {
        super(props);
        this.node = null;
        this.handleRef = this.handleRef.bind(this);
        this.detectOutsideClick = this.detectOutsideClick.bind(this);
    }

    /**
     * Registers an event listener so we know when to close this tooltip.
     */
    componentDidMount() {
        document.addEventListener('mousedown', this.detectOutsideClick);
    }

    /**
     * Sets `this.node`, and calls the `innerRef` callback.
     * 
     * @param {Node} node - DOM node
     */
    handleRef(node) {
        this.node = node;
        if (this.props.innerRef) {
            this.props.innerRef(node);
        }
    }

    /**
     * Detects if a mouse event happened outside, and if so, calls the outside click callback.
     * 
     * @param {MouseEvent} event - event to inspect
     */
    detectOutsideClick(event) {
        if (!this.node.contains(event.target) && this.props.onOutsideClick) {
            this.props.onOutsideClick(event)
        }
    }

    /**
     * Deregisters the event listener attached with componentDidMount()
     */
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.detectOutsideClick);
    }

    /**
     * @inheritdoc
     */
    render() {
        const {onOutsideClick, ...otherProps} = this.props;
        return <div style={{position: "relative", zIndex: 0}} {...otherProps} ref={this.handleRef} />
    }
}

export default OutsideClickDetector;
