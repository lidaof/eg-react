import PropTypes from 'prop-types';
import React from 'react';
import Gene from '../model/Gene';
import withCurrentGenome from './withCurrentGenome';

/**
 * Text that says a gene's description.
 * 
 * @author Silas Hsu
 */
class GeneDescription extends React.PureComponent {
    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // The Gene object for which to display info
        genomeConfig: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            description: "Loading..."
        };
        props.gene.getDescription(props.genomeConfig.genome.getName()).then(description =>
            this.setState({description: description})
        ).catch(error => {
            console.error(error);
            this.setState({description: "(Error getting description)"})
        });
    }

    render() {
        return this.state.description || "(no description found)";
    }
}

export default withCurrentGenome(GeneDescription);
