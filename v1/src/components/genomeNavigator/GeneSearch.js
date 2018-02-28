import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import React from 'react';
import _ from 'lodash';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../../App.css';
import StandaloneGeneAnnotation from "./StandaloneGeneAnnotation";

/**
 * The component is used for gene search, calls the backend api endpoint for gene partial search
 * 
 * @author: Daofeng Li
 */

const SEARCH_LENGTH_THRESHOLD = 3;

class GeneSearch extends React.Component{
    static propTypes = {
        selectedRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired, // The current view of the genome navigator
    
        /**
         * Called when the user types a region to go to and it is successfully parsed.  Has the signature
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the interval
         *         `newEnd`: the absolute base number of the end of the interval
         */
        newRegionCallback: PropTypes.func.isRequired,
    }
    constructor(props){
        super(props);
        this.state={
            value: '', //user's input
            searchResults : [], //gene symbols found by auto completion
            geneModels: [] //gene models found using gene symbol or ID
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.goToGeneModel = this.goToGeneModel.bind(this);
    }

    /**
     * monitor user's input, once user's input longer than or eqial to ${SEARCH_LENGTH_THRESHOLD}, trigger the database API search
     * @param {*} event 
     */
    async handleChange(event){
        let query = _.trim(event.target.value)
        this.setState({value: query});
        this.setState({geneModels: []}); // clear this when use input changes
        if(query.length >= SEARCH_LENGTH_THRESHOLD){
            let response = await axios.get(`/hg19/geneSuggest/${query}`);
            this.setState({searchResults: response.data});
        }else{
            this.setState({searchResults: []});
        }
    }

    /**
     * get gene modes using gene symbol by API get query
     * @param {string} gene 
     */
    async handleClick(gene){
        let query = _.trim(gene);
        let response = await axios.get(`/hg19/refGene/${query}`);
        //console.log(response.data);
        this.setState({geneModels: response.data});
    }

    /**
     * 
     * @param {object} geneModel 
     */
    goToGeneModel(geneModel){
        let navContext = this.props.selectedRegion.getNavigationContext();
        this.setState({geneModels:[], searchResults:[], value:geneModel.name2});
        this.props.newRegionCallback(navContext.convertFeatureCoordinateToBase(geneModel.chrom, geneModel.txStart), 
                                     navContext.convertFeatureCoordinateToBase(geneModel.chrom, geneModel.txEnd)
                                    );
    }

    render(){
        let liElements = [];
        if(this.state.geneModels.length>0){
            this.state.geneModels.forEach(
                (geneModel,i) => liElements.push(<li key={geneModel.name+i} className="geneList" onClick={() => this.goToGeneModel(geneModel)}><StandaloneGeneAnnotation gene={geneModel} width={200} /></li>)
            );
        }else{
            this.state.searchResults.forEach(
                (geneName,i) => liElements.push(<li key={geneName+i} className="geneList" onClick={(mouseEvent) => this.handleClick(geneName)}>{geneName}</li>)
            );
        }
        return (
            <div>
                <label>Type a gene:</label>
                <div>
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                    <div style={{position: 'absolute', zIndex:10}}>
                        <ul style={{backgroundColor:'#d5d9da',listStyleType:'none',paddingLeft:0}}>
                            {
                                liElements.map((li)=>li)   
                            }
                        </ul>
                    </div>

                </div>
            </div>
        );
    }
}

export default GeneSearch;