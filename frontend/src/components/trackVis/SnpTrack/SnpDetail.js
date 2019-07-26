import PropTypes from 'prop-types';
import React from 'react';
import Snp from '../../../model/Snp';
import '../commonComponents/tooltip/Tooltip.css';

/**
 * Box that contains snp details when a annotation is clicked.
 * 
 * @author Silas Hsu
 */
class SnpDetail extends React.PureComponent {
    static propTypes = {
        snp: PropTypes.instanceOf(Snp).isRequired, // The Feature object for which to display info
    };

    render() {
        const {snp} = this.props;
        const ncbiURL = `https://www.ncbi.nlm.nih.gov/snp/?term=${snp.id}`;
        const ncbiLink =  <a href={ncbiURL} target="_blank" rel="noopener noreferrer">dbSNP<span role="img" aria-label="dbsnp">🔗</span></a>;
        
        return (
        <div>
            <div>{snp.id} {ncbiLink}</div> 
            <div>{snp.getLocus().toString()} ({snp.getLocus().getLength()}bp)</div>
            {snp.getHasStrand() ? <div>Strand: {snp.getStrand()}</div> : null}
        </div>
        );
    }
}

export default SnpDetail;
