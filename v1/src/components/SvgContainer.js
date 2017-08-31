import React from 'react';
import _ from 'lodash';

class SvgContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            svgDidMount: false,
        }
        this.svgNode = null;
        this.svgId = _.uniqueId();
    }

    /**
     * Calls SVG.js, constructing a new SVG DOM element, and sets state accordingly.
     * @override
     */
    componentDidMount() {
        this.setState({svgDidMount: true})
    }

    render() {
        let children = null;
        if (this.state.svgDidMount) {
            children = React.Children.map(this.props.children, (child) => {
                return React.cloneElement(child, {
                    // Props to merge
                    svgNode: this.svgNode
                });
            });
        }
    
        return (
        <div>
            <svg
                width="100%"
                height="100%"
                id={this.svgId}
                ref={(node) => this.svgNode = node}
                style={{border: "1px solid black"}}
            ></svg>
            {children}
        </div>
        );
    }
}

export default SvgContainer;

// Props: add onDragStart, onDrag, onDragEnd
