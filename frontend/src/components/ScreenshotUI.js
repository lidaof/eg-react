import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import withAutoDimensions from './withAutoDimensions';
import { withTrackData } from './trackContainers/TrackDataManager';
import { withTrackView } from './trackContainers/TrackViewManager';
import { TrackHandle } from './trackContainers/TrackHandle';
import { withTrackLegendWidth } from './withTrackLegendWidth';

function mapStateToProps(state) {
    return {
        genome: state.browser.present.genomeName,
        viewRegion: state.browser.present.viewRegion,
        tracks: state.browser.present.tracks,
        metadataTerms: state.browser.present.metadataTerms
    };
}

const withAppState = connect(mapStateToProps);
const withEnhancements = _.flowRight(withAppState, withAutoDimensions, withTrackView, withTrackData, withTrackLegendWidth);

class ScreenshotUINotConnected extends React.Component {
    static displayName = "ScreenshotUI";
    
    state = {display: "block", buttonDisabled: ""};
    // A data URL can also be generated from an existing SVG element.
    // http://bl.ocks.org/curran/7cf9967028259ea032e8
    // https://stackoverflow.com/questions/39374157/angular-save-file-as-csv-result-in-failed-network-error-only-on-chrome
    
    svgDataURL = (svg) => {
      const svgAsXML = (new XMLSerializer).serializeToString(svg);
      return "data:image/svg+xml," + encodeURIComponent(svgAsXML);
    }

    downloadSvg = () => {
        const tracks = Array.from(document.querySelector('#screenshotContainer').querySelectorAll('.Track'));
        const boxHeight = tracks.reduce( (acc, cur) => acc + (cur.clientHeight || cur.offsetHeight), 20 );
        const boxWidth = tracks[0].clientWidth || tracks[0].offsetWidth;
        const xmlns = "http://www.w3.org/2000/svg";
        const svgElem = document.createElementNS (xmlns, "svg");
        svgElem.setAttributeNS (null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
        svgElem.setAttributeNS (null, "width", boxWidth);
        svgElem.setAttributeNS (null, "height", boxHeight);
        svgElem.style.display = "block";
        let x = 0, y = 0;
        tracks.forEach((ele, idx) => {
            const legendWidth = (ele.children[0].clientWidth || ele.children[0].offsetWidth) + 1;
            const legendHeight = (ele.children[0].clientHeight || ele.children[0].offsetHeight) + 1;
            const trackLabelText = ele.children[0].querySelector(".TrackLegend-label").textContent;
            if (trackLabelText) {
                const labelSvg = document.createElementNS(xmlns,"text");
                labelSvg.setAttributeNS(null,"x",x+4);     
                labelSvg.setAttributeNS(null,"y",y+14); 
                labelSvg.setAttributeNS(null,"font-size","12");
                const textNode = document.createTextNode(trackLabelText);
                labelSvg.appendChild(textNode);
                svgElem.appendChild(labelSvg);
            }
            const trackLegendAxisSvgs = ele.children[0].querySelectorAll("svg"); // methylC has 2 svgs in legend
            if (trackLegendAxisSvgs.length > 0) {
                const x2 = x + legendWidth - (trackLegendAxisSvgs[0].clientWidth || trackLegendAxisSvgs[0].offsetWidth);
                trackLegendAxisSvgs.forEach((trackLegendAxisSvg, idx3) => {
                    trackLegendAxisSvg.setAttribute("id", "legendAxis"+idx+idx3);
                    trackLegendAxisSvg.setAttribute("x", x2);
                    trackLegendAxisSvg.setAttribute("y", idx3 * (trackLegendAxisSvg.clientHeight || trackLegendAxisSvg.offsetHeight) + y);
                    svgElem.appendChild(trackLegendAxisSvg);
                });
            }
            const eleSvgs = ele.children[1].querySelectorAll('svg'); // bi-directional numerical track has 2 svgs!
            if (eleSvgs.length > 0) {
                x += legendWidth;
                eleSvgs.forEach((eleSvg, idx2) => {
                    eleSvg.setAttribute("id", "svg"+idx+idx2);
                    eleSvg.setAttribute("x", x);
                    eleSvg.setAttribute("y", idx2 * (eleSvg.clientHeight || eleSvg.offsetHeight) + y);
                    svgElem.appendChild(eleSvg);    
                }); 
            }
            y += (ele.clientHeight || ele.offsetHeight);
            y += 2; //draw separare line
            const sepLine = document.createElementNS(xmlns,'line');
            sepLine.setAttribute('id','line'+idx);
            sepLine.setAttribute('x1','0');
            sepLine.setAttribute('y1',y);
            sepLine.setAttribute('x2',boxWidth);
            sepLine.setAttribute('y2',y);
            sepLine.setAttribute("stroke", "lightgray")
            svgElem.appendChild(sepLine);
            y += 2;
            x = 0;
        });
        svgElem.setAttribute("xmlns", xmlns);

        const dl = document.createElement("a");
        document.body.appendChild(dl); // This line makes it work in Firefox.
        //dl.setAttribute("href", this.svgDataURL(svgElem)); //chrome network error on svg > 1MB
        const preface = '<?xml version="1.0" standalone="no"?>\r\n';
        const svgBlob = new Blob([preface, new XMLSerializer().serializeToString(svgElem)], {type:"image/svg+xml;charset=utf-8"});
        const svgUrl = URL.createObjectURL(svgBlob);
        dl.setAttribute("href", svgUrl);
        dl.setAttribute("download", (new Date()).toISOString() + "_eg.svg");
        dl.click();
        this.setState({display: "none", buttonDisabled: "disabled"});
      }

    makeSvgTrackElements() {
        const {tracks, trackData, primaryView, metadataTerms} = this.props;
        const trackSvgElements = tracks.map((trackModel, index) => {
            const id = trackModel.getId();
            const data = trackData[id];
            return <TrackHandle
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
            />
        });
        
        return trackSvgElements;
    }

    render() {
        const trackContents = this.makeSvgTrackElements();
        return (
            <div>
                <p>Please wait the following browser view finish loading, <br />
                then click the Download button below to download the browser view as a SVG file.</p>
                <button 
                    className="btn btn-success btn-sm" 
                    style={{marginBottom: "2ch"}}
                    onClick={this.downloadSvg} 
                    disabled={this.state.buttonDisabled}
                >
                    ⬇ Download</button>
                <div id="screenshotContainer" style={{display: this.state.display}}>
                    {trackContents}
                </div>
            </div>
        );
    }
}

export const ScreenshotUI = withEnhancements(ScreenshotUINotConnected);