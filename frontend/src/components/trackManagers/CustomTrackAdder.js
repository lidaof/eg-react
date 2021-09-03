import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "react-bootstrap-tabs";
import JSON5 from "json5";
// import { notify } from 'react-notify-toast';
import TrackModel from "../../model/TrackModel";
import { getSecondaryGenomes } from "../../util";
import CustomHubAdder from "./CustomHubAdder";
import FacetTable from "./FacetTable";
import { HELP_LINKS } from "../../util";
import { TrackOptionsUI } from "./TrackOptionsUI";
import { getTrackConfig } from "components/trackConfig/getTrackConfig";

// Just add a new entry here to support adding a new track type.
// const TRACK_TYPES = ['bigWig', 'bedGraph', 'methylC', 'categorical', 'bed', 'bigBed', 'repeatmasker','refBed', 'hic', 'longrange', 'bigInteract', 'cool', 'bam'];

export const TRACK_TYPES = {
    Numerical: ["bigWig", "bedGraph", "qBED"],
    Variant: ["vcf"],
    "Dynamic sequence": ["dynseq"],
    Annotation: ["bed", "bigBed", "refBed"],
    Peak: ["rgbpeak"],
    Categorical: ["categorical"],
    Methylation: ["methylC"],
    Interaction: ["hic", "cool", "bigInteract", "longrange"],
    Stats: ["boxplot"],
    Repeats: ["rmskv2", "repeatmasker"],
    Alignment: ["bam", "pairwise", "snv", "snv2", "bigchain", "genomealign"],
    "3D Structure": ["g3d"],
    Dynamic: ["dbedgraph"],
    Image: ["omero4dn", "omeroidr"],
};

export const NUMERRICAL_TRACK_TYPES = ["bigwig", "bedgraph"]; // the front UI we allow any case of types, in TrackModel only lower case

export const TYPES_DESC = {
    bigWig: "numerical data",
    bedGraph: "numerical data, processed by tabix in .gz format",
    methylC: "methylation data, processed by tabix in .gz format",
    categorical: "categorical data, processed by tabix in .gz format",
    bed: "annotationd data, processed by tabix in .gz format",
    bigBed: "anotation data",
    repeatmasker: "repeats annotation data in bigBed format",
    refBed: "gene annotationd data, processed by tabix in .gz format",
    hic: "long range interaction data in hic format",
    longrange: "long range interaction data in longrange format",
    bigInteract: "long range interaction data in bigInteract format",
    cool: "long range interaction data in cool format, use data uuid instead of URL",
    bam: "reads alignment data",
    pairwise: "pairwise nucleotide alignment data (same as snv)",
    snv: "pairwise nucleotide alignment data",
    snv2: "pairwise nucleotide alignment data with amino acid level mutations",
    qBED: "quantized numerical data, processed by tabix in .gz format",
    g3d: "3D structure in .g3d format",
    dbedgraph: "Dynamic bedgraph data",
    omero4dn: "image data from 4DN (4D Nucleome Data Portal)",
    omeroidr: "image data from IDR (Image Data Resource)",
    dynseq: "dynamic sequence",
    rgbpeak: "peak in bigbed format with RGB value",
    vcf: "Variant Call Format",
    boxplot: "show numerical data as boxplots",
    rmskv2: "RepeatMasker V2 structure with color",
    bigchain: "bigChain pairwise alignment",
    genomealign: "genome pairwise alignment",
};

/**
 * UI for adding custom tracks.
 *
 * @author Silas Hsu and Daofeng Li
 */
