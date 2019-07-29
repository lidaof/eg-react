import PropTypes from 'prop-types';
import React from 'react';
import Feature from '../../../../model/Feature';
import '../../commonComponents/tooltip/Tooltip.css';
import { CopyToClip } from '../../../../components/CopyToClipboard';

/**
 * Box that contains feature details when a annotation is cdivcked.
 * 
 * @author Silas Hsu
 */
class FeatureDetail extends React.PureComponent {
    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // The Feature object for which to display info
        category: PropTypes.object,
    };

    render() {
        const {feature, category} = this.props;
        const featureName = category ? category[feature.getName()].name: feature.getName();
        let ncbiLink, ncbiURL, ensemblLink, ensemblURL;
        if (feature.id) {
            ncbiURL = `https://www.ncbi.nlm.nih.gov/gene/?term=${feature.id.split('.')[0]}`;
            ensemblURL = `http://www.ensembl.org/Multi/Search/Results?q=${feature.id}`;
            ncbiLink =  <a href={ncbiURL} target="_blank" rel="noopener noreferrer">NCBI<span role="img" aria-label="NCBI">🔗</span></a>;
            ensemblLink =  <a href={ensemblURL} target="_blank" rel="noopener noreferrer">Ensembl<span role="img" aria-label="Ensembl">🔗</span></a>;
        }
        
        return (
        <div>
            {featureName ? <div className="Tooltip-major-text" >{featureName} <CopyToClip value={featureName}/> </div> : null}
            {feature.id ? <div>{feature.id} {ncbiLink} {ensemblLink}</div> : null}
            <div>{feature.getLocus().toString()} ({feature.getLocus().getLength()}bp)</div>
            {feature.getHasStrand() ? <div>Strand: {feature.getStrand()}</div> : null}
        </div>
        );
    }
}

export default FeatureDetail;
