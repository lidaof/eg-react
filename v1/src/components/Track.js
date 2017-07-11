import React from 'react';
import PropTypes from 'prop-types';

class Track extends React.Component {
  render(){
    return <p>{this.props.data.tkdatalst[0].url}</p>;
  }
}


Track.propTypes = {
  data   : PropTypes.object.isRequired
};

export default Track;