class CustomTrackAdder extends React.Component {
    static propTypes = {
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        customTracksPool: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)),
        onTracksAdded: PropTypes.func,
        onAddTracksToPool: PropTypes.func,
        addTermToMetaSets: PropTypes.func,
        genomeConfig: PropTypes.object.isRequired,
        addedTrackSets: PropTypes.instanceOf(Set),
    };

    constructor(props) {
        super(props);
        this.trackUI = null;
        this.state = {
            type: TRACK_TYPES.Numerical[0],
            url: "",
            name: "",
            urlError: "",
            metadata: { genome: this.props.genomeConfig.genome.getName() },
            trackAdded: false,
            selectedTabIndex: 0,
            querygenome: "",
            options: null, // custom track options
        };
        this.handleSubmitClick = this.handleSubmitClick.bind(this);
    }

    handleSubmitClick(e) {
        e.preventDefault();
        if (!this.props.onTracksAdded) {
            return;
        }

        if (!this.state.url) {
            this.setState({ urlError: "Enter a URL" });
            return;
        } else {
            const newTrack = new TrackModel({ ...this.state, datahub: "Custom track" });
            if (getTrackConfig(newTrack).isGenomeAlignTrack()) {
                if (!this.state.querygenome) {
                    this.setState({ urlError: "Please enter query genome for genomealign/bigchain track" });
                    return;
                }
            }
            this.props.onTracksAdded([newTrack]);
            this.props.onAddTracksToPool([newTrack], false);
            this.setState({ urlError: "", trackAdded: true });
        }
    }

    renderTypeOptions() {
        return Object.entries(TRACK_TYPES).map((types) => (
            <optgroup label={types[0]} key={types[0]}>
                {types[1].map((type) => (
                    <option key={type} value={type}>
                        {type} - {TYPES_DESC[type]}
                    </option>
                ))}
            </optgroup>
        ));
    }

    renderGenomeOptions(allGenomes) {
        return allGenomes.map((genome) => (
            <option key={genome} value={genome}>
                {genome}
            </option>
        ));
    }

    renderButtons() {
        if (this.state.trackAdded) {
            return (
                <React.Fragment>
                    <button className="btn btn-success" disabled={true}>
                        Success
                    </button>
                    <button className="btn btn-link" onClick={() => this.setState({ trackAdded: false })}>
                        Add another track
                    </button>
                </React.Fragment>
            );
        } else {
            return (
                <button className="btn btn-primary" onClick={this.handleSubmitClick}>
                    Submit
                </button>
            );
        }
    }

    getOptions = (value) => {
        let options = null;
        try {
            options = JSON5.parse(value);
        } catch (error) {
            // notify.show('Option syntax is not correct, ignored', 'error', 3000);
        }
        this.setState({ options });
    };

    renderCustomTrackAdder() {
        const { type, url, name, metadata, urlError, querygenome } = this.state;
        const primaryGenome = this.props.genomeConfig.genome.getName();
        var allGenomes = getSecondaryGenomes(primaryGenome, this.props.addedTracks);
        allGenomes.unshift(primaryGenome);
        return (
            <form>
                <h1>Add remote track</h1>
                <div className="form-group">
                    <label>Track type</label>
                    <span style={{ marginLeft: "10px", fontStyle: "italic" }}>
                        <a href={HELP_LINKS.tracks} target="_blank" rel="noopener noreferrer">
                            track format documentation
                        </a>
                    </span>
                    <select
                        className="form-control"
                        value={type}
                        onChange={(event) => this.setState({ type: event.target.value })}
                    >
                        {this.renderTypeOptions()}
                    </select>
                </div>
                <div className="form-group">
                    <label>Track file URL</label>
                    <input
                        type="text"
                        className="form-control"
                        value={url}
                        onChange={(event) => this.setState({ url: event.target.value.trim() })}
                    />
                </div>
                <div className="form-group">
                    <label>Track label</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(event) => this.setState({ name: event.target.value.trim() })}
                    />
                </div>
                <div
                    className="form-group"
                    style={{ display: type === "bigchain" || type === "genomealign" ? "block" : "none" }}
                >
                    <label>Query genome</label>
                    <input
                        type="text"
                        className="form-control"
                        value={querygenome}
                        onChange={(event) => this.setState({ querygenome: event.target.value.trim() })}
                    />
                </div>
                <div className="form-group">
                    <label>Genome</label>
                    <select
                        className="form-control"
                        value={metadata.genome}
                        onChange={(event) => this.setState({ metadata: { genome: event.target.value } })}
                    >
                        {this.renderGenomeOptions(allGenomes)}
                    </select>
                </div>
                <span style={{ color: "red" }}>{urlError}</span>
                <TrackOptionsUI onGetOptions={(value) => this.getOptions(value)} />
                {this.renderButtons()}
            </form>
        );
    }

    renderCustomHubAdder() {
        return (
            <CustomHubAdder
                onTracksAdded={(tracks) => this.props.onTracksAdded(tracks)}
                onAddTracksToPool={(tracks) => this.props.onAddTracksToPool(tracks, false)}
            />
        );
    }

    render() {
        return (
            <div id="CustomTrackAdder">
                <div>
                    <Tabs
                        onSelect={(index, label) => this.setState({ selectedTabIndex: index })}
                        selected={this.state.selectedTabIndex}
                        headerStyle={{ fontWeight: "bold" }}
                        activeHeaderStyle={{ color: "blue" }}
                    >
                        <Tab label="Add Remote Track">{this.renderCustomTrackAdder()}</Tab>
                        <Tab label="Add Remote Data Hub">{this.renderCustomHubAdder()}</Tab>
                    </Tabs>
                </div>
                {this.props.customTracksPool.length > 0 && (
                    <FacetTable
                        tracks={this.props.customTracksPool}
                        addedTracks={this.props.addedTracks}
                        onTracksAdded={this.props.onTracksAdded}
                        addedTrackSets={this.props.addedTrackSets}
                        addTermToMetaSets={this.props.addTermToMetaSets}
                    />
                )}
            </div>
        );
    }
}

export default CustomTrackAdder;
