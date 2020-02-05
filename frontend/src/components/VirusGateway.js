import React from "react";
import VirusGenome from "./VirusContainer/VirusGenome";
import OpenInterval from "../model/interval/OpenInterval";
import Chromosome from "../model/genomes/Chromosome";
import { Genome } from "../model/genomes/Genome";
// import DisplayedRegionModel from "../model/DisplayedRegionModel";
import { AppWithoutGenome } from "../App";
import { connect } from "react-redux";
import { ActionCreators } from "../AppState";
import TrackModel from "../model/TrackModel";

// fetch from URL instead later for update
const virusGateway = {
    "2019-nCov": {
        fullName: "2019 Novel Coronavirus",
        fastaUrl: "https://wangftp.wustl.edu/~dli/virusGateway/MN985325.1",
        tracks: [
            new TrackModel({
                type: "ruler",
                name: "Ruler"
            })
        ]
    },
    sars: {
        fullName: "SARS",
        fastaUrl: "https://wangftp.wustl.edu/~dli/virusGateway/AP006561.1",
        tracks: [
            new TrackModel({
                type: "ruler",
                name: "Ruler"
            }),
            new TrackModel({
                type: "bed",
                name: "Test",
                url: "http://target.wustl.edu/sars/AP006561.1.bed.gz"
            })
        ]
    }
};

class VirusGateway extends React.Component {
    constructor(props) {
        super(props);
        this.state = { name: "2019-nCov", genomeConfig: null, customName: "", customURL: "" };
    }

    //   componentDidUpdate(prevProps, prevState) {
    //     if (
    //       prevState.genomeConfig !== this.state.genomeConfig &&
    //       this.state.genomeConfig
    //     ) {
    //       this.props.onCustomVirusGenome(this.state.genomeConfig);
    //     }
    //   }

    handleChange = event => {
        this.setState({ name: event.target.value });
    };

    handleCustomNameChange = event => {
        this.setState({ customName: event.target.value });
    };

    handleCustomURLChange = event => {
        this.setState({ customURL: event.target.value });
    };

    handleSubmit = async (name, url) => {
        const virus = new VirusGenome(name, url);
        await virus.init();
        const genome = new Genome(name, [new Chromosome(virus._seqId, virus._length)]);
        const navContext = genome.makeNavContext();
        const defaultRegion = new OpenInterval(0, virus._length);
        const tracks = virusGateway[genome._name]
            ? virusGateway[genome._name].tracks
            : [
                  new TrackModel({
                      type: "ruler",
                      name: "Ruler"
                  })
              ];
        const genomeConfig = {
            genome,
            navContext,
            defaultRegion,
            cytobands: {},
            defaultTracks: []
        };
        this.props.onCustomVirusGenome(
            virus._name,
            virus._seqId,
            virus._seq,
            tracks.filter(track => !track.fileObj).map(track => track.serialize())
        );
        this.setState({ genomeConfig: { ...genomeConfig } });
    };

    fillExample = () => {
        this.setState({
            customName: "custom-virus",
            customURL: "https://wangftp.wustl.edu/~dli/virusGateway/MN985325.1"
        });
    };

    renderForm = () => {
        return (
            <div>
                <label>
                    Short Name:
                    <input size="50" type="text" value={this.state.customName} onChange={this.handleCustomNameChange} />
                </label>
                <br />
                <label>
                    Fasta URL:
                    <input size="50" type="text" value={this.state.customURL} onChange={this.handleCustomURLChange} />
                </label>
                <br />
                <button onClick={this.fillExample}>Example</button>{" "}
                <button onClick={() => this.handleSubmit(this.state.customName, this.state.customURL)}>Submit</button>
            </div>
        );
    };

    render() {
        return (
            <div>
                <div>
                    <label>
                        Pick a virus genome:
                        <select value={this.state.name} onChange={this.handleChange}>
                            {Object.entries(virusGateway).map(([name, details]) => (
                                <option value={name} key={name}>
                                    {details.fullName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button onClick={() => this.handleSubmit(this.state.name, virusGateway[this.state.name].fastaUrl)}>
                        Submit
                    </button>
                </div>
                {this.renderForm()}
                {this.state.genomeConfig && <AppWithoutGenome genomeConfig={this.state.genomeConfig} />}
            </div>
        );
    }
}

const mapStateToProps = (state, props) => {
    return {
        browser: state.browser
    };
};

const mapDispatchToProps = {
    onCustomVirusGenome: ActionCreators.setCustomVirusGenome
};

export default connect(mapStateToProps, mapDispatchToProps)(VirusGateway);
