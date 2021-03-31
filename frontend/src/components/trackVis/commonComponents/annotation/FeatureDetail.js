import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";
import Feature from "../../../../model/Feature";
import "../../commonComponents/tooltip/Tooltip.css";
import { CopyToClip } from "../../../../components/CopyToClipboard";

/**
 * Box that contains feature details when an annotation is clicked.
 *
 * @author Silas Hsu
 */
class FeatureDetail extends React.PureComponent {
    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // The Feature object for which to display info
        category: PropTypes.object,
        queryEndpoint: PropTypes.object,
    };

    render() {
        const { feature, category, queryEndpoint } = this.props;
        const featureName = category ? category[feature.getName()].name : feature.getName();
        let linkOut;
        if (feature.id) {
            if (_.isEmpty(queryEndpoint)) {
                if (feature.id.startsWith("ENS")) {
                    // given the ensembl naming pattern: https://uswest.ensembl.org/info/genome/stable_ids/index.html
                    const ensemblURL = `http://www.ensembl.org/Multi/Search/Results?q=${feature.id}`;
                    linkOut = (
                        <a href={ensemblURL} target="_blank" rel="noopener noreferrer">
                            Ensembl
                            <span role="img" aria-label="Ensembl">
                                🔗
                            </span>
                        </a>
                    );
                } else {
                    const ncbiURL = `https://www.ncbi.nlm.nih.gov/gene/?term=${feature.id.split(".")[0]}`;
                    linkOut = (
                        <a href={ncbiURL} target="_blank" rel="noopener noreferrer">
                            NCBI
                            <span role="img" aria-label="NCBI">
                                🔗
                            </span>
                        </a>
                    );
                }
            } else {
                const queryURL = `${queryEndpoint.endpoint}${feature.id}`;
                linkOut = (
                    <a href={queryURL} target="_blank" rel="noopener noreferrer">
                        {queryEndpoint.name}
                        <span role="img" aria-label={queryEndpoint.name}>
                            🔗
                        </span>
                    </a>
                );
            }
        }

        return (
            <div>
                {featureName ? (
                    <div className="Tooltip-major-text">
                        {featureName} <CopyToClip value={featureName} />{" "}
                    </div>
                ) : null}
                {feature.id ? (
                    <div>
                        {feature.id} {linkOut}
                    </div>
                ) : null}
                <div>
                    {feature.getLocus().toString()} ({feature.getLocus().getLength()}bp)
                </div>
                {feature.getHasStrand() ? <div>Strand: {feature.getStrand()}</div> : null}
            </div>
        );
    }
}

export default FeatureDetail;
