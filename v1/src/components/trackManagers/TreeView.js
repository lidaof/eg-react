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
        return <span style={{marginRight: 5}}>▾</span>;
    } else {
        return <span style={{display: "inline-block", transform: "rotate(-90deg)", marginRight: 5}} >▾</span>;
    }
}

function nodeHasChildren(dataObj) {
    return dataObj.children && dataObj.children.length > 0;
}

/**
 * A tree view (outline view) of data.  Nodes are collapsible, and customizable via props.
 * 
 * @author Silas Hsu
 */
class TreeView extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.object.isRequired),
        onNodeToggled: PropTypes.func,
        indent: PropTypes.number,
        childIndent: PropTypes.number,
        leafRenderer: PropTypes.func,
    }

    static defaultProps = {
        indent: 0,
        childIndent: 10,
    }

    constructor(props) {
        super(props);
        this.renderLeaf = this.renderLeaf.bind(this);
        this.renderNonLeaf = this.renderNonLeaf.bind(this);
    }

    renderLeaf(dataObj) {
        return (
            <div style={{marginLeft: this.props.indent || 0}} >
                {this.props.leafRenderer ? this.props.leafRenderer(dataObj) : dataObj.label}
            </div>
        );
    }

    renderNonLeaf(dataObj) {
        const nextIndent = this.props.indent + this.props.childIndent;
        const onClick = this.props.onNodeToggled ? () => this.props.onNodeToggled(dataObj) : undefined;
        return (
            <div onClick={onClick} style={{marginLeft: this.props.indent || 0}} >
                <DefaultExpandButton isExpanded={dataObj.isExpanded} />
                {dataObj.label}
                {
                dataObj.isExpanded ?
                    <TreeView
                        data={dataObj.children}
                        onNodeToggled={this.props.onNodeToggled}
                        indent={nextIndent}
                        childIndent={this.props.childIndent}
                        leafRenderer={this.props.leafRenderer}
                    />
                    :
                    null
                }
            </div>
        );
    }

    render() {
        return (
        <div style={{marginLeft: this.props.indent}}>
        {
            this.props.data.map((obj, index) => (
                <div key={index}>
                    { nodeHasChildren(obj) ? this.renderNonLeaf(obj) : this.renderLeaf(obj) }
                </div>
            ))
        }
        </div>
        )
    }
}

export default TreeView;
