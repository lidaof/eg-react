import React from 'react';
import _ from 'lodash';
import axios from 'axios';

import '../../App.css';

/**
 * The component is used for gene search, calls the backend api endpoint for gene partial search
 * 
 * @author: Daofeng Li
 */

const SEARCH_LENGTH_THRESHOLD = 3;

class GeneSearch extends React.Component{
    constructor(props){
        super(props);
        this.state={
            value: '', //user's input
            searchResults : [], //gene symbols found by auto completion
            geneModels: [] //gene models found using gene symbol or ID
        };
        this.partialSearch = this.partialSearch.bind(this);
        this.formatResults = this.formatResults.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * search the database
     * @param {*string} query 
     */
    partialSearch(query){
        return;
    }

    /**
     * format the searched results
     * @param {*array} results 
     */
    formatResults(results){
        return;
    }

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

    async handleClick(gene){
        let query = _.trim(gene);
        let response = await axios.get(`/hg19/refGene/${query}`);
        console.log(response.data);
        this.setState({geneModels: response.data});
    }

    render(){
        let liElements = [];
        if(this.state.geneModels.length>0){
            this.state.geneModels.forEach(
                (geneModel) => liElements.push(<li key={geneModel.name} className="geneList">{geneModel.name}</li>)
            );
        }else{
            this.state.searchResults.forEach(
                (geneName) => liElements.push(<li key={geneName} className="geneList" onClick={(mouseEvent) => this.handleClick(geneName)}>{geneName}</li>)
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