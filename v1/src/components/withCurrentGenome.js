import { connect } from 'react-redux';
import allGenomes from '../model/genomes/allGenomes';

function getGenomeConfigFromStore(state) {
    return {
        genomeConfig: allGenomes[state.genomeIndex]
    };
}

const withCurrentGenome = connect(getGenomeConfigFromStore);

export default withCurrentGenome;
