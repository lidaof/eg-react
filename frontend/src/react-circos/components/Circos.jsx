import React from 'react';
import PropTypes from 'prop-types';
import CircosJS from 'circos';
import { TRACK_TYPES } from '../tracks';

class Circos extends React.Component {
  constructor(props) {
    super(props);
    this.circos = null;
    this.renderCircos = this.renderCircos.bind(this);
  }

  componentDidMount() {
    this.circos = new CircosJS({
      container: this.ref,
      width: this.props.size,
      height: this.props.size,
    });
    this.renderCircos();
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      this.renderCircos();
    }
  }

  renderCircos() {
    const {
      layout, config, tracks,
    } = this.props;
    this.circos.layout(layout, config || {});
    tracks.forEach((track, index) => {
      const {
        id,
        data,
        config: trackConfig,
        type,
      } = track;
      this.circos[type.toLowerCase()](id || `track-${index}`, data, trackConfig);
    });
    this.circos.render();
  }

  render() {
    return <div ref={(ref) => { this.ref = ref; }} />;
  }
}

Circos.defaultProps = {
  config: {},
  size: 800,
  tracks: [],
};
Circos.propTypes = {
  layout: PropTypes.arrayOf(PropTypes.shape({
    len: PropTypes.number.isRequired,
    color: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  })).isRequired,
  config: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  size: PropTypes.number,
  tracks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    data: PropTypes.array.isRequired,
    config: PropTypes.object, // eslint-disable-line react/forbid-prop-types
    type: PropTypes.oneOf(TRACK_TYPES),
  })),
};

export default Circos;
