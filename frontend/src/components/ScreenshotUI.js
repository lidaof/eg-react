import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import withAutoDimensions from "./withAutoDimensions";
import { withTrackData } from "./trackContainers/TrackDataManager";
import { withTrackView } from "./trackContainers/TrackViewManager";
import { TrackHandle } from "./trackContainers/TrackHandle";
import { withTrackLegendWidth } from "./withTrackLegendWidth";
import { getTrackConfig } from "./trackConfig/getTrackConfig";
import { GroupedTrackManager } from "./trackManagers/GroupedTrackManager";
import HighlightRegion, { getHighlightedXs } from "./HighlightRegion";
import OpenInterval from "../model/interval/OpenInterval";

function mapStateToProps(state) {
    const appState = state.browser.present;
    const [cidx, gidx] = appState.editTarget;
    const { compatabilityMode, containers } = appState;
    const pickingGenome = !(containers && containers.length);

    let editingGenome = {}, editingContainer = {};
    if (!pickingGenome && !compatabilityMode) {
        editingGenome = (appState.containers && appState.containers[cidx].genomes[gidx]) || {};
        editingContainer = (appState.containers && appState.containers[cidx]) || {};
    }

    return {
        genome: editingGenome.name,
        viewRegion: editingContainer.viewRegion || appState.viewRegion,
        tracks: editingGenome.tracks || appState.tracks,
        metadataTerms: editingGenome.metadataTerms,
    };
}

const withAppState = connect(mapStateToProps);
const withEnhancements = _.flowRight(
    withAppState,
    withAutoDimensions,
    withTrackView,
    withTrackData,
    withTrackLegendWidth
);

class ScreenshotUINotConnected extends React.Component {
    static displayName = "ScreenshotUI";

    state = { display: "block", buttonDisabled: "" };
    // A data URL can also be generated from an existing SVG element.
    // http://bl.ocks.org/curran/7cf9967028259ea032e8
    // https://stackoverflow.com/questions/39374157/angular-save-file-as-csv-result-in-failed-network-error-only-on-chrome

    svgDataURL = (svg) => {
        const svgAsXML = new XMLSerializer().serializeToString(svg);
        return "data:image/svg+xml," + encodeURIComponent(svgAsXML);
    };

