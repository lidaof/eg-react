import React from "react";
import PropTypes from "prop-types";
import JSON5 from "json5";
import { TrackModel } from "../model/TrackModel";
import { TrackOptionsUI } from "./trackManagers/TrackOptionsUI";
import { HELP_LINKS } from "../util";

import "./TextTrack.css";

const TEXT_TYPE_DESC = {
    bed: {
        label: "bed",
        desc: "text file in BED format, each column is separated by tab",
        example: `chr1	13041	13106	reg1	1	+
chr1	753329	753698	reg2	2	+
chr1	753809	753866	reg3	3	+
chr1	754018	754252	reg4	4	+
chr1	754361	754414	reg5	5	+
chr1	754431	754492	reg6	6	+
chr1	755462	755550	reg7	7	+
chr1	761040	761094	reg8	8	+
chr1	787470	787560	reg9	9	+
chr1	791123	791197	reg10	10	+`,
    },
    bedGraph: {
        label: "bedGraph",
        desc: "text file in bedGraph format, 4 columns bed file, each column is chromosome, start, end and value",
        example: `chr6	52155366	52155379	14
chr6	52155379	52155408	13
chr6	52155408	52155426	12
chr6	52155426	52155433	11
chr6	52155433	52155442	10
chr6	52155442	52155446	9
chr6	52155446	52155472	8
chr6	52155472	52155475	9
chr6	52155475	52155499	8
chr6	52155499	52155501	7`,
    },
    refBed: {
        label: "refBed gene annotation",
        desc: "gene annotation track in refBed format",
        example: `chr1	11868	14409	11868	11868	+	DDX11L1	ENST00000456328.2	pseudo	11868,12612,13220,	12227,12721,14409,	Homo sapiens DEAD/H (Asp-Glu-Ala-Asp/His) box helicase 11 like 1 (DDX11L1), non-coding RNA.
chr1	29553	31097	29553	29553	+	MIR1302-11	ENST00000473358.1	nonCoding	29553,30563,30975,	30039,30667,31097,	
chr1	30266	31109	30266	30266	+	MIR1302-11	ENST00000469289.1	nonCoding	30266,30975,	30667,31109,	
chr1	30365	30503	30365	30365	+	MIR1302-11	ENST00000607096.1	nonCoding	30365,	30503,	
chr1	34553	36081	34553	34553	-	FAM138A	ENST00000417324.1	nonCoding	34553,35276,35720,	35174,35481,36081,	
chr1	35244	36073	35244	35244	-	FAM138A	ENST00000461467.1	nonCoding	35244,35720,	35481,36073,	
chr1	69090	70008	69090	70008	+	OR4F5	ENST00000335137.3	coding	69090,	70008,	Homo sapiens olfactory receptor, family 4, subfamily F, member 5 (OR4F5), mRNA.
chr1	89294	120932	89294	89294	-	RP11-34P13.7	ENST00000466430.1	nonCoding	89294,92090,112699,120774,	91629,92240,112804,120932,	
chr1	89550	91105	89550	89550	-	RP11-34P13.8	ENST00000495576.1	nonCoding	89550,90286,	90050,91105,	
chr1	92229	129217	92229	92229	-	RP11-34P13.7	ENST00000477740.1	nonCoding	92229,112699,120720,129054,	92240,112804,120932,129217,	`,
    },
    longrange: {
        label: "long-range text",
        desc: "the long-range interaction in text format",
        example: `chr1    713605  715737  chr1:720589-722848,2    8165    +
chr1    717172  720090  chr1:761197-762811,2    8167    +
chr1    720589  722848  chr1:713605-715737,2    8166    -
chr1    755977  758438  chr1:758539-760203,2    8169    +
chr1    758539  760203  chr1:755977-758438,2    8170    -
chr1    760415  763106  chr1:832872-834905,2    8171    +
chr1    761197  762811  chr1:717172-720090,2    8168    -
chr1    766545  768738  chr8:275760-277262,2    3       .
chr1    766545  768738  chr8:275760-277262,2    1       .
chr1    791044  793910  chr8:248210-251154,2    7       .`,
    },
    "longrange-AndreaGillespie": {
        label: "long-range format by CHiCANE",
        desc: (
            <span>
                a long-range interaction format by{" "}
                <a
                    href="https://cran.r-project.org/web/packages/chicane/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    CHiCANE
                </a>
            </span>
        ),
        example: `"id"	"trans"	"b2b"	"distance"	"count"	"score"
"chr20:49368733-49369493<->chr20:50528173-50533850"	FALSE	FALSE	1161898.5	309	79.7857303792859
"chr5:1287807-1300847<->CMV:157565-178165"	TRUE	FALSE	NA	51	62.8795109965162
"chr2:172098385-172101315<->chrUn_KN707623v1_decoy:353-1495"	TRUE	FALSE	NA	48	57.4855116417847
"chr2:172089426-172092129<->chrUn_KN707623v1_decoy:353-1495"	TRUE	FALSE	NA	46	54.0869303212974
"chr20:49368733-49369493<->chr20:50526988-50528172"	FALSE	FALSE	1158467	177	42.0222133940233
"chr20:49368733-49369493<->chr20:50511129-50512012"	FALSE	FALSE	1142457.5	162	37.686580957954
"chr5:1270279-1272416<->SV40:5172-5243"	TRUE	FALSE	NA	35	37.2369416773403
"chr8:128109053-128110360<->chr8:129534833-129536039"	FALSE	FALSE	1425729.5	100	34.8639202860754
"chr20:49345639-49354229<->chr20:50511129-50512012"	FALSE	FALSE	1161636.5	129	30.5556940820741`,
    },
    qbed: {
        label: "qBED",
        desc:
            "Text file in qBED format, comprising 4-6 columns: chrom, start, end, value; and, optionally, strand and annotation",
        example: `chr1    51441754        51441758        1       -       CTAGAGACTGGC
chr1    51441754        51441758        21      -       CTTTCCTCCCCA
chr1    51982564        51982568        3       +       CGCGATCGCGAC
chr1    52196476        52196480        1       +       AGAATATCTTCA
chr1    52341019        52341023        1       +       TACGAAACACTA
chr1    59951043        59951047        1       +       ACAAGACCCCAA
chr1    59951043        59951047        1       +       ACAAGAGAGACT
chr1    61106283        61106287        1       -       ATGCACTACTTC
chr1    61106283        61106287        7       -       CGTTTTTCACCT
chr1    61542006        61542010        1       -       CTGAGAGACTGG`,
    },
};

