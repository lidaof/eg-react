import PropTypes from 'prop-types';
import React from 'react';
import Feature from '../../../../model/Feature';
import '../../commonComponents/Tooltip.css';

/**
 * Box that contains feature details when a annotation is clicked.
 * 
 * @author Silas Hsu
 */
class FeatureDetail extends React.PureComponent {
    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // The Feature object for which to display info
    };

    render() {
        const feature = this.props.feature;
        const featureName = feature.getName();
        return (
        <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
            {featureName ? <li className="Tooltip-major-text" >{featureName}</li> : null}
            <li>{`${feature.getLocus().toString()} (${feature.getLocus().getLength()}bp)`}</li>
            {feature.getHasStrand() ? <li>Strand: {feature.getStrand()}</li> : null}
        </ul>
        );
    }
}

export default FeatureDetail;
