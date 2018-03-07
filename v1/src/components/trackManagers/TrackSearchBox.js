import Autosuggest from 'react-autosuggest';
import PropTypes from "prop-types";
import React from "react";
import '../../autosuggest.css';

const HIERARCHY_DELIMITER = ' > ';

class TrackSearchBox extends React.Component {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.object),
        metadataPropToSearch: PropTypes.string,
        onChange: PropTypes.func
    }

    static defaultProps = {
        tracks: []
    }

    constructor(props) {
        super(props);
        this.state = {
            suggestions: [],
            inputValue: "",
        };
        this.getSuggestions = this.getSuggestions.bind(this);
        this.getSuggestionValue = this.getSuggestionValue.bind(this);
        this.renderSuggestion = this.renderSuggestion.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    _isSameArray(array1, array2, numElementsToCompare) {
        for (let i = 0; i < numElementsToCompare; i++) {
            if (array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    }

    getSuggestions(suggestionEvent) {
        let inputHierarchy = suggestionEvent.value.split(HIERARCHY_DELIMITER);
        let suggestions = new Set();
        for (let track of this.props.tracks) {
            let trackHierarchy = track.metadata[this.props.metadataPropToSearch];
            if (!this._isSameArray(trackHierarchy, inputHierarchy, inputHierarchy.length - 1)) {
                continue;
            }

            let rightmostInputCategory = inputHierarchy[inputHierarchy.length - 1]; // The last one
            let matchingTrackCategory = trackHierarchy[inputHierarchy.length - 1]; // Same index as above
            if (!matchingTrackCategory) {
                continue;
            }

            if (matchingTrackCategory.toLowerCase().startsWith(rightmostInputCategory.toLowerCase())) {
                if (matchingTrackCategory === rightmostInputCategory) { // Exclude exact matches
                    continue;
                } else if (inputHierarchy.length < trackHierarchy.length) { // Still potentially more subcategories
                    suggestions.add(matchingTrackCategory + HIERARCHY_DELIMITER);
                } else {
                    suggestions.add(matchingTrackCategory);
                }
            }
        }

        this.setState({suggestions: Array.from(suggestions.values())});
    }

    /**
     * Gets the value to be put into the input box given an element of this.state.suggestions was selected.
     * @param {*} suggestion 
     * @return {string} 
     */
    getSuggestionValue(suggestion) {
        let lastIndexOfSplit = this.state.inputValue.lastIndexOf(HIERARCHY_DELIMITER);
        if (lastIndexOfSplit < 0) {
            return suggestion;
        }
        let startReplaceIndex = this.state.inputValue.lastIndexOf(HIERARCHY_DELIMITER) + HIERARCHY_DELIMITER.length;
        return this.state.inputValue.substring(0, startReplaceIndex) + suggestion;
    }

    /**
     * Given an element of this.state.suggestions, returns a element or string to be rendered.
     * @param {*} suggestion 
     */
    renderSuggestion(suggestion) {
        return suggestion;
    }

    onChange(event, {newValue}) {
        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
        this.setState({inputValue: newValue})
    }

    render() {
        return (
        <Autosuggest
            suggestions={this.state.suggestions}
            onSuggestionsFetchRequested={this.getSuggestions}
            onSuggestionsClearRequested={() => this.setState({suggestions: []})}
            getSuggestionValue={this.getSuggestionValue}
            alwaysRenderSuggestions={true}
            renderSuggestion={this.renderSuggestion}
            inputProps={{
                placeholder: "Filter...",
                value: this.state.inputValue,
                onChange: this.onChange,
                style: {width: "100%"}
            }}
            shouldRenderSuggestions={value => true}
        />
        );
    }
}

export default TrackSearchBox;
