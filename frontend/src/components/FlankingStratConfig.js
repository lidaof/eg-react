import React from 'react';
import PropTypes from 'prop-types';
import FlankingStrategy from '../model/FlankingStrategy';

class FlankingStratConfig extends React.Component {
    static propTypes = {
        strategy: PropTypes.instanceOf(FlankingStrategy).isRequired,
        onNewStrategy: PropTypes.func,
    };

    static defaultProps = {
        onNewStrategy: () => undefined
    };

    inputChanged(propToChange, value) {
        const newStrat = this.props.strategy.cloneAndSetProp(propToChange, value);
        this.props.onNewStrategy(newStrat);
    }

    render() {
        return (
        <div>
            <h6>3. Set flanking region</h6>
            <label>
                Upstream bases: <input
                    type="number"
                    min={0}
                    value={this.props.strategy.upstream}
                    onChange={event => this.inputChanged("upstream", Number.parseInt(event.target.value, 10) || 0)}
                />
            </label> <label>
                Downstream bases: <input
                    type="number"
                    min={0}
                    value={this.props.strategy.downstream}
                    onChange={event => this.inputChanged("downstream", Number.parseInt(event.target.value, 10) || 0)}
                />
            </label> <label>
                Surrounding: <select
                    value={this.props.strategy.type}
                    onChange={event => this.inputChanged("type", Number.parseInt(event.target.value, 10))}
                >
                    <option value={FlankingStrategy.SURROUND_ALL}>Gene body</option>
                    <option value={FlankingStrategy.SURROUND_START}>Transcription start</option>
                    <option value={FlankingStrategy.SURROUND_END}>Transcription end</option>
                </select>
            </label>
        </div>
        );
    }
}

export default FlankingStratConfig;
