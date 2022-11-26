import React from "react";
import PropTypes from "prop-types";
import MetadataSelectionMenu from "./MetadataSelectionMenu";
import MetadataIndicator from "../trackVis/commonComponents/MetadataIndicator";
import "./MetadataHeader.css";

class MetadataHeader extends React.PureComponent {
    static propTypes = {
        terms: PropTypes.arrayOf(PropTypes.string),
        onNewTerms: PropTypes.func,
        suggestedMetaSets: PropTypes.instanceOf(Set),
    };

    static defaultProps = {
        terms: [],
        onNewTerms: () => undefined,
    };

    constructor(props) {
        super(props);
        this.state = {
            isShowingEditMenu: false,
        };
    }

    render() {
        const termWidth = MetadataIndicator.WIDTH;
        const editMenuStyle = this.state.isShowingEditMenu ? undefined : { display: "none" };
        const suffix = this.state.isShowingEditMenu ? "↩" : "»";
        const buttonStyle = this.state.isShowingEditMenu
            ? " btn btn-sm btn-danger dense-button "
            : "btn btn-sm btn-success dense-button";
        return (
            <>
                <div className="MetadataHeader-button">
                    <button
                        onClick={() => this.setState({ isShowingEditMenu: !this.state.isShowingEditMenu })}
                        className={buttonStyle}
                    >
                        Metadata {suffix}
                    </button>
                    <div>
                        <MetadataSelectionMenu
                            terms={this.props.terms}
                            style={editMenuStyle}
                            onNewTerms={this.props.onNewTerms}
                            suggestedMetaSets={this.props.suggestedMetaSets}
                        />
                    </div>
                </div>

                <div className="MetadataHeader-container" style={{ marginLeft: 50 }}>
                    <ul className="MetadataHeader-terms">
                        {this.props.terms.map((term) => (
                            <li key={term} style={{ width: termWidth, fontSize: termWidth * 0.75 }}>
                                {term}
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        );
    }
}

export default MetadataHeader;
