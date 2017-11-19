import React from 'react';
import PropTypes from 'prop-types';

/*
interface TreeViewData {
    label: string;
    isExpanded?: boolean;
    children?: TreeViewData[]
}
*/

function DefaultExpandButton(props) {
    if (props.isExpanded) {
        return <span style={{marginRight: 5}} onClick={props.onClick} >▾</span>;
    } else {
        return (
        <span style={{display: "inline-block", transform: "rotate(-90deg)", marginRight: 5}} onClick={props.onClick} >
            ▾
        </span>
        );
    }
}

/**
 * A tree view (outline view) of data.  Nodes are collapsible, and customizable via props.
 * 
 * @author Silas Hsu
 */
class TreeView extends React.Component {
    static propTypes = {
        data: PropTypes.object.isRequired,
        onNodeToggled: PropTypes.func,
        indent: PropTypes.number,
        childIndent: PropTypes.number,
        leafRenderer: PropTypes.func,
    }

    static defaultProps = {
        indent: 0,
        childIndent: 20,
    }

    constructor(props) {
        super(props);
        this.renderLeaf = this.renderLeaf.bind(this);
        this.renderSubtree = this.renderSubtree.bind(this);
    }

    renderLeaf(dataObj) {
        return (
            <div style={{marginLeft: this.props.indent}} >
                {this.props.leafRenderer ? this.props.leafRenderer(dataObj) : dataObj.label}
            </div>
        );
    }

    renderSubtree(childObj, index) {
        return (
            <TreeView
                key={index}
                data={childObj}
                onNodeToggled={this.props.onNodeToggled}
                indent={this.props.childIndent}
                childIndent={this.props.childIndent}
                leafRenderer={this.props.leafRenderer}
            />
        );
    }

    render() {
        if (!this.props.data.children) {
            return this.renderLeaf(this.props.data);
        }
        
        const onClick = this.props.onNodeToggled ? () => this.props.onNodeToggled(this.props.data) : undefined;
        return (
        <div style={{marginLeft: this.props.indent, borderLeft: "1px solid grey"}} >
            <DefaultExpandButton isExpanded={this.props.data.isExpanded} onClick={onClick} />
            <span onClick={onClick}> { this.props.data.label }</span>
            { this.props.data.isExpanded ? this.props.data.children.map(this.renderSubtree) : null }
        </div>
        )
    }
}

export default TreeView;
