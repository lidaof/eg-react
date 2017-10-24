import React from 'react';

import annotationTracks from './AnnotationTracks';
import TrackModel from '../../model/TrackModel';
import TreeView from './TreeView';

function convertOldBrowserSchema(schemaNode, nodeLabel) {
    const isLeaf = schemaNode.hasOwnProperty("name");
    if (isLeaf) {
        // Doesn't necessarily need to fulfill the TreeViewData interface, since we have a custom renderer
        return new TrackModel(schemaNode); 
    }

    let children = [];
    for (let propName of Object.getOwnPropertyNames(schemaNode)) {
        let propValue = schemaNode[propName];
        if (typeof propValue === "object") {
            children.push(convertOldBrowserSchema(schemaNode[propName], propName))
        }
    }
    return {
        isExpanded: false,
        label: nodeLabel,
        children: children,
    };
}

class AnnotationTrackSelector extends React.Component {
    constructor(props) {
        super(props);
        this.data = convertOldBrowserSchema(annotationTracks, "hg19");
        this.nodeToggled = this.nodeToggled.bind(this);
        this.renderLeaf = this.renderLeaf.bind(this);
    }

    nodeToggled(node) {
        node.isExpanded = !node.isExpanded;
        this.setState({});
    }

    renderLeaf(trackModel) {
        return <div>{trackModel.label} <button>+</button></div>;
    }

    render() {
        return (
        <TreeView data={[this.data]} onNodeToggled={this.nodeToggled} leafRenderer={this.renderLeaf} />
        );
    }
}

export default AnnotationTrackSelector;