    prepareSvg = () => {
        const { highlights, needClip, legendWidth, primaryView, darkTheme } = this.props;
        const tracks = Array.from(document.querySelector("#screenshotContainer").querySelectorAll(".Track"));
        const boxHeight = tracks.reduce((acc, cur) => acc + cur.clientHeight, 11 * tracks.length);
        const boxWidth = tracks[0].clientWidth;
        const xmlns = "http://www.w3.org/2000/svg";
        const svgElem = document.createElementNS(xmlns, "svg");
        svgElem.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
        svgElem.setAttributeNS(null, "width", boxWidth + "");
        svgElem.setAttributeNS(null, "height", boxHeight + "");
        svgElem.setAttributeNS(null, "font-family", "Arial, Helvetica, sans-serif");
        svgElem.style.display = "block";
        const defs = document.createElementNS(xmlns, "defs");
        const style = document.createElementNS(xmlns, "style");
        const bg = darkTheme ? "#222" : "white";
        const fg = darkTheme ? "white" : "#222";
        style.innerHTML = `:root { --bg-color: ${bg}; --font-color: ${fg}; } .svg-text-bg {
    fill: var(--font-color);
}

.svg-line-bg {
    stroke: var(--font-color);
}`;
        defs.appendChild(style);
        svgElem.appendChild(defs);
        if (darkTheme) {
            const rect = document.createElementNS(xmlns, "rect");
            rect.setAttribute("id", "bgcover");
            rect.setAttribute("x", 0);
            rect.setAttribute("y", 0);
            rect.setAttribute("width", boxWidth + "");
            rect.setAttribute("height", boxHeight + "");
            rect.setAttribute("fill", "#222");
            svgElem.appendChild(rect);
        }
        const svgElemg = document.createElementNS(xmlns, "g"); // for labels, separate lines etc
        const svgElemg2 = document.createElementNS(xmlns, "g"); // for tracks contents
        const translateX = needClip ? -primaryView.viewWindow.start : 0;
        const clipDef = document.createElementNS(xmlns, "defs");
        const clipPath = document.createElementNS(xmlns, "clipPath");
        clipPath.setAttributeNS(null, "id", "cutoff-legend-space");
        let clipWidth, clipHeight, clipX;
        let x = 0,
            y = 5;
        tracks.forEach((ele, idx) => {
            const legendWidth = ele.children[0].clientWidth + 1;
            const trackHeight = ele.children[1].clientHeight + 5;
            const trackLabelText = ele.children[0].querySelector(".TrackLegend-label").textContent;
            if (trackLabelText) {
                const labelSvg = document.createElementNS(xmlns, "text");
                labelSvg.setAttributeNS(null, "x", x + 4 + "");
                labelSvg.setAttributeNS(null, "y", y + 14 + "");
                labelSvg.setAttributeNS(null, "font-size", "12px");
                const textNode = document.createTextNode(trackLabelText);
                labelSvg.setAttribute("class", "svg-text-bg");
                labelSvg.appendChild(textNode);
                svgElemg.appendChild(labelSvg);
            }
            const chrLabelText = ele.children[0].querySelector(".TrackLegend-chrLabel").textContent;
            if (chrLabelText) {
                const labelSvg = document.createElementNS(xmlns, "text");
                labelSvg.setAttributeNS(null, "x", x + 15 + "");
                labelSvg.setAttributeNS(null, "y", y + 33 + "");
                labelSvg.setAttributeNS(null, "font-size", "12px");
                const textNode = document.createTextNode(chrLabelText);
                labelSvg.setAttribute("class", "svg-text-bg");
                labelSvg.appendChild(textNode);
                svgElemg.appendChild(labelSvg);
            }
            const trackLegendAxisSvgs = ele.children[0].querySelectorAll("svg"); // methylC has 2 svgs in legend
            if (trackLegendAxisSvgs.length > 0) {
                const x2 = x + legendWidth - trackLegendAxisSvgs[0].clientWidth;
                trackLegendAxisSvgs.forEach((trackLegendAxisSvg, idx3) => {
                    trackLegendAxisSvg.setAttribute("id", "legendAxis" + idx + idx3);
                    trackLegendAxisSvg.setAttribute("x", x2 + "");
                    trackLegendAxisSvg.setAttribute("y", idx3 * trackLegendAxisSvg.clientHeight + y + "");
                    svgElemg.appendChild(trackLegendAxisSvg);
                });
            }
            // deal with track contents
            const options = this.props.tracks[idx].options;
            const eleSvgs = ele.children[1].querySelectorAll("svg"); // bi-directional numerical track has 2 svgs!
            const trackG = document.createElementNS(xmlns, "g");
            if (eleSvgs.length > 0) {
                x += legendWidth;
                eleSvgs.forEach((eleSvg, idx2) => {
                    eleSvg.setAttribute("id", "svg" + idx + idx2);
                    eleSvg.setAttribute("x", x + "");
                    eleSvg.setAttribute("y", idx2 * eleSvg.clientHeight + y + "");
                    if (options && options.backgroundColor) {
                        const rect = document.createElementNS(xmlns, "rect");
                        rect.setAttribute("id", "backRect" + idx);
                        rect.setAttribute("x", x + "");
                        rect.setAttribute("y", idx2 * eleSvg.clientHeight + y + "");
                        rect.setAttribute("width", eleSvg.clientWidth + "");
                        rect.setAttribute("height", eleSvg.clientHeight + "");
                        rect.setAttribute("fill", options.backgroundColor);
                        trackG.appendChild(rect);
                    }
                    trackG.appendChild(eleSvg);
                });
            }
            trackG.setAttributeNS(null, "transform", `translate(${translateX})`);
            svgElemg2.appendChild(trackG);
            // metadata ?
            y += trackHeight;
            // y += 1; //draw separare line
            const sepLine = document.createElementNS(xmlns, "line");
            sepLine.setAttribute("id", "line" + idx);
            sepLine.setAttribute("x1", "0");
            sepLine.setAttribute("y1", y + "");
            sepLine.setAttribute("x2", boxWidth + "");
            sepLine.setAttribute("y2", y + "");
            sepLine.setAttribute("stroke", "gray");
            svgElemg.appendChild(sepLine);
            // y += 1;
            x = 0;
            clipX = legendWidth - 1;
        });
        clipHeight = boxHeight;
        clipWidth = boxWidth - clipX;
        const clipRect = document.createElementNS(xmlns, "rect");
        clipRect.setAttribute("x", clipX + "");
        clipRect.setAttribute("y", "0");
        clipRect.setAttribute("width", clipWidth + "");
        clipRect.setAttribute("height", clipHeight + "");
        clipPath.appendChild(clipRect);
        clipDef.appendChild(clipPath);
        if (needClip) {
            svgElem.appendChild(clipDef);
            svgElemg2.setAttributeNS(null, "clip-path", "url(#cutoff-legend-space)");
        }
        svgElem.appendChild(svgElemg);
        svgElem.appendChild(svgElemg2);
        svgElem.setAttribute("xmlns", xmlns);
        // highlights
        const xS = highlights.map((h) => getHighlightedXs(new OpenInterval(h.start, h.end), primaryView, legendWidth));
        highlights.forEach((item, idx) => {
            if (item.display) {
                const rect = document.createElementNS(xmlns, "rect");
                rect.setAttribute("id", "highlightRect" + idx);
                rect.setAttribute("x", xS[idx].start + "");
                rect.setAttribute("y", "0");
                rect.setAttribute("width", xS[idx].getLength() + "");
                rect.setAttribute("height", boxHeight + "");
                rect.setAttribute("fill", item.color);
                svgElem.appendChild(rect);
            }
        });
        return new XMLSerializer().serializeToString(svgElem);
    };

