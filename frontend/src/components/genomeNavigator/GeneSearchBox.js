import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';
import { Manager, Target, Popper } from 'react-popper';

import withCurrentGenome from '../withCurrentGenome';
import IsoformSelection from './IsoformSelection';
import OutsideClickDetector from '../OutsideClickDetector';

import NavigationContext from '../../model/NavigationContext';
import { Genome } from '../../model/genomes/Genome';
import SpeechRecognition from 'react-speech-recognition';

import '../../autosuggest.css';
import './GeneSearchBox.css';
import { AWS_API } from '../../dataSources/GeneSource';

const MIN_CHARS_FOR_SUGGESTIONS = 3; // Minimum characters to type before displaying suggestions
const ENTER_KEY_CODE = 13;
const ISOFORM_POPOVER_STYLE = {
    zIndex: 1,
    border: "2px solid grey",
    backgroundColor: "white"
};
const DEBOUNCE_INTERVAL = 250;
const options = {
    autoStart: false
  };

/**
 * A box that accepts gene name queries, and gives suggestions as well.
 * 
 * @author Daofeng Li and Silas Hsu
 */
class GeneSearchBox extends React.PureComponent {
    static propTypes = {
        genomeConfig: PropTypes.shape({ // Current genome
            genome: PropTypes.instanceOf(Genome).isRequired
        }).isRequired,
        navContext: PropTypes.instanceOf(NavigationContext).isRequired, // The current navigation context

        /**
         * Called when the user chooses a gene and wants to go to it in the nav context.  Signature:
         *     (newStart: number, newEnd: number): void
         *         `newStart`: the nav context coordinate of the start of the view interval
         *         `newEnd`: the nav context coordinate of the end of the view interval
         */
        onRegionSelected: PropTypes.func.isRequired,
        handleCloseModal: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.input = null;
        this.state = {
            inputValue: '', //user's input
            suggestions: [], // Matching gene symbols for the current input
            isShowingIsoforms: false,
            speechInput: false, // text search input or speech
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.shouldSuggest = this.shouldSuggest.bind(this);
        this.getSuggestions = _.debounce(this.getSuggestions.bind(this), DEBOUNCE_INTERVAL);
        this.showIsoforms = this.showIsoforms.bind(this);
        this.showIsoformsIfEnterPressed = this.showIsoformsIfEnterPressed.bind(this);
        this.setViewToGene = this.setViewToGene.bind(this);
        this.startListening = this.startListening.bind(this);
        this.stopListening = this.stopListening.bind(this);
    }

    handleInputChange(event, {newValue}) {
        this.setState({inputValue: newValue, isShowingIsoforms: false});
    }

    shouldSuggest(value) {
        return !this.state.isShowingIsoforms && value.trim().length >= MIN_CHARS_FOR_SUGGESTIONS;
    }

    async getSuggestions(changeData) {
        const genomeName = this.props.genomeConfig.genome.getName();
        const params = {
            q: changeData.value.trim(),
            getOnlyNames: true,
        };
        const response = await axios.get(`${AWS_API}/${genomeName}/genes/queryName`, {params: params});
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
        const interval = this.props.navContext.convertGenomeIntervalToBases(gene.getLocus())[0];
        if (interval) {
            this.props.onRegionSelected(...interval);
            this.props.handleCloseModal();
            this.props.onSetEnteredRegion(interval);
        } else {
            alert("Gene not available in current region set view"); // TODO better message
        }
        this.setState({isShowingIsoforms: false});
    }

    startListening() {
        const { startListening } = this.props;
        startListening();
        this.setState( {
            speechInput: true,
        } );
    }

    stopListening() {
        const { stopListening } = this.props;
        stopListening();
        this.setState( {
            speechInput: false,
        } );
    }

    componentWillReceiveProps(nextProps) {
        this.setState( {
            inputValue: nextProps.transcript.replace(/\s/g, ""),
        } );
        this.input.input.focus();
    }

    render() {
        const {suggestions, isShowingIsoforms, inputValue} = this.state;
        const { resetTranscript, browserSupportsSpeechRecognition } = this.props;
        let speechSearchBox;
        if (browserSupportsSpeechRecognition) {
            speechSearchBox = <div className="GeneSearchBox-speech">
            <button className="btn btn-success btn-sm" onClick={this.startListening}>
                Say a Gene
            </button>
            <button className="btn btn-info btn-sm" onClick={resetTranscript}>Reset</button>
            <button className="btn btn-danger btn-sm" onClick={this.stopListening}>Stop</button>
            </div>;
        }
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
            {speechSearchBox}
            {/* <label style={{marginBottom: 0}}>Gene search</label> */}
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
                        ref={(input) => this.input = input}
                        onSuggestionSelected={this.showIsoforms}
                    />
                </Target>
                {isoformPane}
            </Manager>
        </div>
        );
    }
}

export default withCurrentGenome(SpeechRecognition(options)(GeneSearchBox));
