import React from 'react';
import PropTypes from 'prop-types';
import MetadataIndicator from '../track/MetadataIndicator';
import './MetadataHeader.css';

class MetadataHeader extends React.PureComponent {
    static propTypes = {
        terms: PropTypes.arrayOf(PropTypes.string)
    };

    static defaultProps = {
        terms: []
    };

    render() {
        return (
        <div className="MetadataHeader-container" >
            <ul>
                <li>Add metadata...</li>
                {this.props.terms.map(term => <li key={term} style={{width: MetadataIndicator.WIDTH}} >{term}</li>)}
            </ul>
        </div>
        );
    }
}

export default MetadataHeader;
