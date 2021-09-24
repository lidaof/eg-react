import PropTypes from "prop-types";
import React from "react";
import _ from "lodash";
import { CopyToClip } from "../../../components/CopyToClipboard";
import Vcf from "model/Vcf";

import "../commonComponents/tooltip/Tooltip.css";

const SAMPLE_ROWS_THRESHOLD = 10;

/**
 * Box that contains details when a VCF is clicked.
 *
 * @author Daofeng Li
 */
class VcfDetail extends React.PureComponent {
    static propTypes = {
        vcf: PropTypes.instanceOf(Vcf).isRequired, // The Feature object for which to display info
    };

    render() {
        const { vcf } = this.props;
        const vcfId = vcf.variant.ID;
        let linkOut,
            trimmed = {};
        if (vcfId) {
            if (vcfId.length === 1) {
                const ncbiURL = `https://www.ncbi.nlm.nih.gov/snp/${vcfId[0]}`;
                linkOut = (
                    <a href={ncbiURL} target="_blank" rel="noopener noreferrer">
                        {vcfId[0]}
                        <span role="img" aria-label="dbSNP">
                            🔗
                        </span>
                    </a>
                );
            } else {
                linkOut = vcfId.map((rs) => (
                    <a
                        key={rs}
                        href={`https://www.ncbi.nlm.nih.gov/snp/${rs}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {rs}
                        <span role="img" aria-label="dbSNP">
                            🔗
                        </span>
                    </a>
                ));
            }
        }
        const sampleKeys = Object.keys(vcf.variant.SAMPLES);
        sampleKeys.slice(0, SAMPLE_ROWS_THRESHOLD).forEach((k) => (trimmed[k] = vcf.variant.SAMPLES[k]));
        return (
            <div>
                {vcfId ? (
                    <div className="Tooltip-major-text">
                        {linkOut} <CopyToClip value={vcfId.join(", ")} />
                    </div>
                ) : null}
                <div>
                    <table className="table table-sm" style={{ marginBottom: 0, lineHeight: 1 }}>
                        <tbody>
                            <tr>
                                <th>REF</th>
                                <td>{vcf.variant.REF}</td>
                            </tr>
                            <tr>
                                <th>ALT</th>
                                <td>{vcf.variant.ALT.join(", ")}</td>
                            </tr>
                            <tr>
                                <th>QUAL</th>
                                <td>{vcf.variant.QUAL}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div>
                        {vcf.getLocus().toString()} ({vcf.getLocus().getLength()}bp)
                    </div>
                    <div>{infoAsTable(vcf.variant.INFO)}</div>
                    <div>
                        {sampleKeys.length > 0 && <span>Sample count: {sampleKeys.length}</span>}
                        {sampleKeys.length > SAMPLE_ROWS_THRESHOLD && (
                            <span>Showing first {SAMPLE_ROWS_THRESHOLD} samples:</span>
                        )}
                        {!_.isEmpty(trimmed) && samplesAsTable(trimmed)}
                    </div>
                </div>
            </div>
        );
    }
}

export default VcfDetail;

const samplesAsTable = (samples) => {
    if (!samples) return null;
    const rows = Object.keys(samples);
    const cols = Object.keys(samples[rows[0]]);
    const trs = rows.map((row, idx) => {
        return (
            <tr key={idx}>
                <td>{row}</td>
                {cols.map((col, idx) => (
                    <td key={idx}>
                        {Array.isArray(samples[row][col]) ? samples[row][col].join(",") : samples[row][col]}
                    </td>
                ))}
            </tr>
        );
    });
    const header = (
        <tr>
            <th>Sample</th>
            {cols.map((col, idx) => (
                <th key={idx}>{col}</th>
            ))}
        </tr>
    );
    return (
        <table
            className="table table-bordered table-striped table-sm"
            style={{ marginBottom: 0, lineHeight: 1, fontSize: 12 }}
        >
            <tbody>
                {header}
                {trs}
            </tbody>
        </table>
    );
};

const infoAsTable = (info) => {
    if (!info) return null;
    const cols = Object.keys(info);
    const trs = (
        <tr>
            {cols.map((col, idx) => (
                <td key={idx}>
                    {Array.isArray(info[col])
                        ? _.truncate(info[col].join(","), {
                              length: 75,
                              separator: /[,; ]/,
                          })
                        : info[col]}
                </td>
            ))}
        </tr>
    );
    const header = (
        <tr>
            {cols.map((col, idx) => (
                <th key={idx}>{col}</th>
            ))}
        </tr>
    );
    return (
        <table
            className="table table-bordered table-striped table-sm"
            style={{ marginBottom: 0, lineHeight: 1, fontSize: 12 }}
        >
            <tbody>
                {header}
                {trs}
            </tbody>
        </table>
    );
};
