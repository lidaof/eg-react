import { connect } from 'react-redux';
import { getGenomeConfig } from '../model/genomes/allGenomes';

function getGenomeConfigFromStore(state) {
    return {
        genomeConfig: getGenomeConfig(state.genomeName)
    };
}

/**
 * Components wrapped by this function will get the current genome configuration in the `genomeConfig` prop.  The config
 * comes from the global Redux store, so there must be a Provider somewhere among the ancestors of the component.
 * 
 * @param {React.Component} WrappedComponent - Component to wrap
 * @return {React.Component} component that get the current genome configuration in the `genomeConfig` prop
 * @author Silas Hsu
 */
const withCurrentGenome = connect(getGenomeConfigFromStore);

export default withCurrentGenome;
