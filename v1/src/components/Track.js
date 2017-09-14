import DataSource from '../dataSources/DataSource';
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

        this.props.dataSource.getData(this.props.viewRegion).then(data => {
            this.setState({
                isLoading: false,
                data: data
            });
        })
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.viewRegion !== nextProps.viewRegion) {
            this.props.dataSource.getData(nextProps.viewRegion).then((data) => {
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

Track.propTypes = {
    dataSource: PropTypes.instanceOf(DataSource).isRequired,
    viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
    newRegionCallback: PropTypes.func.isRequired,
}
