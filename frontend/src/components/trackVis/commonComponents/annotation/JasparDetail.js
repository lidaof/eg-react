import PropTypes from "prop-types";
import React from "react";
import "../../commonComponents/tooltip/Tooltip.css";
import { JasparFeature } from "../../../../model/Feature";

/**
 * Box that contains jaspar TF details when an annotation is clicked.
 *
 * @author Daofeng Li
 */
class JasparDetail extends React.PureComponent {
    static propTypes = {
        feature: PropTypes.instanceOf(JasparFeature).isRequired, // The Feature object for which to display info
    };

    render() {
        const { feature } = this.props;
        const tfName = feature.getName();
        const matrixId = feature.matrixId;
        const suffix = feature.strand === "-" ? "?revcomp=1" : "";
        const rc = feature.strand === "-" ? ".rc" : "";
        const queryURL = `https://jaspar.genereg.net/matrix/${matrixId}/${suffix}`;
        const logoURL = `https://jaspar.genereg.net/static/logos/all/svg/${matrixId}${rc}.svg`;
        const linkOut = (
            <a href={queryURL} target="_blank" rel="noopener noreferrer">
                view in Jaspar database
                <span role="img" aria-label="jaspar">
                    🔗
                </span>
            </a>
        );

        return (
            <div>
                {tfName ? <div className="Tooltip-major-text">{tfName}</div> : null}
                {matrixId ? (
                    <div>
                        {matrixId} {linkOut}
                    </div>
                ) : null}
                <div>Score: {feature.score}</div>
                <div>
                    <img
                        alt={matrixId}
                        className="img-fluid"
                        style={{ maxWidth: "100%", height: 225 }}
                        src={logoURL}
                        align="center"
                    />
                </div>
                <div>
                    {feature.getLocus().toString()} ({feature.getLocus().getLength()}bp)
                </div>
                {feature.getHasStrand() ? <div>Strand: {feature.getStrand()}</div> : null}
            </div>
        );
    }
}

export default JasparDetail;
