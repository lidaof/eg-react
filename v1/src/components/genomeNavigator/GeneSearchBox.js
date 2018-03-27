import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';
import { Manager, Target, Popper } from 'react-popper';

import IsoformSelection from './IsoformSelection';
import OutsideClickDetector from '../OutsideClickDetector';

import '../../autosuggest.css';
import NavigationContext from '../../model/NavigationContext';

const MIN_CHARS_FOR_SUGGESTIONS = 3; // Minimum characters to type before displaying suggestions
const ENTER_KEY_CODE = 13;
const ISOFORM_POPOVER_STYLE = {
    zIndex: 1,
    border: "2px solid grey",
    backgroundColor: "white"
};

/**
 * A box that accepts gene name queries, and gives suggestions as well.
 * 
 * @author Daofeng Li and Silas Hsu
 */
class GeneSearchBox extends React.PureComponent {
    static propTypes = {
        navContext: PropTypes.instanceOf(NavigationContext).isRequired, // The current navigation context

        /**
         * Called when the user chooses a gene and wants to go to it in the nav context.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the absolute base number of the start of the view interval
         *         `newEnd`: the absolute base number of the end of the view interval
         */
        onRegionSelected: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            inputValue: '', //user's input
            suggestions: [], // Matching gene symbols for the current input
            isShowingIsoforms: false,
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.shouldSuggest = this.shouldSuggest.bind(this);
        this.getSuggestions = this.getSuggestions.bind(this);
        this.showIsoforms = this.showIsoforms.bind(this);
        this.showIsoformsIfEnterPressed = this.showIsoformsIfEnterPressed.bind(this);
        this.setViewToGene = this.setViewToGene.bind(this);
    }

    handleInputChange(event, {newValue}) {
        this.setState({inputValue: newValue, isShowingIsoforms: false});
    }

    shouldSuggest(value) {
        return !this.state.isShowingIsoforms && value.trim().length >= MIN_CHARS_FOR_SUGGESTIONS;
    }

    async getSuggestions(changeData) {
        let query = changeData.value.trim();
        const response = await axios.get(`/hg19/geneSuggest/${query}`);
        this.setState({suggestions: response.data});
    }

    showIsoforms() {
        this.setState({suggestions: [], isShowingIsoforms: true});
    }

    showIsoformsIfEnterPressed(event) {
        if (event.keyCode === ENTER_KEY_CODE) {
            this.showIsoforms();
        }
    }

    /**
     * @param {Gene} gene 
     */
    setViewToGene(gene) {
        const interval = this.props.navContext.convertGenomeIntervalToBases(gene.getLocus());
        this.props.onRegionSelected(...interval);
    }

    render() {
        const {inputValue, suggestions, isShowingIsoforms} = this.state;
        let isoformPane = null;
        if (isShowingIsoforms) {
            isoformPane = (
                <Popper placement="bottom-start" style={ISOFORM_POPOVER_STYLE} >
                    <OutsideClickDetector onOutsideClick={() => this.setState({isShowingIsoforms: false})} >
                        <IsoformSelection geneName={inputValue} onGeneSelected={this.setViewToGene} />
                    </OutsideClickDetector>
                </Popper>
            );
        }

        return (
        <div>
            <label>Gene search</label>
            <Manager>
                <Target>
                    <Autosuggest
                        suggestions={suggestions}
                        shouldRenderSuggestions={this.shouldSuggest}
                        onSuggestionsFetchRequested={this.getSuggestions}
                        onSuggestionsClearRequested={() => this.setState({nameSuggestions: []})}
                        getSuggestionValue={_.identity}
                        renderSuggestion={_.identity}
                        inputProps={{
                            placeholder: "Gene name",
                            value: inputValue,
                            onChange: this.handleInputChange,
                            onKeyUp: this.showIsoformsIfEnterPressed
                        }}
                        onSuggestionSelected={this.showIsoforms}
                    />
                </Target>
                {isoformPane}
            </Manager>
        </div>
        );
    }
}

export default GeneSearchBox;
