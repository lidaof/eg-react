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
            value: '',
            searchResults : []
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
        if(query.length >= SEARCH_LENGTH_THRESHOLD){
            let response = await axios.get(`/hg19/refGene/${query}`);
            this.setState({searchResults: response.data});
        }else{
            this.setState({searchResults: []});
        }
    }

    async handleClick(gene){
        console.log(gene);
    }

    render(){
        return (
            <div>
                <label>Type a gene:
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <div>
                    {this.formatResults(this.state.searchResults)}
                    <div style={{position: 'absolute', zIndex:10, marginLeft:"95px"}}>
                        <ul style={{backgroundColor:'#d5d9da',listStyleType:'none',paddingLeft:0}}>
                            {
                                this.state.searchResults.map(
                                    (geneName) => <li key={geneName} className="geneList" onClick={(mouseEvent) => this.handleClick(geneName)}>{geneName}</li>
                                )
                            }
                        </ul>
                    </div>

                </div>
            </div>
        );
    }
}

export default GeneSearch;