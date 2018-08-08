import { connect } from 'react-redux';
import { AppState } from '../AppState';
import { StateWithHistory } from "redux-undo";

const mapStateToProps = (state: {browser: StateWithHistory<AppState>}) => {
    return {
        legendWidth: state.browser.present.trackLegendWidth
    };
}

export const withTrackLegendWidth = connect(mapStateToProps);
