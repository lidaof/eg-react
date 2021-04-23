import React, { Component } from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import ReactModal from "react-modal";
import HubTrackTable from "./HubTrackTable";
import TrackModel from "../../model/TrackModel";
import { variableIsObject } from "../../util";

import "./FacetTable.css";

const DEFAULT_ROW = "Sample";
const DEFAULT_COLUMN = "Assay";
export const UNUSED_META_KEY = "notused";

/**
 * component for display facet table for a data hub
 * @author Daofeng Li
 */

class FacetTable extends Component {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        onTracksAdded: PropTypes.func,
        addTermToMetaSets: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
        genomeName: PropTypes.string,
        publicTrackSets: PropTypes.instanceOf(Set)
    };

    static defaultProps = {
        tracks: [],
        addedTracks: []
    };

    constructor(props) {
        super(props);
        this.state = {
            tracks: [],
            rowList: [], // object contains row elements {name: 'Sample', expanded: false, children: []}
            columnList: [],
            parent2children: {},
            child2ancestor: {}, // child to top most parent hash
            rowHeader: "",
            columnHeader: "",
            showModalId: null,
            metaKeys: ["genome"]
        };

        this.toggleHeader = this.toggleHeader.bind(this);
        this.swapHeader = this.swapHeader.bind(this);
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleRowChange = this.handleRowChange.bind(this);
        this.handleColumnChange = this.handleColumnChange.bind(this);
        this.initializeTracks = this.initializeTracks.bind(this);
    }

    componentDidMount() {
        this.initializeTracks(this.props.tracks);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.tracks !== this.props.tracks) {
            this.initializeTracks(nextProps.tracks);
        }
    }

    initializeTracks(allTracks) {
        const allKeys = allTracks.map(track => Object.keys(track.metadata));
        const metaKeys = _.union(...allKeys);
        this.props.addTermToMetaSets(metaKeys);
        let tracks = []; // fix dup metadata
        let rawtracks = []; //add raw metadata after dup remove, add is
        const parent2children = {}; // key: parent terms, value: set of [child terms]
        const child2ancestor = {};
        for (let meta of metaKeys) {
            parent2children[meta] = new Set();
            child2ancestor[meta] = meta; // add 'sample': sample as well
        }
        for (let track of allTracks) {
            let metadata = {"genome": this.props.genomeName};
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
                    if (variableIsObject(metaValue)) {
                        parent2children[metaKey].add(metaValue.name);
                        child2ancestor[metaValue.name] = metaKey;
                    } else {
                        // string metadata
                        parent2children[metaKey].add(metaValue);
                        child2ancestor[metaValue] = metaKey;
                    }
                }
                metadata[metaKey] = metaValue;
            }
            let newTrack = { ...track, metadata: metadata };
            rawtracks.push(newTrack);
        }
        //console.log(rawtracks);
        //if metadata has dup, say liver > right liver, liver, liver > left liver, a new item (liver) will be generated
        // liver
        //    (liver)
        //    right liver
        //    left liver
        for (let track of rawtracks) {
            let metadata = {"genome": this.props.genomeName};
            for (let [metaKey, metaValue] of Object.entries(track.metadata)) {
                let lastValue, newValue;
                if (Array.isArray(metaValue)) {
                    // array metadata
                    lastValue = metaValue[metaValue.length - 1];
                } else {
                    // string metadata
                    lastValue = metaValue;
                }
                if (_.has(parent2children, lastValue)) {
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
            let newTrack = { ...track, metadata: metadata };
            tracks.push(new TrackModel(newTrack));
        }
        const rowHeader = metaKeys.includes(DEFAULT_ROW) ? DEFAULT_ROW : metaKeys[0];
        let columnHeader =
            metaKeys.includes(DEFAULT_COLUMN) && DEFAULT_COLUMN !== rowHeader ? DEFAULT_COLUMN : metaKeys[1];
        const rowList = [
            {
                name: rowHeader,
                expanded: false,
                children: parent2children[rowHeader]
            }
        ];
        let columnList;
        if (columnHeader) {
            columnList = [
                {
                    name: columnHeader,
                    expanded: false,
                    children: parent2children[columnHeader]
                }
            ];
        } else {
            columnList = [{ name: "--" }];
        }
        this.setState({
            rowList,
            columnList,
            tracks,
            parent2children,
            child2ancestor,
            metaKeys,
            rowHeader,
            columnHeader: columnHeader ? columnHeader : UNUSED_META_KEY
        });
    }

    handleOpenModal(id) {
        this.setState({ showModalId: id });
    }

    handleCloseModal() {
        this.setState({ showModalId: null });
    }

    toggleHeader(event) {
        const { name } = event.currentTarget;

        let attrList;
        if (this.state.child2ancestor[name] === this.state.rowHeader) {
            attrList = this.state.rowList;
        } else {
            attrList = this.state.columnList;
        }

        const index = _.findIndex(attrList, ["name", name]);

        const isExpanded = !attrList[index].expanded;
        const newAttr = { ...attrList[index], expanded: isExpanded };
        let newList = [...attrList];
        newList[index] = newAttr;
        if (isExpanded) {
            for (let item of this.state.parent2children[name]) {
                newList.splice(index + 1, 0, {
                    name: item,
                    expanded: false,
                    children: this.state.parent2children[item]
                });
            }
        } else {
            newList = [
                ...newList.slice(0, index + 1),
                ...newList.slice(index + 1 + this.state.parent2children[name].size)
            ];
            // remove all child items, recursive
            this.removeChild(newList, name);
        }

        if (this.state.child2ancestor[name] === this.state.rowHeader) {
            this.setState({ rowList: newList });
        } else {
            this.setState({ columnList: newList });
        }
        this.setColNumber();
    }

    removeChild(list, parentName) {
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
            rowClass = "facet-row-header";
        } else {
            attrList = this.state.columnList;
            colClass = "facet-column-header";
        }

        let divList = [];
        for (let [idx, element] of attrList.entries()) {
            let prefix = "";
            if (element.children && element.children.size) {
                prefix = element.expanded ? "⊟" : "⊞";
                expandClass = element.expanded ? "expanded" : "";
                divList.push(
                    <div key={`${element.name}-${idx}`} className={`${rowClass} ${colClass}`}>
                        <button name={element.name} type="button" onClick={this.toggleHeader} className={expandClass}>
                            <span>
                                {prefix}
                                {element.name}
                            </span>
                        </button>
                    </div>
                );
            } else {
                divList.push(
                    <div key={`${element.name}-${idx}`} className={`${rowClass} ${colClass}`}>
                        <button name={element.name} className="not-button">
                            <span>
                                {prefix}
                                {element.name}
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
        let { rowHeader, columnHeader, rowList, columnList } = this.state;
        if (columnHeader === UNUSED_META_KEY) {
            return;
        }
        [rowHeader, columnHeader] = [columnHeader, rowHeader];
        [rowList, columnList] = [columnList, rowList];
        this.setState({ rowHeader, columnHeader, rowList, columnList });
        this.buildMatrix();
        this.setColNumber();
    }

    /**
     * build the matrix, actually list of divs, use grid to control layout
     */
    buildMatrix() {
        const { columnHeader, rowList, columnList } = this.state;
        let divs = [];
        if (columnHeader !== UNUSED_META_KEY) {
            for (let row of rowList) {
                for (let col of columnList) {
                    if (row.expanded || col.expanded) {
                        divs.push(<div key={`${row.name}-${col.name}`}></div>);
                    } else {
                        divs.push(<div key={`${row.name}-${col.name}`}>{this.countTracks(row, col)}</div>);
                    }
                }
            }
        } else {
            for (let row of rowList) {
                if (row.expanded) {
                    divs.push(<div key={`${row.name}-col}`}></div>);
                } else {
                    divs.push(<div key={`${row.name}-col`}>{this.countTracks(row, UNUSED_META_KEY)}</div>);
                }
            }
        }
        return divs;
    }

    trackMetadataBelongsTo = (tkMeta, metaType) => {
        if (Array.isArray(tkMeta)) {
            return tkMeta.includes(metaType);
        } else {
            return tkMeta === metaType;
        }
    };

    /**
     *
     * @param {onject} row
     * @param {object} col
     * @return {ReactModal} how many tracks belong to the row and col combination, and popup the track list
     */
    countTracks(row, col) {
        const { tracks, rowHeader, columnHeader, showModalId } = this.state;
        let found = [];
        for (let track of tracks) {
            // console.log(rowHeader);
            // console.log(track.metadata);
            if (!track.metadata[rowHeader]) {
                continue;
            }
            const tkRowInfo = variableIsObject(track.metadata[rowHeader])
                ? track.metadata[rowHeader].name
                : track.metadata[rowHeader];
            const tkColumnInfo = variableIsObject(track.metadata[columnHeader])
                ? track.metadata[columnHeader].name
                : track.metadata[columnHeader];
            if (row.name === rowHeader || this.trackMetadataBelongsTo(tkRowInfo, row.name)) {
                // confusing code here, need to check if column was used
                if (col === UNUSED_META_KEY) {
                    found.push(track);
                } else {
                    if (!tkColumnInfo) {
                        if (col.name === columnHeader) {
                            found.push(track);
                        }
                        continue;
                    }
                    if (col.name === columnHeader || this.trackMetadataBelongsTo(tkColumnInfo, col.name)) {
                        found.push(track);
                    }
                }
            }
        }
        if (!found.length) {
            return;
        }
        const id = `modal-${row.name}-${col.name}`;
        const addUrls = found.filter(
            tk => this.props.addedTrackSets.has(tk.url) || this.props.addedTrackSets.has(tk.name)
        );
        return (
            <div>
                <button onClick={() => this.handleOpenModal(id)} className="facet-item">
                    <span className="green">{addUrls.length}</span>/{found.length}
                </button>
                <ReactModal
                    isOpen={showModalId === id}
                    contentLabel="track list"
                    ariaHideApp={false}
                    id={id}
                    style={{
                        overlay: { zIndex: 3, backgroundColor: "rgba(111,107,101, 0.7)" }
                    }}
                >
                    <span
                        className="text-right"
                        style={{
                            cursor: "pointer",
                            color: "red",
                            fontSize: "2em",
                            position: "absolute",
                            top: "-5px",
                            right: "15px"
                        }}
                        onClick={this.handleCloseModal}
                    >
                        ×
                    </span>
                    <HubTrackTable
                        tracks={found}
                        addedTrackSets={this.props.addedTrackSets}
                        onTracksAdded={this.props.onTracksAdded}
                        rowHeader={rowHeader}
                        columnHeader={columnHeader}
                    />
                </ReactModal>
            </div>
        );
    }

    setColNumber() {
        let colNum = Math.max(1, this.state.columnList.length);
        document.documentElement.style.setProperty("--colNum", colNum + 1);
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
                {isColumn ? "Column: " : "Row: "}
                <select value={stateToRead} onChange={changeCallback}>
                    {this.state.metaKeys
                        .filter(metaKey => metaKey !== otherState)
                        .map(metaKey => (
                            <option key={metaKey} value={metaKey}>
                                {metaKey}
                            </option>
                        ))}
                    {isColumn && (
                        <React.Fragment>
                            <option key="disabled" disabled>
                                ────
                            </option>
                            <option key={UNUSED_META_KEY} value={UNUSED_META_KEY}>
                                Not used
                            </option>
                        </React.Fragment>
                    )}
                </select>
            </label>
        );
    }

    handleRowChange(event) {
        const selectedMetaKey = event.currentTarget.value;
        this.setState({
            rowHeader: selectedMetaKey,
            rowList: [
                {
                    name: selectedMetaKey,
                    expanded: false,
                    children: this.state.parent2children[selectedMetaKey]
                }
            ]
        });
    }

    handleColumnChange(event) {
        const selectedMetaKey = event.currentTarget.value;
        if (selectedMetaKey === UNUSED_META_KEY) {
            this.setState({
                columnHeader: UNUSED_META_KEY,
                columnList: [{ name: "--" }]
            });
        } else {
            this.setState({
                columnHeader: selectedMetaKey,
                columnList: [
                    {
                        name: selectedMetaKey,
                        expanded: false,
                        children: this.state.parent2children[selectedMetaKey]
                    }
                ]
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
                        <div className="facet-swap" title="swap row/column" onClick={this.swapHeader}>
                            &#8646;
                        </div>
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
