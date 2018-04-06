import React from 'react';
import PropTypes from 'prop-types';
import './MetadataSelectionMenu.css';

const SUGGESTED_TERMS = ["Track type", "Sample", "Assay"];

/**
 * Menu that selects metadata terms to be used in our track metadata indicators.
 * 
 * @author Silas Hsu
 */
class MetadataSelectionMenu extends React.PureComponent {
    static propTypes = {
        terms: PropTypes.arrayOf(PropTypes.string), // Current displayed metadata terms,
        style: PropTypes.object, // CSS
        /*
         * Callback for when a new term list has been configured.  Signature: (newTerms: string[]): void
         */
        onNewTerms: PropTypes.func
    };

    static defaultProps = {
        terms: [],
        onNewTerms: () => undefined
    };

    constructor(props) {
        super(props);
        this.state = {
            customTerm: ""
        };
        this.handleAddCustomTerm = this.handleAddCustomTerm.bind(this);
    }

    /**
     * Requests that an additional metadata term be added to the UI
     * 
     * @param {string} term - term to add
     */
    addTerm(term) {
        this.props.onNewTerms(this.props.terms.concat([term]));
    }

    /**
     * Requests that a metadata term be removed from the UI.
     * 
     * @param {string} termToRemove 
     */
    removeTerm(termToRemove) {
        const newTerms = this.props.terms.filter(term => term !== termToRemove);
        if (newTerms.length < this.props.terms.length) {
            this.props.onNewTerms(newTerms);
        }
    }

    /**
     * Handles request to add a custom metadata term.
     */
    handleAddCustomTerm() {
        const customTerm = this.state.customTerm;
        if (customTerm.length > 0 && !this.props.terms.includes(customTerm)) {
            this.addTerm(customTerm);
        }
        this.setState({customTerm: ""});
    }

    /**
     * @return {JSX.Element} UI that displays list of currently displayed terms
     */
    renderTerms() {
        const items = this.props.terms.map(
            term => <li key={term}><button onClick={() => this.removeTerm(term)} >x</button> {term}</li>
        );
        return <ul>{items}</ul>;
    }

    /**
     * @return {JSX.Element} UI that displays list of suggested terms to add
     */
    renderSuggestedTerms() {
        const currentTerms = new Set(this.props.terms);
        let items = [];
        for (let term of SUGGESTED_TERMS) {
            if (!currentTerms.has(term)) {
                items.push(<li key={term}><button onClick={() => this.addTerm(term)} >+</button> {term}</li>);
            }
        }
        return <ul>{items}</ul>;
    }

    render() {
        return (
        <div className="MetadataSelectionMenu" style={this.props.style} >
            <h5>Current terms</h5>
            {this.renderTerms()}
            <h5>Suggested terms</h5>
            {this.renderSuggestedTerms()}
            <h5>Custom term</h5>
            <input
                type="text"
                value={this.state.customTerm}
                onChange={event => this.setState({customTerm: event.target.value})}
            />
            <button onClick={this.handleAddCustomTerm} >+</button>
        </div>
        );
    }
}

export default MetadataSelectionMenu;
