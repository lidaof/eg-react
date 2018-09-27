import React from 'react';
import PropTypes from 'prop-types';

import TrackModel from '../../model/TrackModel';
import TreeView from './TreeView';
import withCurrentGenome from '../withCurrentGenome';

/**
 * 
 * @param {Object} schemaNode - object from  
 * @param {string} nodeLabel - what to 
 */
function convertAnnotationJsonSchema(schemaNode, nodeLabel) {
    if (!schemaNode) {
        return {
            isExpanded: false,
            label: nodeLabel,
            children: []
        };
    }

    const isLeaf = schemaNode.hasOwnProperty("name");
    if (isLeaf) {
        // TreeView will pass this object to our custom leaf renderer.
        return new TrackModel(schemaNode); 
    }

    let children = [];
    for (let propName of Object.getOwnPropertyNames(schemaNode)) {
        let propValue = schemaNode[propName];
        if (typeof propValue === "object") {
            children.push(convertAnnotationJsonSchema(propValue, propName))
        }
    }
    return {
        isExpanded: false,
        label: nodeLabel,
        children: children,
    };
}

/**
 * GUI for selecting annotation tracks to add.
 * 
 * @author Silas Hsu
 */
class AnnotationTrackSelector extends React.Component {
    static propTypes = {
        genomeConfig: PropTypes.object.isRequired,
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        onTracksAdded: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
    }

    static defaultProps = {
        onTracksAdded: () => undefined
    }

    constructor(props) {
        super(props);
        const {genome, annotationTracks} = props.genomeConfig;
        this.data = convertAnnotationJsonSchema(annotationTracks, genome.getName());
        this.nodeToggled = this.nodeToggled.bind(this);
        this.renderLeaf = this.renderLeaf.bind(this);
        this.addLeafTrack = this.addLeafTrack.bind(this);
    }

    nodeToggled(node) {
        node.isExpanded = !node.isExpanded;
        this.setState({});
    }

    addLeafTrack(trackModel) {
        this.props.onTracksAdded(trackModel);
    }

    renderLeaf(trackModel) {
        if (this.props.addedTrackSets.has(trackModel.name) || this.props.addedTrackSets.has(trackModel.url)) {
            return <div>{trackModel.label} (Added)</div>;
        }
        
        return <div>{trackModel.label} <button onClick={() => this.addLeafTrack(trackModel) } 
                                            className="btn btn-sm btn-success dense-button">Add</button></div>;
    }

    render() {
        return <TreeView data={this.data} onNodeToggled={this.nodeToggled} leafRenderer={this.renderLeaf} />;
    }
}

export default withCurrentGenome(AnnotationTrackSelector);
