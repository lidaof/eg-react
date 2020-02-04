import React from "react";
import VirusGenome from "./VirusContainer/VirusGenome";
import OpenInterval from "../model/interval/OpenInterval";
import DisplayedRegionModel from "../model/DisplayedRegionModel";
import { AppWithoutGenome } from "../App";
import { connect } from "react-redux";
import { ActionCreators } from "../AppState";

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
    this.state = { name: "2019-nCov", genomeConfig: null };
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

  handleSubmit = async event => {
    event.preventDefault();
    const genome = new VirusGenome(
      this.state.name,
      virusGateway[this.state.name].fastaUrl
    );
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
    const vw = new DisplayedRegionModel(navContext, ...defaultRegion);
    console.log(vw);
    this.setState({ genomeConfig: { ...genomeConfig } });
    this.props.onCustomVirusGenome(genomeConfig);
  };

  render() {
    console.log(this.props);
    return (
      <div>
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
        {this.state.genomeConfig && (
          <AppWithoutGenome genomeConfig={this.state.genomeConfig} />
        )}
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
