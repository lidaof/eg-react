import DisplayedRegionModel from '../model/DisplayedRegionModel';
import LinearDrawingModel from '../model/LinearDrawingModel';
import PropTypes from 'prop-types';
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

        this.handleSvgRef = this.handleSvgRef.bind(this);
    }

    /**
     * @inheritdoc
     */
    componentDidMount() {
        this.setState({svgDidMount: true});
    }

    handleSvgRef(node) {
        this.svgNode = node;
        if (this.props.svgRef) {
            this.props.svgRef(this.svgNode);
        }
    }

    giveChildrenProps(children) {
        let propsToGive = {
            svgNode: this.svgNode,
            model: this.props.model,
            drawModel: new LinearDrawingModel(this.props.model, this.svgNode),
        };
        
        return React.Children.map(children, (child) => {
            if (!child) {
                return null;
            }
            return React.cloneElement(child, propsToGive);
        });
    }

    render() {
        let children = null;
        if (this.state.svgDidMount) {
            children = this.giveChildrenProps(this.props.children);
        }
    
        return (
        <div>
            <svg
                style={this.props.svgStyle}
                width="100%"
                height="100%"
                id={this.svgId}
                ref={this.handleSvgRef}
                onWheel={this.props.onWheel}
                onContextMenu={this.props.onContextMenu}
            ></svg>
            {children}
        </div>
        );
    }
}

export default SvgContainer;

SvgContainer.propTypes = {
    model: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    svgRef: PropTypes.func,
    svgStyle: PropTypes.object,
    onContextMenu: PropTypes.func,
    onWheel: PropTypes.func,
}
