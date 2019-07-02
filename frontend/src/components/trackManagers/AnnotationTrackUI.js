import React from 'react';
import PropTypes from 'prop-types';
import TrackModel from '../../model/TrackModel';
import { getSecondaryGenomes } from '../../util';
import { getGenomeConfig } from '../../model/genomes/allGenomes';
import { AnnotationTrackSelector } from './AnnotationTrackSelector';

/**
 * GUI for selecting annotation tracks to add based on genome.
 * 
 * @author Daofeng Li
 */
export class AnnotationTrackUI extends React.Component {
    static propTypes = {
        genomeConfig: PropTypes.object.isRequired,
        addedTracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        onTracksAdded: PropTypes.func,
        addedTrackSets: PropTypes.instanceOf(Set),
        groupedTrackSets: PropTypes.object,
    }

    static defaultProps = {
        onTracksAdded: () => undefined
    }

    constructor(props) {
        super(props);
        this.state = {
            secondConfigs: this.getSecondConfigs()
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.addedTracks !== this.props.addedTracks) {
            this.setState( {
                secondConfigs: this.getSecondConfigs()
            });
        }
    }

    getSecondConfigs = () => {
        const secondaryGenomes = getSecondaryGenomes(this.props.genomeConfig.genome.getName(), this.props.addedTracks);
        return secondaryGenomes.map(g => getGenomeConfig(g));
    }

    renderSecondaryUI = () => {
        const {addedTrackSets, addedTracks, onTracksAdded, groupedTrackSets} = this.props;
        return this.state.secondConfigs.map(config => 
            config ? <AnnotationTrackSelector
                key={config.genome.getName()}
                addedTracks={addedTracks}
                onTracksAdded={onTracksAdded}
                addedTrackSets={addedTrackSets}
                genomeConfig={config}
                addGenomeLabel={true}
                groupedTrackSets={groupedTrackSets}
            /> : null
            );
    }

    render() {
        const {addedTrackSets, addedTracks, onTracksAdded, genomeConfig, groupedTrackSets} = this.props;
        return <React.Fragment>
                    <AnnotationTrackSelector
                        addedTracks={addedTracks}
                        onTracksAdded={onTracksAdded}
                        addedTrackSets={addedTrackSets}
                        genomeConfig={genomeConfig}
                        groupedTrackSets={groupedTrackSets}
                    />
                    {this.renderSecondaryUI()}
                </React.Fragment>;
    }
}

