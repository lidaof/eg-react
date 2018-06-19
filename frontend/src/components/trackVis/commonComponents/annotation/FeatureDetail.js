import PropTypes from 'prop-types';
import React from 'react';
import Feature from '../../../../model/Feature';
import '../../commonComponents/tooltip/Tooltip.css';

/**
 * Box that contains feature details when a annotation is cdivcked.
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
        <div>
            {featureName ? <div className="Tooltip-major-text" >{featureName}</div> : null}
            <div>{feature.getLocus().toString()} ({feature.getLocus().getLength()}bp)</div>
            {feature.getHasStrand() ? <div>Strand: {feature.getStrand()}</div> : null}
        </div>
        );
    }
}

export default FeatureDetail;
