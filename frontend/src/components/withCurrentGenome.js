import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getGenomeConfig } from '../model/genomes/allGenomes';

function getGenomeConfigFromStore(state) {
    return {
        genomeConfig: getGenomeConfig(state.browser.present.genomeName)
    };
}

/**
 * Enhances input component classes so they automatically get the current genome configuration in the `genomeConfig`
 * prop.  The config comes from the global Redux store, so there must be a Provider somewhere among the ancestors.
 * 
 * Consumed props: none
 * 
 * Injected props:
 *   - {Object} `genomeConfig` - current global genome configuration
 * 
 * @param {typeof React.Component} WrappedComponent - Component class to enhance
 * @return {typeof React.Component} component class that get the current genome configuration in the `genomeConfig` prop
 * @author Silas Hsu
 */
const withCurrentGenome = connect(getGenomeConfigFromStore);
withCurrentGenome.INJECTED_PROPS = {
    genomeConfig: PropTypes.object,
};

export default withCurrentGenome;
