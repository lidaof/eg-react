import PropTypes from "prop-types";
import React from "react";
import Feature from "../../../../model/Feature";
import "../../commonComponents/tooltip/Tooltip.css";
import { CopyToClip } from "../../../../components/CopyToClipboard";

/**
 * Box that contains feature details when a annotation is cdivcked.
 *
 * @author Silas Hsu
 */
class FeatureDetail extends React.PureComponent {
    static propTypes = {
        feature: PropTypes.instanceOf(Feature).isRequired, // The Feature object for which to display info
        category: PropTypes.object,
    };

    render() {
        const { feature, category } = this.props;
        const featureName = category ? category[feature.getName()].name : feature.getName();
        let linkOut;
        if (feature.id) {
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
            } else if (feature.id.startsWith("PF3D7")) {
                const plasmodbURL = `https://plasmodb.org/plasmo/app/record/gene/${feature.id}`;
                linkOut = (
                    <a href={plasmodbURL} target="_blank" rel="noopener noreferrer">
                        PlasmoDB
                        <span role="img" aria-label="PlasmoDB">
                            🔗
                        </span>
                    </a>
                );
            } else if (feature.id.startsWith("Cre")) {
                const plasmodbURL = `https://phytozome.jgi.doe.gov/phytomine/portal.do?class=Protein&externalids=${feature.id}`;
                linkOut = (
                    <a href={plasmodbURL} target="_blank" rel="noopener noreferrer">
                        Phytozome
                        <span role="img" aria-label="Phytozome">
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
