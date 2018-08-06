import { connect } from 'react-redux';
import { AppState } from '../AppState';

const mapStateToProps = (state: AppState) => {
    return {
        legendWidth: state.trackLegendWidth
    };
}

export const withTrackLegendWidth = connect(mapStateToProps);
