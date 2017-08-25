import React from 'react';
import SVG from 'svg.js';
import _ from 'lodash';

class SingleSvgRender extends React.Component {
    constructor(props) {
        super(props);
        this.id = _.uniqueId();
        this.state = {
            svg: null
        };
    }

    componentDidMount() {
        this.setState({svg: SVG(this.id)})
    }

    render() {
        let childProps = {
            svg: this.state.svg,
        }
        Object.assign(childProps, this.props.childProps);
        return (
        <div>
            <div id={this.id}></div>
            { this.state.svg && React.createElement(this.props.childClass, childProps, null) }
        </div>
        );
    }
}

export default SingleSvgRender;
