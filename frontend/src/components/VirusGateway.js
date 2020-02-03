import React from "react";
import VirusGenome from "./VirusContainer/VirusGenome";
import OpenInterval from "../model/interval/OpenInterval";
import { connect } from "react-redux";
import { ActionCreators } from "../AppState";

const callbacks = { onGenomeSelected: ActionCreators.setGenome };

// fetch from URL instead later for update
const virusGateway = {
    "2019-nCov": {
        fullName: "2019 Novel Coronavirus",
        fastaUrl: "https://wangftp.wustl.edu/~dli/virusGateway/MN985325.1",
        tracks: []
    },
    sars: {
        fullName: "SARS",
        fastaUrl: "https://wangftp.wustl.edu/~dli/virusGateway/AP006561.1",
        tracks: []
    }
};

class VirusGateway extends React.Component {
    constructor(props) {
        super(props);
        this.state = { name: "2019-nCov" };
    }

    handleChange = event => {
        this.setState({ name: event.target.value });
    };

    handleSubmit = async event => {
        event.preventDefault();
        const genome = new VirusGenome(this.state.name, virusGateway[this.state.name].fastaUrl);
        await genome.init();
        const navContext = genome.makeNavContext();
        const defaultRegion = new OpenInterval(0, genome._length);
        const genomeConfig = {
            genome,
            navContext,
            defaultRegion,
            cytobands: {},
            defaultTracks: []
        };
        console.log(genomeConfig);
        this.props.onGenomeSelected(genome.name);
    };

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
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
                <input type="submit" value="Submit" />
            </form>
        );
    }
}

// export default VirusGateway;

export default connect(null, callbacks)(VirusGateway);
