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

    // A data URL can also be generated from an existing SVG element.
    // http://bl.ocks.org/curran/7cf9967028259ea032e8
    svgDataURL = (svg) => {
      const svgAsXML = (new XMLSerializer).serializeToString(svg);
      return "data:image/svg+xml," + encodeURIComponent(svgAsXML);
    }

    downloadSvg = () => {
        const tracks = Array.from(document.querySelector('#screenshotContainer').querySelectorAll('.Track'));
        const boxHeight = tracks.reduce( (acc, cur) => acc + cur.clientHeight, 0 );
        const boxWidth = tracks[0].clientWidth;
        const xmlns = "http://www.w3.org/2000/svg";
        const svgElem = document.createElementNS (xmlns, "svg");
        svgElem.setAttributeNS (null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
        svgElem.setAttributeNS (null, "width", boxWidth);
        svgElem.setAttributeNS (null, "height", boxHeight);
        svgElem.style.display = "block";
        let x = 0, y = 0;
        tracks.forEach((ele, idx) => {
            const eleSvg = ele.children[1].querySelector('svg');
            if (eleSvg) {
                eleSvg.setAttribute("id", "svg"+idx);
                eleSvg.setAttribute("x", x);
                eleSvg.setAttribute("y", y);
                svgElem.appendChild(eleSvg);
                y += Number.parseFloat(eleSvg.getAttribute("height"));
                y += 1;
                const sepLine = document.createElementNS(xmlns,'line');
                sepLine.setAttribute('id','line'+idx);
                sepLine.setAttribute('x1','0');
                sepLine.setAttribute('y1',y);
                sepLine.setAttribute('x2',boxWidth);
                sepLine.setAttribute('y2',y);
                sepLine.setAttribute("stroke", "lightgray")
                svgElem.appendChild(sepLine);
                y += 1;
            }
        });

        const dl = document.createElement("a");
        document.body.appendChild(dl); // This line makes it work in Firefox.
        dl.setAttribute("href", this.svgDataURL(svgElem));
        dl.setAttribute("download", "eg.svg");
        dl.click();
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
            />
        });
        
        return trackSvgElements;
    }

    render() {
        const trackContents = this.makeSvgTrackElements();
        console.log(trackContents);
        return (
            <div>
                <p>Click the Download button below to download the browser view as a SVG file.</p>
                <button className="btn btn-success btn-sm" onClick={this.downloadSvg}>⬇ Download</button>
                <div id="screenshotContainer">
                    {trackContents}
                </div>
            </div>
        );
    }
}

export const ScreenshotUI = withEnhancements(ScreenshotUINotConnected);