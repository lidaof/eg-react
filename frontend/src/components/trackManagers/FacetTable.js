import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ReactModal from 'react-modal';

import HubTrackTable from './HubTrackTable';
import TrackModel from '../../model/TrackModel';

import './FacetTable.css';

const DEFAULT_ROW = 'Sample';
const DEFAULT_COLUMN = 'Assay';
const UNUSED_META_KEY = 'notused';

/**
 * component for display facet table for a data hub
 * @author Daofeng Li
 */

class FacetTable extends Component {

    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        onTrackAdded: PropTypes.func,
    }

    static defaultProps = {
        tracks: [],
        addedTracks: [],
    }

    constructor(props) {
        super(props);
        this.state = {
            tracks: [],
            rowList: [], // object contains row elements {name: 'Sample', expanded: false, children: []}
            columnList: [],
            parent2children: {},
            child2ancestor: {}, // child to top most parent hash
            rowHeader: DEFAULT_ROW,
            columnHeader: DEFAULT_COLUMN,
            showModalId: null,
            metaKeys: [],
        };

        this.toggleHeader = this.toggleHeader.bind(this);
        this.swapHeader = this.swapHeader.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleRowChange = this.handleRowChange.bind(this);
        this.handleColumnChange = this.handleColumnChange.bind(this);
    }

    componentDidMount() {
        const allTracks = this.props.tracks;
        const allKeys = allTracks.map(track => Object.keys(track.metadata));
        const metaKeys = _.union(...allKeys);
        let tracks = []; // fix dup metadata
        let rawtracks = []; //add raw metadata after dup remove, add is
        const parent2children = {}; // key: parent terms, value: set of [child terms]
        const child2ancestor = {};
        for (let meta of metaKeys) {
            parent2children[meta] = new Set();
            child2ancestor[meta] = meta; // add 'sample': sample as well
        }
        for (let track of allTracks) {
            let metadata = {};
            for (let [metaKey, metaValue] of Object.entries(track.metadata)) {
                if (Array.isArray(metaValue)) {
                    metaValue = _.uniq(metaValue);
                    // array metadata, also need check length
                    if (metaValue.length > 1) {
                        // need loop over the array, constuct new key in parent2children hash
                        for (let [idx, ele] of metaValue.entries()) {
                            if (idx < metaValue.length - 1) {
                                if (!parent2children[ele]) {
                                    parent2children[ele] = new Set();
                                }
                                parent2children[ele].add(metaValue[idx + 1]);
                                child2ancestor[ele] = metaKey;
                            }
                        }
                    }
                    parent2children[metaKey].add(metaValue[0]);
                    child2ancestor[metaValue[0]] = metaKey;
                } else {
                    // string metadata
                    parent2children[metaKey].add(metaValue);
                    child2ancestor[metaValue] = metaKey;
                }
                metadata[metaKey] = metaValue;
            }
            let newTrack = {...track, metadata: metadata};
            rawtracks.push(newTrack);
        }
        //console.log(rawtracks);
        //if metadata has dup, say liver > right liver, liver, liver > left liver, a new item (liver) will be generated
        // liver
        //    (liver)
        //    right liver
        //    left liver
        for (let track of rawtracks) {
            let metadata = {};
            for (let [metaKey, metaValue] of Object.entries(track.metadata)) {
                let lastValue, newValue;
                if (Array.isArray(metaValue)) {
                    // array metadata
                    lastValue = metaValue[metaValue.length - 1]
                } else {
                    // string metadata
                    lastValue = metaValue;
                }
                if ( _.has(parent2children, lastValue) ){
                    if (Array.isArray(metaValue)) {
                        newValue = [...metaValue, `(${lastValue})`];
                    } else {
                        newValue = [...[metaValue], `(${lastValue})`];
                    }
                    if (!parent2children[lastValue]) {
                        parent2children[lastValue] = new Set();
                    }
                    parent2children[lastValue].add(`(${lastValue})`);
                    metadata[metaKey] = newValue;
                } else {
                    metadata[metaKey] = metaValue;
                }
            }
            let newTrack = {...track, metadata: metadata};
            tracks.push( new TrackModel(newTrack) );
        }
        //console.log(tracks);
        this.setState({
            rowList: [{
                name: this.state.rowHeader, expanded: false, children: parent2children[this.state.rowHeader]
            }],
            columnList: [{
                name: this.state.columnHeader, expanded: false, children: parent2children[this.state.columnHeader]
            }],
            tracks,
            parent2children,
            child2ancestor,
            metaKeys,
            rowHeader: metaKeys.includes(DEFAULT_ROW) ? DEFAULT_ROW : metaKeys[1],
            columnHeader: metaKeys.includes(DEFAULT_COLUMN) ? DEFAULT_COLUMN : metaKeys[2],
        });
    }

    handleOpenModal (id) {
        this.setState({ showModalId: id });
    }
      
    handleCloseModal () {
        this.setState({ showModalId: null });
    }

    toggleHeader(event) {
        const {name} = event.currentTarget;

        let attrList;
        if (this.state.child2ancestor[name] === this.state.rowHeader) {
            attrList = this.state.rowList;
        } else {
            attrList = this.state.columnList;
        }

        const index = _.findIndex(attrList, ['name', name]);

        const isExpanded = !attrList[index].expanded;
        const newAttr = {...attrList[index], expanded: isExpanded}
        let newList = [...attrList];
        newList[index] = newAttr;
        if (isExpanded){
            for (let item of this.state.parent2children[name]){
                newList.splice(index+1, 0, { name: item, expanded: false, children: this.state.parent2children[item] })
            }
        } else {
            newList = [
                ...newList.slice(0, index+1),
                ...newList.slice(index + 1 + this.state.parent2children[name].size)
            ];
            // remove all child items, recursive
            this.removeChild(newList, name);
        }

        if (this.state.child2ancestor[name] === this.state.rowHeader) {
            this.setState({rowList: newList});
        } else {
            this.setState({columnList: newList});
        }
        this.setColNumber();
    }

    removeChild(list, parentName){
        if (this.state.parent2children[parentName]) {
            for (let item of this.state.parent2children[parentName]) {
                _.remove(list, n => n.name === item);
                this.removeChild(list, item);
            }
        }
        return list;
    }

    renderHeader(attr) {
        let attrList, rowClass, colClass, expandClass;
        if (attr === this.state.rowHeader) {
            attrList = this.state.rowList;
            rowClass = 'facet-row-header';
        } else {
            attrList = this.state.columnList;
            colClass = 'facet-column-header';
        }

        let divList = [];
        for (let [idx, element] of attrList.entries()) {
            let prefix = '';
            if (element.children && element.children.size) {
                prefix = element.expanded ? '⊟' : '⊞';
                expandClass = element.expanded ? 'expanded' : '';
                divList.push(
                    <div key={`${element.name}-${idx}`} className={`${rowClass} ${colClass}`}>
                        <button name={element.name} type="button" onClick={this.toggleHeader} className={expandClass}>
                            <span>
                                {prefix}{element.name}
                            </span>
                        </button>
                    </div>
                );
            } else {
                divList.push(
                    <div key={`${element.name}-${idx}`} className={`${rowClass} ${colClass}`}>
                        <button name={element.name} className="not-button">
                            <span>
                                {prefix}{element.name}
                            </span>
                        </button>    
                    </div> 
                );
            }
        }

        return divList;
    }

    /**
     * swap the column and row
     */
    swapHeader() {
        let {rowHeader, columnHeader, rowList, columnList} = this.state;
        if (columnHeader === UNUSED_META_KEY) {
            return;
        }
        [rowHeader, columnHeader] = [columnHeader, rowHeader];
        [rowList, columnList] = [columnList, rowList];
        this.setState({rowHeader, columnHeader, rowList, columnList});
        this.buildMatrix();
        this.setColNumber();
    }

    /**
     * build the matrix, actually list of divs, use grid to control layout
     */
    buildMatrix() {
        const {columnHeader, rowList, columnList} = this.state;
        let divs = [];
        if (columnHeader !== UNUSED_META_KEY) {
            for (let row of rowList) {
                for (let col of columnList) {
                    if (row.expanded || col.expanded) {
                        divs.push( <div key={`${row.name}-${col.name}`}></div> );
                    } else {
                        divs.push(<div key={`${row.name}-${col.name}`}>{this.countTracks(row, col)}</div> );
                    }
                }
            }
        } else {
            for (let row of rowList) {
                if (row.expanded) {
                    divs.push( <div key={`${row.name}-col}`}></div> );
                } else {
                    divs.push(<div key={`${row.name}-col`}>{this.countTracks(row, UNUSED_META_KEY)}</div> );
                }
            }
        }
        return divs;
    }

    /**
     * 
     * @param {onject} row 
     * @param {object} col 
     * @return {ReactModal} how many tracks belong to the row and col combination, and popup the track list
     */
    countTracks(row, col) {
        const {tracks, rowHeader, columnHeader, showModalId} = this.state;
        let found = [];
        for (let track of tracks){
            // console.log(rowHeader);
            // console.log(track.metadata);
            if (!track.metadata[rowHeader]) {
                continue;
            }
            if (row.name === rowHeader || track.metadata[rowHeader].includes(row.name)) {
                // confusing code here, need to check if column was used
                if (col === UNUSED_META_KEY) {
                    found.push(track);
                } else if ( col.name === columnHeader || track.metadata[columnHeader].includes(col.name) ) {
                    found.push(track);
                }
            }
        }
        if (!found.length) {
            return;
        }
        const id = `modal-${row.name}-${col.name}`;
        return (
        <div>
            <button onClick={()=>this.handleOpenModal(id)} className="facet-item"> 0/{found.length} </button>
            <ReactModal
               isOpen={showModalId === id}
               contentLabel="track list"
               ariaHideApp={false}
               id={id}
               style={{overlay: {zIndex: 3}}}
            >
                <button onClick={this.handleCloseModal}>Close</button>
                {/* <div>
                    <ul>
                        {found.map(track => <li key={track.id}>{track.name}</li>)}
                    </ul>
                </div> */}
                <HubTrackTable
                    tracks={found}
                    addedTracks={this.props.addedTracks}
                    onTrackAdded={track => this.props.onTracksAdded([track])}
                />
            </ReactModal>
        </div>
        );
    }

    setColNumber() {
        let colNum = Math.max(1, this.state.columnList.length);
        document.documentElement.style.setProperty('--colNum', colNum + 1);
    }

    renderHeaderSelection(isColumn) {
        let stateToRead, otherState, changeCallback;
        if (isColumn) {
            stateToRead = this.state.columnHeader;
            otherState = this.state.rowHeader;
            changeCallback = this.handleColumnChange;
        } else {
            stateToRead = this.state.rowHeader;
            otherState = this.state.columnHeader;
            changeCallback = this.handleRowChange;
        }

        return (
        <label>
            {isColumn ?  'Column:' : 'Row:'}
            <select value={stateToRead} onChange={changeCallback} >
                {this.state.metaKeys
                    .filter(metaKey => metaKey !== otherState)
                    .map(metaKey => <option key={metaKey} value={metaKey}>{metaKey}</option>)
                }
                {isColumn &&
                    <React.Fragment>
                        <option key="disabled" disabled>────</option>
                        <option key={UNUSED_META_KEY} value={UNUSED_META_KEY}>Not used</option>
                    </React.Fragment>
                }
            </select>
        </label>
        );
    }

    handleRowChange(event) {
        const selectedMetaKey = event.currentTarget.value;
        this.setState({
            rowHeader: selectedMetaKey,
            rowList: [{
                name: selectedMetaKey,
                expanded: false,
                children: this.state.parent2children[selectedMetaKey]
            }]
        });
    }

    handleColumnChange(event) {
        const selectedMetaKey = event.currentTarget.value;
        if (selectedMetaKey === UNUSED_META_KEY) {
            this.setState({
                columnHeader: UNUSED_META_KEY,
                columnList: [{name: '--'}]
            });
        } else {
            this.setState({
                columnHeader: selectedMetaKey,
                columnList: [{
                    name: selectedMetaKey,
                    expanded: false,
                    children: this.state.parent2children[selectedMetaKey]
                }]
            });
        }
    }

    render() {
        const { tracks } = this.state;
        if (!tracks.length) {
            return <p>Loading</p>;
        } else {
            //fill in rowList and columnList
            return (
                <div className="facet-container">
                    <div className="facet-config">
                        <div>{this.renderHeaderSelection(false)}</div>
                        <div className="facet-swap" title="swap row/column" onClick={this.swapHeader}>&#8646;</div>
                        <div>{this.renderHeaderSelection(true)}</div>   
                    </div>
                    <div className="facet-outer">
                        <div className="facet-content">
                            <div className="facet-holder"></div>
                            {this.renderHeader(this.state.columnHeader)}
                            {this.renderHeader(this.state.rowHeader)}
                            {this.buildMatrix()}
                            {this.setColNumber()}
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default FacetTable;
