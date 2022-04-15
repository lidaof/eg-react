import PropTypes from "prop-types";
import React from "react";
import FeatureDetail from "../commonComponents/annotation/FeatureDetail";
import Gene from "../../../model/Gene";
import { GeneAnnotation } from "./GeneAnnotation";
import { safeParseJsonString, variableIsObject } from "../../../util";

import "../commonComponents/tooltip/Tooltip.css";

/**
 * Box that contains gene details when a gene annotation is clicked.
 *
 * @author Silas Hsu
 */
class GeneDetail extends React.PureComponent {
    static propTypes = {
        gene: PropTypes.instanceOf(Gene).isRequired, // The Gene object for which to display info
        collectionName: PropTypes.string.isRequired,
        queryEndpoint: PropTypes.object,
    };

    render() {
        const { gene } = this.props;
        const colors = GeneAnnotation.getDrawColors(gene);
        const desc = safeParseJsonString(gene.description);
        let descContent;
        if (variableIsObject(desc)) {
            let rows;
            if (desc.hasOwnProperty("maneStat")) {
                rows = (
                    <>
                        <tr>
                            <td colSpan={2}>
                                <i style={{ wordBreak: "break-word" }}>{desc.description}</i>
                            </td>
                        </tr>
                        <tr>
                            <td>Ensembl id:</td>
                            <td>
                                <a
                                    href={`https://www.ensembl.org/Homo_sapiens/Transcript/Summary?t=${desc["Ensembl id"]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {desc["Ensembl id"]}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>Ensembl gene:</td>
                            <td>
                                <a
                                    href={`https://www.ensembl.org/homo_sapiens/Gene/Summary?g=${desc["Ensembl gene"]}&db=core}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {desc["Ensembl gene"]}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>Ensembl protein:</td>
                            <td>
                                <a
                                    href={`https://www.ensembl.org/Homo_sapiens/Transcript/Summary?t=${desc["Ensembl protein"]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {desc["Ensembl protein"]}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>NCBI id:</td>
                            <td>
                                <a
                                    href={`https://www.ncbi.nlm.nih.gov/nuccore/${desc["NCBI id"]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {desc["NCBI id"]}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>NCBI gene:</td>
                            <td>{desc["NCBI gene"]}</td>
                        </tr>
                        <tr>
                            <td>NCBI protein:</td>
                            <td>
                                <a
                                    href={`https://www.ncbi.nlm.nih.gov/nuccore/${desc["NCBI protein"]}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {desc["NCBI protein"]}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>MANE transcript status:</td>
                            <td>{desc.maneStat}</td>
                        </tr>
                    </>
                );
            } else {
                rows = Object.entries(desc).map((item, index) => (
                    <tr key={index}>
                        <td>{item[0]}:</td>
                        <td>{item[1]}</td>
                    </tr>
                ));
            }
            descContent = (
                <table className="table table-sm table-striped">
                    <tbody>{rows}</tbody>
                </table>
            );
        } else {
            descContent = <i style={{ wordBreak: "break-word" }}>{desc}</i>;
        }
        return (
            <div style={{ maxWidth: 400 }}>
                <FeatureDetail feature={gene} queryEndpoint={this.props.queryEndpoint} />
                {descContent}
                <div>
                    {gene.transcriptionClass && (
                        <span>
                            Transcription class: <span style={{ color: colors.color }}>{gene.transcriptionClass}</span>
                        </span>
                    )}
                </div>
            </div>
        );
    }
}

export default GeneDetail;
