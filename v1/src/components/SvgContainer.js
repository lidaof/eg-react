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
        this.svgWidth = 0;
        this.svgHeight = 0;
        this.drawModel = null;

        this.handleSvgRef = this.handleSvgRef.bind(this);
    }

    /**
     * @inheritdoc
     */
    componentDidMount() {
        this.setState({svgDidMount: true});
        this.svgWidth = this.svgNode.clientWidth;
        this.svgHeight = this.svgNode.clientHeight;
        this.drawModel = new LinearDrawingModel(this.props.model, this.svgNode);
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.props.model !== nextProps.model) {
            this.drawModel = new LinearDrawingModel(nextProps.model, this.svgNode);
        }
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
            drawModel: this.drawModel,
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

        let isTranslate = this.props.viewBoxX !== 0 || this.props.viewBoxY !== 0;
        let viewBoxString = isTranslate ?
            `${this.props.viewBoxX} ${this.props.viewBoxY} ${this.svgWidth} ${this.svgHeight}` : null;
        return (
        <div>
            <svg
                style={this.props.svgStyle}
                viewBox={viewBoxString}
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

SvgContainer.defaultProps = {
    viewBoxX: 0,
    viewBoxY: 0
}

SvgContainer.propTypes = {
    model: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    svgRef: PropTypes.func,
    svgStyle: PropTypes.object,
    onContextMenu: PropTypes.func,
    onWheel: PropTypes.func,
    viewBoxX: PropTypes.number,
    viewBoxY: PropTypes.number,
}
