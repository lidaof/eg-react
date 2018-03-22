import { connect } from 'react-redux';
import allGenomes from '../model/genomes/allGenomes';

function mapStateToProps(state) {
    return {
        genomeConfig: allGenomes[state.genomeIndex]
    };
}

const withCurrentGenome = connect(mapStateToProps);

export default withCurrentGenome;
