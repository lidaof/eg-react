import React from 'react';
import PropTypes from 'prop-types';
import MetadataSelectionMenu from './MetadataSelectionMenu';
import MetadataIndicator from '../trackVis/commonComponents/MetadataIndicator';
import './MetadataHeader.css';

class MetadataHeader extends React.PureComponent {
    static propTypes = {
        terms: PropTypes.arrayOf(PropTypes.string),
        onNewTerms: PropTypes.func,
    };

    static defaultProps = {
        terms: [],
        onNewTerms: () => undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            isShowingEditMenu: false
        };
    }

    render() {
        const termWidth = MetadataIndicator.WIDTH;
        const editMenuStyle = this.state.isShowingEditMenu ? undefined : {display: "none"};
        return (
        <div className="MetadataHeader-container" >
            <MetadataSelectionMenu terms={this.props.terms} style={editMenuStyle} onNewTerms={this.props.onNewTerms} />
            <ul className="MetadataHeader-terms">
                <li onClick={() => this.setState({isShowingEditMenu: !this.state.isShowingEditMenu})} >Edit...</li>
                {
                this.props.terms.map(term =>
                    <li key={term} style={{width: termWidth, fontSize: termWidth * 0.75}} >{term}</li>
                )
                }
            </ul>
        </div>
        );
    }
}

export default MetadataHeader;
