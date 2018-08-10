import React from 'react';
import { connect } from "react-redux";

import App from "../App";

class LoadSession extends React.Component {
    render() {
        const {params} = this.props.match;
        if (!params || !params.match) {
            return <div>Please specify a session Id. <a href="/">Go Home</a></div>;
        }
        return <div>aaa!</div>
    }
}

const mapStateToProps = (state) => {
    return {state: state};
}

export default connect(mapStateToProps)(LoadSession);