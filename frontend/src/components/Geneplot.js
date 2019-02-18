import React from 'react';
import { connect } from 'react-redux';
import RegionSetSelector from './RegionSetSelector';

function mapStateToProps(state) {
    return {
        sets: state.browser.present.regionSets,
        selectedSet: state.browser.present.regionSetView,
    };
}

class Geneplot extends React.Component {
    render(){
        const {sets, genome} = this.props;
        if(sets.length === 0) {
            return <div>
                <p>There is no region set yet, please submit a region set below.</p>
                <RegionSetSelector genome={genome} />
            </div>
        }
        return <div>geneplot</div>;
    }
}

export default connect(mapStateToProps)(Geneplot);