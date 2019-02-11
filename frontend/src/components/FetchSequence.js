import React from 'react';
import PropTypes from 'prop-types';
import { notify } from 'react-notify-toast';
import DisplayedRegionModel from '../model/DisplayedRegionModel';
import TwoBitSource from '../dataSources/TwoBitSource';
import { CopyToClip } from "./CopyToClipboard";

import './FetchSequence.css';

const SEQ_LIMIT = 10000; // 10kb

/**
 * This app fetch sequences from .2bit file based on current selected region if <= 10kb
 * or can accept user's input list, max list is 100
 * each should <= 10kb
 * 
 * @author Daofeng Li
 */

export class FetchSequence extends React.Component {

    static propTypes = {
        genomeConfig: PropTypes.object.isRequired,
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            currentRegionSeq: '',
            queryList: `chr6:52425276-52425961
chr1:90100-91000`,
            listRegionSeq: '',
        };
        this.twoBitSource = props.genomeConfig.twoBitURL ? new TwoBitSource(props.genomeConfig.twoBitURL) : null;
    }

    fetchSequence = async (region) => {
        if (!this.twoBitSource) {
            this.setState({currentRegionSeq: 'genomic sequence is not added to this genome yet.'});
            return;
        }
        try {
            const sequence = await this.twoBitSource.getData(region);
            return sequence[0].sequence;
        } catch (error) {
            return error.toString();
        }
    }

    handleCurrentFetch = async () => {
        this.setState({currentRegionSeq: 'Loading...'});
        const seq = await this.fetchSequence(this.props.selectedRegion);
        this.setState({currentRegionSeq: seq});
    }

    handleListFetch = async () => {
        this.setState({listRegionSeq: 'Loading...'});
        const inputListRaw = this.state.queryList.trim().split('\n');
        const inputListRaw2 = inputListRaw.map(item => item.trim());
        const inputList = inputListRaw2.filter(item => item !== '');
        if (inputList.length > 100) {
            notify.show('Input list too long (> 100)', 'error', 2000);
            this.setState({listRegionSeq: ''});
            return null;
        }
        const context = this.props.selectedRegion.getNavigationContext();
        if (inputList.length === 0) {
            notify.show('Input content is empty or cannot find any location on genome', 'error', 2000);
            this.setState({listRegionSeq: ''});
            return null;
        }
        const promise = inputList.map((symbol) => {
            try{
                const interval = context.parse(symbol);
                if (interval && interval.getLength() <= SEQ_LIMIT) {
                    const reg =  new DisplayedRegionModel(context, ...interval);
                    return this.fetchSequence(reg);
                }
            }catch(error) {
            }
        });
        const seqs = await Promise.all(promise);
        const seqFasta = seqs.map((seq,i) => `>${inputList[i]}\n${seq}`);
        this.setState({listRegionSeq: seqFasta.join('\n')});
    }

    handleListChange = (event) => {
        this.setState({queryList: event.target.value});
    }

    resetList = () => {
        this.setState({queryList: ''});
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
        const region = selectedRegion.currentRegionAsString();
        const seq = currentRegionSeq ? `>${region}\n${currentRegionSeq}` : '';
        return (
            <div>
                <p>Fetch sequence for current view region {region}:</p>
                <button className="btn btn-sm btn-success" onClick={this.handleCurrentFetch}>Fetch
                </button> {seq && <CopyToClip value={seq} />}
                <div className="FetchSequence-seq">{
                        seq.split('\n').map((item, key) => <React.Fragment key={key}>{item}<br/></React.Fragment>)
                    }</div>
            </div>
        );
    }

    renderBatchFetch = () => {
        const { listRegionSeq } = this.state;
        return (
            <div style={{marginTop: "20px"}}>
                <p>or input a list of coordinates to fetch sequence (max 100 regions, each should less than 10KB, regions longer than 10Kb would be ignored):</p>
                <textarea value={this.state.queryList} onChange={this.handleListChange} rows={10} cols={40} />
                <div>
                    <button className="btn btn-sm btn-primary" onClick={this.handleListFetch}>Batch fetch</button> <button 
                        className="btn btn-sm btn-secondary" onClick={this.resetList} 
                        >Reset</button> {listRegionSeq && <CopyToClip value={listRegionSeq} />}
                </div>
                <div className="FetchSequence-seq">{
                    listRegionSeq.split('\n').map((item, key) => <React.Fragment key={key}>{item}<br/></React.Fragment>)
                    }</div>
            </div>
        );
    }

    render(){
        return (
            <div>
                <p className="lead">To fetch a sequence, choose a region shorter or equal to 10Kb, or input a list of 
                coordinates each less than 10Kb.</p>
                {this.renderCurrentFetch()}
                {this.renderBatchFetch()}
            </div>
        );
    }
}
