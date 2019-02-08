import React from 'react';
import PropTypes from 'prop-types';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import TwoBitSource from '../dataSources/TwoBitSource';
import { CopyToClip } from "./CopyToClipboard";
import './FetchSequence.css';

const SEQ_LIMIT = 10000; // 10kb

export class FetchSequence extends React.Component {

    static propTypes = {
        genomeConfig: PropTypes.object.isRequired,
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            currentRegionSeq: null,
        };
        this.twoBitSource = props.genomeConfig.twoBitURL ? new TwoBitSource(props.genomeConfig.twoBitURL) : null;
    }

    fetchSequence = async () => {
        if (!this.twoBitSource) {
            this.setState({currentRegionSeq: 'genomic sequence is not added to this genome yet.'});
            return;
        }
        this.setState({currentRegionSeq: 'Loading...'});
        try {
            const sequence = await this.twoBitSource.getData(this.props.selectedRegion);
            this.setState({currentRegionSeq: sequence[0].sequence});
        } catch (error) {
            this.setState({currentRegionSeq: error.toString()});
        }
    }

    renderOversize = () => {
        return <div>Sorry, region length great than 10KB, please choose a smaller region.</div>
    }

    renderCurrentFetch = () => {
        const { currentRegionSeq } = this.state;
        const { selectedRegion } = this.props;
        if (selectedRegion.getWidth() > SEQ_LIMIT) {
            this.renderOversize();
        }
        const region = this.props.selectedRegion.currentRegionAsString();
        const seq = currentRegionSeq ? `>${region}\n${currentRegionSeq}` : '';
        return (
            <div>
                <p>Fetch sequence for current view region {region}:</p>
                <button className="btn btn-sm btn-success" onClick={this.fetchSequence}>Fetch
                </button> {seq && <CopyToClip value={seq} />}
                <div className="FetchSequence-seq">
                    {
                        seq.split('\n').map((item, key) => <React.Fragment key={key}>{item}<br/></React.Fragment>)
                    }
                </div>
            </div>
        );
    }

    renderBatchFetch = () => {
        return (
            <div>
                <p>or input a list of coordinates to fetch sequence:</p>
                <textarea value={this.state.queryList} onChange={this.handleListChange} rows={10} cols={40} />
                <div>
                    <button className="btn btn-sm btn-primary" onClick={this.handleListFetch}> Batch fetch</button> <button 
                        className="btn btn-sm btn-secondary" onClick={this.resetList} 
                        >Reset</button>
                </div>
                <div className="FetchSequence-seq"></div>
            </div>
        );
    }

    render(){
        return (
            <div>
                {this.renderCurrentFetch()}
                {this.renderBatchFetch()}
            </div>
        );
    }
}