export class TextTrack extends React.Component {
    static propTypes = {
        onTracksAdded: PropTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            textType: "bed",
            msg: "",
            isFileHuge: false,
            options: null,
        };
    }

    handleTypeChange = (event) => {
        this.setState({ textType: event.target.value });
    };

    handleFileUpload = async (event) => {
        this.setState({ msg: "Uploading track..." });
        let tracks;
        const { options } = this.state;
        const typedArray = this.state.textType.split("-");
        const textConfig = {
            isFileHuge: this.state.isFileHuge,
            subType: typedArray[1],
        };
        const fileList = Array.from(event.target.files);
        tracks = fileList.map(
            (file) =>
                new TrackModel({
                    type: typedArray[0],
                    url: null,
                    fileObj: file,
                    name: file.name,
                    label: file.name,
                    isText: true,
                    files: null,
                    textConfig,
                    options,
                })
        );
        this.props.onTracksAdded(tracks);
        this.setState({ msg: "Track added." });
    };

    handleCheck = () => {
        this.setState((prevState) => {
            return { isFileHuge: !prevState.isFileHuge };
        });
    };

    getOptions = (value) => {
        let options = null;
        try {
            options = JSON5.parse(value);
        } catch (error) {}
        this.setState({ options });
    };

    renderTextForm = () => {
        return (
            <div>
                <h3>1. Choose text file type</h3>
                <div>
                    <label>
                        <select value={this.state.textType} onChange={this.handleTypeChange}>
                            {Object.keys(TEXT_TYPE_DESC).map((key) => (
                                <option value={key} key={key}>
                                    {TEXT_TYPE_DESC[key].label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
                <div>{TEXT_TYPE_DESC[this.state.textType].desc}</div>
                <div className="TextTrack-textFormDesc">
                    <h4>Example:</h4>
                    <pre>{TEXT_TYPE_DESC[this.state.textType].example}</pre>
                </div>
                <div>
                    <TrackOptionsUI onGetOptions={(value) => this.getOptions(value)} />
                </div>
                <div>
                    <label htmlFor="hugeCheck">
                        Use a Worker thread:{" "}
                        <input type="checkbox" checked={this.state.isFileHuge} onChange={this.handleCheck} />{" "}
                        <span className="TextTrack-hint">(Check if your file is huge.)</span>
                    </label>
                </div>
                <div>
                    <label htmlFor="textFile">
                        <h3>2. Choose text files:</h3>
                        <input type="file" id="textFile" multiple onChange={this.handleFileUpload} />
                        <p className="TextTrack-hint">
                            if you choose more than one file, make sure they are of same type.
                        </p>
                    </label>
                </div>
            </div>
        );
    };

    render() {
        return (
            <div>
                <div>
                    You can upload track data in text file without formatting them to the binary format. Check more at{" "}
                    <a href={HELP_LINKS.textTrack} target="_blank" rel="noopener noreferrer">
                        text tracks
                    </a>
                    .
                </div>
                {this.renderTextForm()}
                <div className="text-danger font-italic">{this.state.msg}</div>
            </div>
        );
    }
}
