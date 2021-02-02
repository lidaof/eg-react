import React from 'react';
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider';
import PropTypes from 'prop-types';
import { ITEM_PROP_TYPES } from './TrackContextMenu';

import './TrackContextMenu.css';

const sliderStyle = {  // Give the slider some width
    position: 'relative',
    width: 200,
    height: 40,
    marginLeft: '5%',
    marginTop: 10,
}

const railStyle = {
    position: 'absolute',
    width: '100%',
    height: 10,
    marginTop: 15,
    borderRadius: 5,
    backgroundColor: '#D8D8D8',
}

function Track({ source, target, getTrackProps }) {
    return (
        <div
            style={{
                position: 'absolute',
                height: 10,
                zIndex: 1,
                marginTop: 15,
                backgroundColor: '#262626',
                borderRadius: 5,
                cursor: 'pointer',
                left: `${source.percent}%`,
                width: `${target.percent - source.percent}%`,
            }}
            {...getTrackProps() /* this will set up events if you want it to be clickeable (optional) */}
        />
    )
}

export function Handle({
        handle: { id, value, percent },
        getHandleProps
    }) {
    return (
        <div
              style={{
                    left: `${percent}%`,
                    position: 'absolute',
                    marginLeft: -10,
                    marginTop: 10,
                    zIndex: 2,
                    width: 20,
                    height: 20,
                    border: 0,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    backgroundColor: '#7F7F7F',
              }}
              {...getHandleProps(id)}
        >
            <div style={{ fontFamily: 'Arial', fontSize: 12, marginTop: -20 }}>
                {value}
            </div>
        </div>
    )
}   

/**
 * A context menu item that renders a slider element for inputting data.
 * 
 * @author Arnav Moudgil
 */
class SliderConfig extends React.PureComponent {
    static propTypes = Object.assign({}, ITEM_PROP_TYPES, {
        optionName: PropTypes.string.isRequired, // The prop to change of a TrackModel's options object.
        label: PropTypes.string.isRequired, // Label for the input
        mode: PropTypes.number.isRequired, // Number of slider handles
        step: PropTypes.number.isRequired, // Slider step size
        domain: PropTypes.array.isRequired, // Range of the slider
        values: PropTypes.array.isRequired, // Values of the slider handles
    });

    static defaultProps = {
        label: "Slider",
        mode: 1,
        step: 1,
        domain: [0, 100],
        values: [100],
    };

    constructor(props) {
        super(props);
        this.state = {
            values: props.values.slice(),
            update: props.values.slice(),
        };
        this.onUpdate = props.onUpdate === undefined ? this.onUpdate.bind(this) : props.onUpdate;
        this.onChange = props.onChange === undefined ? this.onChange.bind(this) : props.onChange;
    }
    
    onUpdate = update => {
        this.setState({ update });
        this.props.onOptionSet(this.props.optionName, update);
    }
        
    onChange = values => {
        this.setState({ values })
        this.props.onOptionSet(this.props.optionName, values);
    }

    render() {
        const {label, mode, step, domain} = this.props;
        let slider =  <Slider
                        mode={mode}
                        step={step}
                        domain={domain}
                        rootStyle={sliderStyle /* inline styles for the outer div. Can also use className prop. */}
                        onUpdate={this.onUpdate}
                        onChange={this.onChange}
                        values={this.state.values}
                    >
                        <div style={railStyle /* Add a rail as a child.  Later we'll make it interactive. */} />
                        <Rail>
                            {({ getRailProps }) => (
                                <div style={railStyle} {...getRailProps()} />
                            )}
                        </Rail>
                        <Handles>
                            {({ handles, getHandleProps }) => (
                                <div className="slider-handles">
                                    {handles.map(handle => (
                                        <Handle
                                            key={handle.id}
                                            handle={handle}
                                            getHandleProps={getHandleProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Handles>
                        <Tracks right={false}>
                            {({ tracks, getTrackProps }) => (
                                <div className="slider-tracks">
                                    {tracks.map(({ id, source, target }) => (
                                        <Track
                                            key={id}
                                            source={source}
                                            target={target}
                                            getTrackProps={getTrackProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Tracks>
                    </Slider>
        return (
            <div className="TrackContextMenu-item" >
                <label style={{margin: 0}}>{label} {slider}</label>
            </div>
        );
    }
}

export default SliderConfig;
