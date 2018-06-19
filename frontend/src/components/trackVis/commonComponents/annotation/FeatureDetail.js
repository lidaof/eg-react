import PropTypes from 'prop-types';
import React from 'react';
import Feature from '../../../../model/Feature';
import '../../commonComponents/tooltip/Tooltip.css';

/**
 * Box that contains feature details when a annotation is clicked.
 * 
 * @author Silas Hsu
 */
class FeatureDetail extends React.PureComponent {
    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // The Feature object for which to display info
        extraDetails: PropTypes.node, // Arbitrary additional contents to render
    };

    render() {
        const {feature, extraDetails} = this.props;
        const featureName = feature.getName();
        return (
        <ul style={{margin: 0, padding: '0px 5px 5px', listStyleType: 'none'}} >
            {featureName ? <li className="Tooltip-major-text" >{featureName}</li> : null}
            <li>{`${feature.getLocus().toString()} (${feature.getLocus().getLength()}bp)`}</li>
            {feature.getHasStrand() ? <li>Strand: {feature.getStrand()}</li> : null}
            <li>{extraDetails}</li>
        </ul>
        );
    }
}

export default FeatureDetail;
