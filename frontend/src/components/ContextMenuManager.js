import React from 'react';
import PropTypes from 'prop-types';
import { Manager, Target, Popper } from 'react-popper';

import OutsideClickDetector from './OutsideClickDetector';
import ErrorBoundary from './ErrorBoundary';
import { getRelativeCoordinates } from '../util';

/**
 * A component where context menu events trigger a custom context menu element to open.
 * 
 * @author Silas Hsu
 */
class ContextMenuManager extends React.PureComponent {
    static propTypes = {
        menuElement: PropTypes.node.isRequired, // The custom context menu to display

        /**
         * Callback that customizes whether the menu shoud open.  Return false to default to the browser's native
         * context menu.  Signature: (contextMenuEvent: MouseEvent): boolean
         */
        shouldMenuOpen: PropTypes.func,

        /**
         * Callback that customizes whether the menu shoud close.  Return false to keep the menu open, even when the
         * user clicks outside the menu.  Signature: (clickEvent: MouseEvent): boolean
         */
        shouldMenuClose: PropTypes.func,
    };

    static defaultProps = {
        shouldMenuOpen: (event) => true,
        shouldMenuClose: (event) => true
    };

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            menuCoordinates: {}
        };
        this.handleContextMenu = this.handleContextMenu.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
    }

    /**
     * Handles a context menu event happening within this element.
     * 
     * @param {MouseEvent} event - context menu event
     */
    handleContextMenu(event) {
        if (!this.state.isOpen && this.props.shouldMenuOpen(event)) {
            event.preventDefault();
            this.setState({menuCoordinates: getRelativeCoordinates(event), isOpen: true});
        }
    }

    /**
     * Handles a click event outside the menu.  This closes the menu by default, though this behavior can be customized.
     * 
     * @param {MouseEvent} event - click event
     */
    handleOutsideClick(event) {
        if (this.props.shouldMenuClose(event)) {
            this.setState({isOpen: false});
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        const {menuElement, children} = this.props;
        let menuPopper = null;
        if (this.state.isOpen) {
            const {x, y} = this.state.menuCoordinates;
            menuPopper = (
                <Manager>
                    <Target style={{position: "absolute", left: x, top: y}} />
                    <Popper placement="bottom-start" style={{zIndex: 2}}>
                        <OutsideClickDetector onOutsideClick={this.handleOutsideClick} >
                            <ErrorBoundary>{menuElement}</ErrorBoundary>
                        </OutsideClickDetector>
                    </Popper>
                </Manager>
            );
        }

        return (
        <div style={{position: "relative", zIndex: 0}} onContextMenu={this.handleContextMenu} >
            {children}
            {menuPopper}
        </div>
        );
    }
}

export default ContextMenuManager;