    downloadSvg = () => {
        const svgContent = this.prepareSvg();
        const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        const svgBlob = new Blob([preface, svgContent], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        const dl = document.createElement("a");
        document.body.appendChild(dl); // This line makes it work in Firefox.
        //dl.setAttribute("href", this.svgDataURL(svgElem)); //chrome network error on svg > 1MB
        dl.setAttribute("href", svgUrl);
        dl.setAttribute("download", new Date().toISOString() + "_eg.svg");
        dl.click();
        this.setState({ display: "none", buttonDisabled: "disabled" });
        const pdfContainer = document.getElementById("pdfContainer");
        pdfContainer.innerHTML = svgContent;
    };

    downloadPdf = () => {
        const svgContent = this.prepareSvg();
        const tracks = Array.from(document.querySelector("#screenshotContainer").querySelectorAll(".Track"));
        const boxHeight = tracks.reduce((acc, cur) => acc + cur.clientHeight, 11 * tracks.length);
        const boxWidth = tracks[0].clientWidth;
        // create a new jsPDF instance
        const pdf = new window.jsPDF("l", "px", [boxWidth, boxHeight]);
        const pdfContainer = document.getElementById("pdfContainer");
        pdfContainer.innerHTML = svgContent;
        // render the svg element
        window.svg2pdf(pdfContainer.firstElementChild, pdf, {
            xOffset: 0,
            yOffset: 0,
            scale: 1,
        });
        // get the data URI
        // const uri = pdf.output('datauristring');
        // const pdfBlob = new Blob([uri], {type:"application/pdf"});
        // const pdfUrl = URL.createObjectURL(pdfBlob);
        // const dl = document.createElement("a");
        // document.body.appendChild(dl); // This line makes it work in Firefox.
        // dl.setAttribute("href", pdfUrl);
        // dl.setAttribute("download", (new Date()).toISOString() + "_eg.pdf");
        // dl.click();
        pdf.save(new Date().toISOString() + "_eg.pdf");
        this.setState({ display: "none", buttonDisabled: "disabled" });
    };

    makeSvgTrackElements() {
        const { tracks, trackData, primaryView, metadataTerms, viewRegion, darkTheme } = this.props;
        if (darkTheme) {
            document.documentElement.style.setProperty("--bg-color", "#222");
        } else {
            document.documentElement.style.setProperty("--bg-color", "white");
        }
        const groupScale = new GroupedTrackManager().getGroupScale(
            tracks,
            trackData,
            primaryView ? primaryView.visWidth : 100,
            primaryView ? primaryView.viewWindow : 100
        );
        const trackSvgElements = tracks
            .filter((track) => !getTrackConfig(track).isDynamicTrack())
            .map((trackModel, index) => {
                const id = trackModel.getId();
                const data = trackData[id];
                return primaryView ? (
                    <TrackHandle
                        key={trackModel.getId()}
                        trackModel={trackModel}
                        {...data}
                        viewRegion={data.visRegion}
                        width={primaryView.visWidth}
                        viewWindow={primaryView.viewWindow}
                        metadataTerms={metadataTerms}
                        xOffset={0}
                        index={index}
                        forceSvg={true}
                        selectedRegion={viewRegion}
                        zoomAnimation={0}
                        groupScale={groupScale}
                        genomeConfig={this.props.genomeConfig}
                    />
                ) : null;
            });
        return trackSvgElements;
    }

    render() {
        const { viewRegion, primaryView, highlights } = this.props;
        if (!primaryView) {
            return <div>Loading...</div>;
        }
        const trackContents = this.makeSvgTrackElements();
        return (
            <div>
                <p>
                    Please wait the following browser view finish loading, <br />
                    then click the Download button below to download the browser view as a SVG file.
                </p>
                <div className="font-italic">
                    <strong>Download SVG</strong> is recommended.
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    style={{ marginBottom: "2ch" }}
                    onClick={this.downloadSvg}
                    disabled={this.state.buttonDisabled}
                >
                    ⬇ Download SVG
                </button>{" "}
                <button
                    className="btn btn-success btn-sm"
                    style={{ marginBottom: "2ch" }}
                    onClick={this.downloadPdf}
                    disabled={this.state.buttonDisabled}
                >
                    ⬇ Download PDF
                </button>
                <div id="screenshotContainer" style={{ display: this.state.display }}>
                    <HighlightRegion viewRegion={viewRegion} visData={primaryView} xOffset={0} highlights={highlights}>
                        {trackContents}
                    </HighlightRegion>
                </div>
                <div id="pdfContainer"></div>
            </div>
        );
    }
}

export const ScreenshotUI = withEnhancements(ScreenshotUINotConnected);
