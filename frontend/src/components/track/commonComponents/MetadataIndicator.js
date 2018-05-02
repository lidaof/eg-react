import React from 'react';
import PropTypes from 'prop-types';
import { Manager, Target, Popper } from 'react-popper';
import TrackModel from '../../../model/TrackModel';

import './tooltip/Tooltip.css';

/*
const COLORS = [ // A long list of unique colors.  From the old browser.
    "rgb(255,255,0)", "rgb(255,153,0)", "rgb(51,102,255)", "rgb(255,102,255)", "rgb(220,41,94)",
    "rgb(51,102,0)", "rgb(0,153,255)", "rgb(255,153,255)", "rgb(0,204,0)", "rgb(255,102,0)", "rgb(0,51,255)",
    "rgb(255,51,255)", "rgb(255,204,0)", "rgb(255,0,0)", "rgb(0,204,255)", "rgb(255,204,255)", "rgb(51,255,0)",
    "rgb(51,153,153)", "rgb(153,0,102)", "rgb(153,204,51)", "rgb(204,102,102)", "rgb(143,143,255)", "rgb(82,82,255)",
    "rgb(255,82,171)", "rgb(214,0,111)", "rgb(162,82,255)", "rgb(134,20,255)", "rgb(214,104,0)", "rgb(0,11,214)",
    "rgb(102,51,51)", "rgb(176,99,176)", "rgb(102,51,102)", "rgb(184,46,0)", "rgb(245,61,0)", "rgb(184,138,0)",
    "rgb(0,138,184)", "rgb(100,61,255)", "rgb(153,0,0)", "rgb(153,77,0)", "rgb(214,107,0)", "rgb(153,153,0)"
];
*/

// A long list of unique colors.
const COLORS = [ // From https://stackoverflow.com/questions/1168260/algorithm-for-generating-unique-colors
    "#000000", "#00FF00", "#0000FF", "#FF0000", "#01FFFE", "#FFA6FE", "#FFDB66", "#006401", "#010067", "#95003A",
    "#007DB5", "#FF00F6", "#FFEEE8", "#774D00", "#90FB92", "#0076FF", "#D5FF00", "#FF937E", "#6A826C", "#FF029D",
    "#FE8900", "#7A4782", "#7E2DD2", "#85A900", "#FF0056", "#A42400", "#00AE7E", "#683D3B", "#BDC6FF", "#263400",
    "#BDD393", "#00B917", "#9E008E", "#001544", "#C28C9F", "#FF74A3", "#01D0FF", "#004754", "#E56FFE", "#788231",
    "#0E4CA1", "#91D0CB", "#BE9970", "#968AE8", "#BB8800", "#43002C", "#DEFF74", "#00FFC6", "#FFE502", "#620E00",
    "#008F9C", "#98FF52", "#7544B1", "#B500FF", "#00FF78", "#FF6E41", "#005F39", "#6B6882", "#5FAD4E", "#A75740",
    "#A5FFD2", "#FFB167", "#009BFF", "#E85EBE",
];

/**
 * Port of Java's String `hashCode()` function.  Consistently returns the same integer for equal strings.
 * 
 * @param {string} string - string to hash
 * @return {number} integer hash code value of the string
 */
function hashCode(string) {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        const char = string.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

/**
 * Component that describes a track's metadata.
 * 
 * @author Silas Hsu
 */
class MetadataIndicator extends React.PureComponent {
    static propTypes = {
        track: PropTypes.instanceOf(TrackModel).isRequired, // The track for which to indicate metadata
        terms: PropTypes.arrayOf(PropTypes.string), // Metadata terms to indicate
        /**
         * Called when the component is clicked.  Signature: (event: MouseEvent, term: string)
         *     `event` - the click event
         *     `term` - the term whose indicator was clicked
         */
        onClick: PropTypes.func
    };

    static defaultProps = {
        terms: [],
        onClick: () => undefined,
    };

    static WIDTH = 15;

    constructor(props) {
        super(props);
        this.renderBoxForTerm = this.renderBoxForTerm.bind(this);
    }

    /**
     * @param {string} [termValue] - metadata term value, or undefined
     * @return {string} color for that term value
     */
    getColorForTermValue(termValue) {
        if (!termValue) {
            return "white";
        }
        const colorIndex = Math.abs(hashCode(termValue)) % COLORS.length;
        return COLORS[colorIndex];
    }

    /**
     * @param {string} term - metadata term name for which to get data and render a box
     * @return {JSX.Element} － colored box for metadata term
     */
    renderBoxForTerm(term) {
        let termValue = this.props.track.getMetadata(term);
        const color = this.getColorForTermValue(termValue);
        return <ColoredBox
            key={term}
            color={color}
            term={term}
            termValue={termValue}
            onClick={event => this.props.onClick(event, term)}
        />;
    }

    render() {
        return (
        <div style={{display: "flex"}} >
            {this.props.terms.map(this.renderBoxForTerm)}
        </div>
        );
    }
}

/**
 * A colored box that indicates metadata value.  Has a tooltip that displays the metadata term and value.
 * 
 * @author Silas Hsu
 */
class ColoredBox extends React.PureComponent {
    static propTypes = {
        color: PropTypes.string.isRequired, // The color of the box
        term: PropTypes.string.isRequired, // The metadata term to indicate
        termValue: PropTypes.string, // The value of the metadata term
        onClick: PropTypes.func, // Callback for when the element is clicked
    };

    constructor(props) {
        super(props);
        this.state = {
            isShowingTooltip: false
        };
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
    }

    showTooltip() {
        this.setState({isShowingTooltip: true});
    }

    hideTooltip() {
        this.setState({isShowingTooltip: false});
    }

    render() {
        const {color, term, termValue, onClick} = this.props;
        const boxStyle = {
            backgroundColor: color,
            width: MetadataIndicator.WIDTH,
            height: '100%',
            borderLeft: '1px solid lightgrey'
        };
        const tooltipStyle = {
            backgroundColor: "rgba(173, 216, 230, 0.9)", // lightblue with opacity adjustment
            zIndex: 1,
            borderRadius: 5,
            marginRight: 5,
            padding: '0px 5px 5px',
            display: this.state.isShowingTooltip ? undefined : "none"
        };

        return (
        <Manager>
            <Target
                style={boxStyle}
                onClick={onClick}
                onMouseEnter={this.showTooltip}
                onMouseLeave={this.hideTooltip}
            />
            <Popper placement="left" style={tooltipStyle} >
                <span className="Tooltip-minor-text">{term}:</span>
                <br/>
                {termValue || "(no value)"}
            </Popper>
        </Manager>
        );
    }
}

export default MetadataIndicator;
