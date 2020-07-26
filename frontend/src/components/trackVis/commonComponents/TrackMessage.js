import React from "react";
import PropTypes from "prop-types";
import "./Track.css";

/**
 * A message in a <p> that says "x items too small - zoom in to view".
 *
 * @param {Object} props - props as specified by React
 * @return {JSX.Element} - message to render
 * @author Silas Hsu
 */
export function HiddenItemsMessage(props) {
    if (!props.numHidden) {
        return null;
    }

    const itemOrItems = props.numHidden === 1 ? "item" : "items";
    const message = `${props.numHidden} ${itemOrItems} too small - zoom in to view.`;
    return <TrackMessage message={message} />;
}

HiddenItemsMessage.propTypes = {
    numHidden: PropTypes.number.isRequired,
};

export function HiddenImagesMessage(props) {
    if (!props.numHidden) {
        return null;
    }
    if (props.numHidden === 0) {
        return null;
    }
    const itemOrItems = props.numHidden === 1 ? "image is " : "images are";
    const message = `${props.numHidden} ${itemOrItems} hidden.`;
    return <TrackMessage message={message} />;
}

HiddenImagesMessage.propTypes = {
    numHidden: PropTypes.number.isRequired,
};

export class TrackMessage extends React.PureComponent {
    static propTypes = {
        message: PropTypes.string,
        style: PropTypes.object,
    };

    constructor(props) {
        super(props);
        this.state = {
            isShowing: true,
        };
    }

    /**
     * Re-shows the message every time it changes.
     */
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.message !== nextProps.message) {
            this.setState({ isShowing: true });
        }
    }

    render() {
        const { message, style } = this.props;
        if (!message || !this.state.isShowing) {
            return null;
        }
        return (
            <div className="Track-message" style={style}>
                <span style={{ marginRight: 5 }}> {message}</span>
                <span className="btn btn-link Track-message" onClick={() => this.setState({ isShowing: false })}>
                    (Dismiss)
                </span>
            </div>
        );
    }
}

export default TrackMessage;
