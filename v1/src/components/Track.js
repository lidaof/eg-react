import DisplayedRegionModel from '../model/DisplayedRegionModel';
import PropTypes from 'prop-types';
import React from 'react';

class Track extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            data: null
        };

        this.fetchData().then(data => {
            this.setState({
                isLoading: false,
                data: data
            });
        })
    }

    fetchData() {
        return null;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.viewRegion !== nextProps.viewRegion) {
            this.dataPromise = this.fetchData(nextProps.viewRegion).then((data) => {
                // When the data finally comes in, be sure it is still what the user wants
                if (this.props.viewRegion === nextProps.viewRegion) {
                    this.setState({
                        isLoading: false,
                        data: data,
                    });
                }
            });
            this.setState({isLoading: true});
        }
    }

    render() {
        return null;
    }
}

export default Track;

Track.PropTypes = {
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
}
