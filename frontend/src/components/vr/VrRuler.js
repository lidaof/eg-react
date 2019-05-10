import React from 'react';
import PropTypes from 'prop-types';

import { Custom3DObject } from './Custom3DObject';
import RulerDesigner from '../../art/RulerDesigner';
import DisplayedRegionModel from '../../model/DisplayedRegionModel';
import { mergeGeometries } from './mergeGeometries';

const FONT_SIZE = 0.2;
const FONT_URL = "https://raw.githubusercontent.com/rollup/three-jsnext/master/examples/fonts/helvetiker_regular.typeface.json";
const FONT_PROMISE = new Promise((resolve, reject) => {
    const fontLoader = new window.THREE.FontLoader();
    fontLoader.load(FONT_URL, resolve, undefined, reject);
});
const LINE_MATERIAL = new window.THREE.LineBasicMaterial({color: "black"});
const MATERIAL = new window.THREE.MeshBasicMaterial({color: "black"});

/**
 * A ruler on the x-z plane.
 * 
 * @author Silas Hsu
 */
class VrRuler extends React.Component {
    static propTypes = {
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        width: PropTypes.number.isRequired,
        tickHeight: PropTypes.number,
        z: PropTypes.number
    };

    static defaultProps = {
        tickHeight: 1,
        z: 0,
    };

    constructor(props) {
        super(props);
        this.state = {
            font: null
        };
        FONT_PROMISE.then((font) => this.setState({font: font}));
    }

    _makeLines() {
        const lineFactory = new VrRulerLineFactory(this.props.tickHeight);
        const lineDesign = new RulerDesigner(1, lineFactory).design(this.props.viewRegion, this.props.width);
        let lineVertices = [];
        for (let data of lineDesign) {
            if (data != null) {
                lineVertices.push(...data);
            }
        }
        lineVertices = new Float32Array(lineVertices);
        const lineGeometry = new window.THREE.BufferGeometry();
        lineGeometry.addAttribute('position', new window.THREE.BufferAttribute(lineVertices, 3));
        return new window.THREE.LineSegments(lineGeometry, LINE_MATERIAL);
    }

    _makeText() {
        const textFactory = new VrRulerTextFactory(FONT_SIZE, this.state.font);
        const textDesign = new RulerDesigner(4, textFactory).design(this.props.viewRegion, this.props.width);
        const mergedGeometry = mergeGeometries(textDesign.filter(element => element != null));
        return new window.THREE.Mesh(mergedGeometry, MATERIAL);
    }

    render() {
        if (this.state.font === null) {
            return null;
        }

        const lines = this._makeLines();
        const text = this._makeText();
        const commonProps = {rotation: "-90 0 0", position: `0 0 ${this.props.z}`}

        return <React.Fragment>
            <Custom3DObject object={lines} {...commonProps} />,
            <Custom3DObject object={text} {...commonProps} />,
        </React.Fragment>;
    }
}

class VrRulerLineFactory {
    constructor(majorTickHeight) {
        this.majorTickHeight = majorTickHeight;
    }

    _makeLineGeometry(start, end) {
        return [...start, ...end];
    }

    mainLine(width) {
        return this._makeLineGeometry([0, 0, 0], [width, 0, 0]);
    }

    majorTick(x) {
        return this._makeLineGeometry([x, this.majorTickHeight, 0], [x, 0, 0]);
    }

    majorTickText(x, text) {
        return null;
    }

    minorTick(x) {
        return this.majorTick(x);
    }

    minorTickText(x, text) {
        return null;
    }
}

const PADDING = 0.03;
class VrRulerTextFactory {
    
    constructor(majorTextSize, font) {
        this.majorTextSize = majorTextSize;
        this.font = font;
    }

    _makeTextGeometry(text, x, size) {
        let geometry = new window.THREE.TextBufferGeometry(text, {
            font: this.font,
            size: size,
            height: 0
        });
        geometry.translate(x + PADDING, -PADDING - size, 0);
        return geometry;
    }

    mainLine(width) {
        return null;
    }

    majorTick(x) {
        return null;
    }

    majorTickText(x, text) {
        // return this._makeTextGeometry(text, x, this.majorTextSize);
        return null;
    }

    minorTick(x) {
        return null;
    }

    minorTickText(x, text) {
        return this._makeTextGeometry(text, x, this.majorTextSize / 2);
    }
}

export default VrRuler;
