import PropTypes from "prop-types";
import { connect } from "react-redux";
import { getGenomeConfig } from "../model/genomes/allGenomes";
import AppState from "AppState";
import SnackbarEngine from "SnackbarEngine";

let multipleGenomesWarned = false;

function getGenomeConfigFromStore(state: { browser: { present: AppState, past: AppState[], future: AppState[] } }) {
    const present = state.browser.present;
    if (!(present.containers && present.containers.length && present.containers[0].genomes && present.containers[0].genomes.length)) return { genomeConfig: null }
    if (!multipleGenomesWarned && (present.containers.length > 1 || present.containers[0].genomes.length > 1)) {
        SnackbarEngine.warning("Something here doesn't completely support multiple genomes. You might run into issues.");
        multipleGenomesWarned = true;
    }
    return {
        genomeConfig: present.containers[0].genomes[0].genomeConfig ||
            getGenomeConfig(present.containers[0].genomes[0].name)
    }
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
// @ts-ignore
withCurrentGenome.INJECTED_PROPS = {
    genomeConfig: PropTypes.object
};

export default withCurrentGenome;
