import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "react-bootstrap-tabs";
import JSON5 from "json5";
// import { notify } from 'react-notify-toast';
import TrackModel, { TrackOptions } from "../../model/TrackModel";
import { getSecondaryGenomes } from "../../util";
import CustomHubAdder from "./CustomHubAdder";
import FacetTable from "./FacetTable";
import { HELP_LINKS } from "../../util";
import { TrackOptionsUI } from "./TrackOptionsUI";
import { GenomeConfig } from "model/genomes/GenomeConfig";

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
    Repeats: ["repeatmasker"],
    Alignment: ["bam", "pairwise", "snv", "snv2"],
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
};

interface CustomTrackAdderProps {
	addedTracks: TrackModel[];
	customTracksPool: TrackModel[];
	onTracksAdded: (tracks: TrackModel[]) => void;
	// FIXME: i have no idea what the boolean does
	onAddTracksToPool: (tracks: TrackModel[], bool: boolean) => void;
	addTermToMetaSets: (terms: string[]) => void;
	genomeConfig: GenomeConfig;
	addedTrackSets: Set<TrackModel>;
}

/**
 * UI for adding custom tracks.
 *
 * @author Silas Hsu and Daofeng Li
 */
const CustomTrackAdder: React.FC<CustomTrackAdderProps> = ({ addTermToMetaSets, addedTrackSets, addedTracks, customTracksPool, genomeConfig, onAddTracksToPool, onTracksAdded }) => {
	const [type, setType] = useState<string>(TRACK_TYPES.Numerical[0]);
	const [url, setUrl] = useState<string>('');
	const [name, setName] = useState<string>('');
	const [urlError, setUrlError] = useState<string>('');
	const [metadata, setMetadata] = useState<{ genome: string }>({ genome: genomeConfig.genome.getName() });
	const [trackAdded, setTrackAdded] = useState<boolean>(false);
	const [selectedTabIndex, setSelectedTabIndex] = useState<number>(0);
	const [options, setOptions] = useState<TrackOptions | null>(null);

    const handleSubmitClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!onTracksAdded) {
            return;
        }

        if (!url) {
			setUrlError('Enter a URL');
            return;
        } else {
            const newTrack = new TrackModel({ datahub: "Custom track", metadata, name, options, url });
            onTracksAdded([newTrack]);
            onAddTracksToPool([newTrack], false);
			setUrlError('');
			setTrackAdded(true);
        }
    }, [onTracksAdded, onAddTracksToPool, metadata, name, options, url]);

    const renderTypeOptions = useCallback(() => {
        return Object.entries(TRACK_TYPES).map((types) => (
            <optgroup label={types[0]} key={types[0]}>
                {types[1].map((type) => (
                    <option key={type} value={type}>
                        {type} - {TYPES_DESC[type]}
                    </option>
                ))}
            </optgroup>
        ));
    }, []);

    const renderGenomeOptions = useCallback((allGenomes: string[]) => {
        return allGenomes.map((genome) => (
            <option key={genome} value={genome}>
                {genome}
            </option>
        ));
    }, []);

    const renderButtons = () => {
        if (trackAdded) {
            return (
                <>
                    <button className="btn btn-success" disabled={true}>
                        Success
                    </button>
                    <button className="btn btn-link" onClick={() => setTrackAdded(false)}>
                        Add another track
                    </button>
                </>
            );
        } else {
            return (
                <button className="btn btn-primary" onClick={handleSubmitClick}>
                    Submit
                </button>
            );
        }
    }

    const getOptions = useCallback((value: string) => {
        let options = null;
        try {
            options = JSON5.parse(value) as TrackOptions;
        } catch (error) {
            // notify.show('Option syntax is not correct, ignored', 'error', 3000);
        }
		setOptions(options);
    }, []);

    const renderCustomTrackAdder = useCallback(() => {
        const primaryGenome = genomeConfig.genome.getName();
        var allGenomes = getSecondaryGenomes(primaryGenome, addedTracks);
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
                        onChange={(event) => setType(event.target.value)}
                    >
                        {renderTypeOptions()}
                    </select>
                </div>
                <div className="form-group">
                    <label>Track file URL</label>
                    <input
                        type="text"
                        className="form-control"
                        value={url}
                        onChange={(event) => setUrl(event.target.value)}
                    />
                    <span style={{ color: "red" }}>{urlError}</span>
                </div>
                <div className="form-group">
                    <label>Track label</label>
                    <input
                        type="text"
                        className="form-control"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>genome</label>
                    <select
                        className="form-control"
                        value={metadata.genome}
                        onChange={(event) => setMetadata({ genome: event.target.value })}
                    >
                        {renderGenomeOptions(allGenomes)}
                    </select>
                </div>
                <TrackOptionsUI onGetOptions={(value: string) => getOptions(value)} />
                {renderButtons()}
            </form>
        );
    }, [genomeConfig, addedTracks, getOptions, renderButtons, renderTypeOptions]);

    const renderCustomHubAdder = useCallback(() => {
        return (
            <CustomHubAdder
                onTracksAdded={(tracks) => this.props.onTracksAdded(tracks)}
                onAddTracksToPool={(tracks) => this.props.onAddTracksToPool(tracks, false)}
            />
        );
    }, []);

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
