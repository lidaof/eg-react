import React, { useMemo, useState } from "react";
import Select from "react-select";
import { ResponsiveChord } from "@nivo/chord";
import { ColorSchemeSelectOption, ColorSchemeSelectValue, useOrdinalColorSchemes } from "./nivo/colorSchemeSelect";
import "./ChordView.css";
/**
 * a component to draw chord view for interaction tracks
 * @author Daofeng Li
 */
const MyResponsiveChord = ({ data, keys, count, scheme }) => (
    <ResponsiveChord
        matrix={data}
        keys={keys}
        margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
        valueFormat={count === "count" ? undefined : ".2f"}
        padAngle={0.02}
        innerRadiusRatio={0.96}
        innerRadiusOffset={0.02}
        inactiveArcOpacity={0.25}
        arcBorderColor={{
            from: "color",
            modifiers: [["darker", 0.6]],
        }}
        activeRibbonOpacity={0.75}
        inactiveRibbonOpacity={0.25}
        ribbonBorderColor={{
            from: "color",
            modifiers: [["darker", 0.6]],
        }}
        enableLabel={false}
        colors={{ scheme }}
        animate={false}
        motionConfig="stiff"
    />
);

const generateChordData = (data, count) => {
    const keys = new Set(); // item: chr:start-end
    // Key: chr:start-end, value: {chr:start-end: score}
    const valueHash = {}; // why not use Map? https://stackoverflow.com/questions/44321324/javascript-map-much-slower-than-object-for-random-look-ups
    data.forEach((item) => {
        const { locus1, locus2, score } = item;
        const valueToAdd = count === "count" ? 1 : score;
        const s1 = locus1.chr;
        const s2 = locus2.chr;
        keys.add(s1);
        if (s2 !== s1) {
            keys.add(s2);
        }
        if (!valueHash.hasOwnProperty(s1)) {
            valueHash[s1] = {};
        }
        if (!valueHash.hasOwnProperty(s2)) {
            valueHash[s2] = {};
        }
        if (!valueHash[s1].hasOwnProperty(s2)) {
            valueHash[s1][s2] = valueToAdd;
        } else {
            valueHash[s1][s2] += valueToAdd;
        }
        if (!valueHash[s2].hasOwnProperty(s1)) {
            valueHash[s2][s1] = valueToAdd;
        } else {
            valueHash[s2][s1] += valueToAdd;
        }
    });
    const plot = [];
    const keys2 = Array.from(keys);
    keys2.forEach((key) => {
        const sub = [];
        keys2.forEach((key2) => {
            if (valueHash.hasOwnProperty(key)) {
                if (valueHash[key].hasOwnProperty(key2)) {
                    sub.push(valueHash[key][key2]);
                } else {
                    sub.push(0);
                }
            } else {
                sub.push(0);
            }
        });
        plot.push(sub);
    });
    return {
        plotData: plot,
        keys: keys2,
    };
};

const styles = {
    option: (styles) => {
        return {
            ...styles,
            textAlign: "left",
        };
    },
};

export const ChordView = (props) => {
    const [count, setCount] = useState("count");
    const [selectedOption, setSelectedOption] = useState(null);
    const options = useOrdinalColorSchemes();
    const { track, trackData } = props;
    const data = trackData[track.getId()].data;
    const { keys, plotData } = useMemo(() => generateChordData(data, count), [data, count]);
    const onCountChange = (e) => {
        setCount(e.target.value);
    };
    // console.log(keys, plotData);
    return (
        <div className="ChordView-Control">
            <div>
                Chord view plots interaction statistics between intra- and inter-chromosomes of current browser region.
            </div>
            <div style={{ display: "flex" }}>
                <strong>Value to use:</strong>
                <ul>
                    <li>
                        <label>
                            <input
                                type="radio"
                                value="count"
                                name="count"
                                checked={count === "count"}
                                onChange={onCountChange}
                            />
                            <span>Interaction counts</span>
                        </label>
                    </li>

                    <li>
                        <label>
                            <input
                                type="radio"
                                name="count"
                                value="score"
                                checked={count === "score"}
                                onChange={onCountChange}
                            />
                            <span>Accumulated interaction score</span>
                        </label>
                    </li>
                </ul>
            </div>
            <div style={{ display: "flex" }}>
                <label style={{ margin: "auto 1ch auto 0" }}>
                    <strong>Color scheme: </strong>
                </label>
                <div style={{ width: 500 }}>
                    <Select
                        styles={styles}
                        defaultValue={selectedOption}
                        onChange={setSelectedOption}
                        components={{
                            SingleValue: ColorSchemeSelectValue,
                            Option: ColorSchemeSelectOption,
                        }}
                        options={options}
                    />
                </div>
            </div>
            <div style={{ marginTop: "1ch" }}>
                <button className="btn btn-success btn-sm" onClick={downloadSvg}>
                    ⬇ Download Plot
                </button>
            </div>
            <div style={{ height: 800 }} id="chordViewContainer">
                <MyResponsiveChord
                    data={plotData}
                    keys={keys}
                    count={count}
                    scheme={selectedOption ? selectedOption.value : "category10"}
                />
            </div>
        </div>
    );
};

const downloadSvg = () => {
    const box = document.querySelector("#chordViewContainer");
    const boxHeight = box.clientHeight || box.offsetHeight;
    const boxWidth = box.clientWidth || box.offsetWidth;
    const xmlns = "http://www.w3.org/2000/svg";
    const svgElem = document.createElementNS(xmlns, "svg");
    svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
    svgElem.setAttributeNS(null, "width", boxWidth);
    svgElem.setAttributeNS(null, "height", boxHeight);
    svgElem.style.display = "block";
    let x = 0,
        y = 0;
    const eleSvg = box.querySelector("svg");
    eleSvg.setAttribute("id", "svgCirclet");
    eleSvg.setAttribute("x", x);
    eleSvg.setAttribute("y", y);
    const eleClone = eleSvg.cloneNode(true);
    svgElem.appendChild(eleClone);
    svgElem.setAttribute("xmlns", xmlns);
    const dl = document.createElement("a");
    document.body.appendChild(dl); // This line makes it work in Firefox.
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, new XMLSerializer().serializeToString(svgElem)], {
        type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    dl.setAttribute("href", svgUrl);
    dl.setAttribute("download", new Date().toISOString() + "_eg_chord.svg");
    dl.click();
};
