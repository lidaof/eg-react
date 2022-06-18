import React from "react";
// import {Controlled as CodeMirror} from 'react-codemirror2';
import { HELP_LINKS } from "../../util";
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/material.css';
import "./TrackOptionsUI.css";

export class TrackOptionsUI extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "", // track options
        };
    }

    // handleChange = (editor, data, value) => {
    //     this.setState({ value });
    //     this.props.onGetOptions(value);
    // };

    handleChangeSimple = (e) => {
        this.setState({ value: e.target.value });
        this.props.onGetOptions(e.target.value);
    };

    fillExample = () => {
        const value = '{"height": 100, "color": "red"}';
        this.setState({ value });
        this.props.onGetOptions(value);
    };

    render() {
        return (
            <div style={{ marginBottom: "10px" }}>
                <label>(Optional) Configure track options below in JSON format:</label>
                <span>
                    <button type="button" className="btn btn-link btn-sm" onClick={this.fillExample}>
                        Example
                    </button>
                </span>
                <span style={{ marginLeft: "5px", fontStyle: "italic" }}>
                    <a href={HELP_LINKS.trackOptions} target="_blank" rel="noopener noreferrer">
                        available properties for tracks
                    </a>
                </span>
                {/* <CodeMirror
                    value={this.state.value}
                    options={{
                        theme: "default",
                        height: "auto",
                        viewportMargin: Infinity,
                        mode: {
                            name: "javascript",
                            json: true,
                            statementIndent: 4,
                        },
                        lineNumbers: true,
                        lineWrapping: true,
                        indentWithTabs: false,
                        tabSize: 4,
                    }}
                    onBeforeChange={this.handleChange}
                    // onChange={this.handleChange}
                /> */}

                <textarea
                    className="w-100 p-3"
                    value={this.state.value}
                    onChange={this.handleChangeSimple}
                    rows={10}
                ></textarea>
            </div>
        );
    }
}
