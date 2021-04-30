import React from "react";
import PropTypes from "prop-types";
import G3dFile from "g3djs";
import { scaleLinear } from "d3-scale";
import _ from "lodash";
import zlib from "zlib";
import util from "util";
import axios from "axios";
import percentile from "percentile";
import Drawer from "rc-drawer";
import TrackModel from "model/TrackModel";
import DisplayedRegionModel from "model/DisplayedRegionModel";
import { BigwigSource } from "./BigwigSource";
import { chromColors, colorAsNumber, g3dParser, getClosestValueIndex } from "./helpers-3dmol";
import { Legend } from "./Legend";
import { HoverInfo } from "./HoverInfo";
import { CategoryLegend } from "./CategoryLegend";
import { ResolutionList } from "./ResolutionList";
import { ModelListMenu } from "./ModelListMenu";
import { getTrackConfig } from "components/trackConfig/getTrackConfig";
import { reg2bin, reg2bins, getBigwigValueForAtom, atomInFilterRegions } from "./binning";
import { arraysEqual } from "../../../util";

import "rc-drawer/assets/index.css";
import "./ThreedmolContainer.css";

const unzip = util.promisify(zlib.unzip);

/**
 * the container for holding 3D structore rendered by 3Dmol.js
 * @author Daofeng Li
 */

class ThreedmolContainer extends React.Component {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired, // g3d Tracks to render
        g3dtrack: PropTypes.instanceOf(TrackModel).isRequired,
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        containerWidth: PropTypes.number,
        containerHeight: PropTypes.number,
    };

    constructor(props) {
        super(props);
        this.mol = window.$3Dmol;
        // this.mol.Parsers.g3d = g3dParser;
        this.viewer = null;
        this.viewer2 = null;
        this.model = {}; // hap as key, model as value
        this.model2 = {};
        this.g3dFile = null;
        this.bwData = {};
        this.annData = [];
        this.atomData = {}; //resolution as key, atom list as data
        // this.mol.chrom = {};
        // this.mol.chrom.atom = chromColors;
        this.chromHash = {}; // key: chrom, value: length
        this.mol.builtinColorSchemes.chrom = { prop: "chain", map: chromColors };
        this.myRef = React.createRef();
        this.myRef2 = React.createRef();
        this.state = {
            placement: "left",
            childShow: true,
            width: "25vw",
            height: null,
            menuFlexDirection: "column",
            layout: "picture",
            legendMin: 0,
            legendMax: 0,
            legendMinColor: "yellow", //yellow
            legendMaxColor: "red", //red
            colorScale: null,
            chrom: "",
            start: 0,
            end: 0,
            thumbStyle: "cartoon",
            hoveringAtom: null,
            paintMethod: "score", // other way is category
            paintRegion: "none", // region, chrom, genome, or new when switch bw url
            compAcolor: "green",
            compBcolor: "red",
            resolutions: [],
            resolution: 0, //auto, choose the lowest one, or dynamic in future with zoom level
            message: "",
            modelDisplayConfig: null,
            highlightingOn: true,
            highlightingColor: "yellow",
            highlightingChromColor: "grey",
            mainBoxWidth: 600,
            mainBoxHeight: 400,
            thumbBoxWidth: 300,
            thumbBoxHeight: 240,
            useExistingBigwig: true,
            bigWigUrl: "",
            bigWigInputUrl: "",
            uploadCompartmentFile: false,
            compartmentFileUrl: "",
            compartmentFileObject: null,
        };
        this.paintWithBigwig = _.debounce(this.paintWithBigwig, 150);
    }

    async componentDidMount() {
        const { width, height, viewRegion } = this.props;
        this.setState({ mainBoxHeight: height, mainBoxWidth: width });
        const features = viewRegion.getNavigationContext().getFeatures();
        features.forEach((feature) => (this.chromHash[feature.name] = feature.locus.end));
        const element = this.myRef.current;
        const element2 = this.myRef2.current;
        const config = { backgroundColor: "white" };
        this.viewer = this.mol.createViewer(element, { ...config, id: "box1" });
        this.viewer2 = this.mol.createViewer(element2, { ...config, id: "box2" });
        this.viewer.linkViewer(this.viewer2);
        this.viewer2.linkViewer(this.viewer);
        const trackModel = this.props.g3dtrack;
        // const url = "https://target.wustl.edu/dli/tmp/test2.g3d";
        // const url = "https://target.wustl.edu/dli/tmp/k562_1.g3d";
        this.g3dFile = new G3dFile({ url: trackModel.url });
        await this.g3dFile.readHeader();
        const reso = Math.max(...this.g3dFile.meta.resolutions);
        this.setState({ resolutions: this.g3dFile.meta.resolutions, resolution: reso });
    }

    async componentDidUpdate(prevProps, prevState) {
        const { paintRegion, bigWigUrl, bigWigInputUrl, useExistingBigwig } = this.state;
        const { width, height } = this.props;
        const halftWidth = width * 0.5;
        if (
            this.state.legendMaxColor !== prevState.legendMaxColor ||
            this.state.legendMinColor !== prevState.legendMinColor
        ) {
            await this.paintBigwig(paintRegion);
        }
        if (this.state.compAcolor !== prevState.compAcolor || this.state.compBcolor !== prevState.compBcolor) {
            await this.paintWithAnnotation();
        }
        if (this.state.thumbStyle !== prevState.thumbStyle) {
            switch (this.state.thumbStyle) {
                case "cartoon":
                    Object.keys(this.model2).forEach((hap) => this.model2[hap].show());
                    this.viewer2.setStyle({}, { cartoon: { colorscheme: "chrom", style: "trace", thickness: 1 } });
                    break;
                case "sphere":
                    Object.keys(this.model2).forEach((hap) => this.model2[hap].show());
                    this.viewer2.setStyle({}, { sphere: { colorscheme: "chrom", opacity: 1, radius: 2 } });
                    break;
                case "cross":
                    Object.keys(this.model2).forEach((hap) => this.model2[hap].show());
                    this.viewer2.setStyle({}, { cross: { colorscheme: "chrom", opacity: 1, radius: 2 } });
                    break;
                case "line":
                    Object.keys(this.model2).forEach((hap) => this.model2[hap].show());
                    this.viewer2.setStyle({}, { line: { colorscheme: "chrom", opacity: 1, radius: 0.8 } });
                    break;
                case "hide":
                    Object.keys(this.model2).forEach((hap) => this.model2[hap].hide());
                    break;
                default:
                    break;
            }
            this.viewer2.render();
        }
        if (this.state.resolution !== prevState.resolution) {
            await this.prepareAtomData();
        }
        if (this.state.highlightingOn !== prevState.highlightingOn) {
            if (this.state.highlightingOn) {
                this.highlightRegions();
            } else {
                this.removeHighlightRegions();
            }
        }
        if (prevProps.viewRegion !== this.props.viewRegion) {
            if (this.state.highlightingOn) {
                this.highlightRegions();
            }
            if (paintRegion === "region") {
                await this.paintBigwig("region");
            } else if (paintRegion === "chrom") {
                const chroms = this.viewRegionToChroms();
                const prevChroms = prevProps.viewRegion.getFeatureSegments().map((region) => region.getName());
                if (!arraysEqual(prevChroms, chroms)) {
                    await this.paintBigwig("chrom");
                }
            }
        }
        if (
            bigWigUrl !== prevState.bigWigUrl ||
            bigWigInputUrl !== prevState.bigWigInputUrl ||
            useExistingBigwig !== prevState.useExistingBigwig
        ) {
            this.setState({ paintRegion: "new" });
        }
        if (this.state.layout !== prevState.layout) {
            if (this.state.layout === "side" && this.state.thumbStyle !== "hide") {
                this.setState({
                    mainBoxHeight: height,
                    mainBoxWidth: halftWidth,
                    thumbBoxHeight: height,
                    thumbBoxWidth: halftWidth,
                });
            } else {
                this.setState({
                    mainBoxHeight: height,
                    mainBoxWidth: width,
                    thumbBoxHeight: 240,
                    thumbBoxWidth: 300,
                });
            }
        }
    }

    componentWillUnmount() {
        this.clearScene();
        this.bwData = {}; //clean
        this.annData = [];
        this.atomData = {};
    }

    viewRegionToChroms = () => {
        const regions = this.props.viewRegion.getFeatureSegments();
        return regions.map((region) => region.getName());
    };

    viewRegionToRegions = () => {
        const regions = this.props.viewRegion.getFeatureSegments();
        return regions.map((region) => ({
            chrom: region.getName(),
            start: region.relativeStart,
            end: region.relativeEnd,
        }));
    };

    onMenuPositionChange = (e) => {
        const value = e.target.value;
        this.setState(
            {
                placement: value,
                width: value === "right" || value === "left" ? "25vw" : null,
                height: value === "right" || value === "left" ? null : "40vh",
                menuFlexDirection: value === "right" || value === "left" ? "column" : "row",
                childShow: false,
            },
            () => {
                this.setState({
                    childShow: true,
                });
            }
        );
    };

    /**
     * atoms with hover event added
     * @param {*} atoms2
     */
    assginAtomsCallbacks = (atoms2) => {
        const atoms = {};
        Object.keys(atoms2).forEach((hap) => {
            const addevents = atoms2[hap].map((atom2) => {
                // mouse over and click handler
                const atom = Object.assign({}, atom2);
                atom.hoverable = true;
                let oldStyle;
                atom.hover_callback = (at) => {
                    // console.log('hover', at.resi)
                    this.setState({ hoveringAtom: at });
                    oldStyle = { ...at.style };
                    // console.log(oldStyle)
                    // this.viewer.setStyle({resi: at.resi}, {sphere: {color: 'pink', opacity: 1, radius: 2}});
                    // this.viewer.setStyle({resi: at.resi}, {cross: {color: 'pink', opacity: 1, radius: 2}});
                    this.viewer.setStyle(
                        { resi: [`${at.resi}-${at.resi + 1}`] },
                        { cartoon: { color: "#ff3399", style: "trace", thickness: 1 } }
                    );
                    this.viewer.render();
                };
                atom.unhover_callback = (at) => {
                    // console.log('unhover', at);
                    this.setState({ hoveringAtom: null });
                    this.viewer.setStyle({ resi: [`${at.resi}-${at.resi + 1}`] }, oldStyle);
                    this.viewer.render();
                };
                atom.clickable = true;
                atom.callback = (at) => {
                    // at.color = 0x0000ff;
                    // at.style= {cartoon: {color: '#ff3399', style: 'trace', thickness: 1}}
                    console.log("clicked", at);
                };
                return atom;
            });
            atoms[hap] = addevents;
        });
        return atoms;
    };

    clearScene = () => {
        this.viewer2.clear();
        this.viewer.clear();
        this.model2 = {};
        this.model = {};
    };

    prepareAtomData = async () => {
        this.setState({ message: "updating..." });
        this.clearScene();
        const { resolution } = this.state;
        const resString = resolution.toString();
        let atoms2, atoms; // atoms2 original object, atoms with added events callback
        if (this.atomData.hasOwnProperty(resString)) {
            [atoms2, atoms] = this.atomData[resString];
        } else {
            const data = await this.g3dFile.readData(resolution);
            atoms2 = g3dParser(data);
            atoms = this.assginAtomsCallbacks(atoms2);
            this.atomData[resString] = [atoms2, atoms];
        }
        const modelDisplayConfig = {};
        Object.keys(atoms2).forEach((hap) => (modelDisplayConfig[hap] = true));
        this.setState({ modelDisplayConfig });
        Object.keys(atoms2).forEach((hap) => {
            this.model2[hap] = this.viewer2.addModel();
            this.model2[hap].addAtoms(atoms2[hap]);
            this.model[hap] = this.viewer.addModel();
            this.model[hap].addAtoms(atoms[hap]);
        });

        this.viewer2.setStyle({}, { cartoon: { colorscheme: "chrom", style: "trace", thickness: 1 } });
        this.viewer2.render();

        // the main viewer

        // this.viewer.setBackgroundColor('white');
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: 0.3 } });
        this.viewer.zoomTo();
        this.viewer.render();
        // this.viewer.zoom(1.2, 1000);

        // console.log(this.viewer, this.model)
        // element.style.border='1px red solid';
        // element2.style.border='1px black solid';

        this.highlightRegions();

        this.setState({ message: "" });
    };

    toggleUseBigWig = () => {
        this.setState((prevState) => {
            return { useExistingBigwig: !prevState.useExistingBigwig };
        });
    };

    handleBigWigUrlChange = (e) => {
        this.setState({ bigWigUrl: e.target.value.trim() });
    };

    handleBigWigInputUrlChange = (e) => {
        this.setState({ bigWigInputUrl: e.target.value.trim() });
    };

    toggleModelDisplay = (hap) => {
        const newDisplayConfig = { ...this.state.modelDisplayConfig, [hap]: !this.state.modelDisplayConfig[hap] };
        console.log(newDisplayConfig, hap);
        if (newDisplayConfig[hap]) {
            this.model2[hap].show();
            this.model[hap].show();
        } else {
            this.model2[hap].hide();
            this.model[hap].hide();
        }
        this.viewer2.render();
        this.viewer.render();
        this.setState({ modelDisplayConfig: newDisplayConfig });
    };

    updateLegendColor = (k, color) => {
        this.setState({ [k]: color });
    };

    updateResolution = (resolution) => {
        this.setState({ resolution });
    };

    highlightRegions = () => {
        const { highlightingColor, highlightingChromColor } = this.state;
        const regions = this.viewRegionToRegions();
        const colorByRegion = function (atom, region) {
            if (
                atom.chain === region.chrom &&
                atom.properties.start >= region.start &&
                atom.properties.start <= region.end
            ) {
                return highlightingColor;
            } else {
                return highlightingChromColor;
            }
        };
        // this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: 0.3, hidden: true } }); //remove existing style
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: 0.3 } }); //remove existing style
        regions.forEach((region) => {
            this.viewer.setStyle(
                { chain: region.chrom },
                { cartoon: { colorfunc: (atom) => colorByRegion(atom, region), style: "trace", thickness: 1 } }
            );
        });
        this.setState({ highlightingOn: true });
        this.viewer.render();
    };

    removeHighlightRegions = () => {
        const regions = this.viewRegionToRegions();
        regions.forEach((region) => {
            this.viewer.setStyle(
                { chain: region.chrom },
                { line: { colorscheme: "chrom", opacity: 0.3, hidden: true } }
            );
        });
        this.setState({ highlightingOn: false });
        this.viewer.render();
    };

    removeHighlightChrom = (chroms) => {
        chroms.forEach((chrom) => {
            this.viewer.setStyle({ chain: chrom }, { line: { colorscheme: "chrom", opacity: 0.3, hidden: true } });
        });
        this.viewer.render();
    };
    /**
     * get min and max value of a keeps object for scale and legend
     * @param {*} keepers keeper object, {chrom: {binkey: [list of bw items]}}
     * @param {*} regions list of regions or chroms
     * @param {*} regionMode true or false, indicate if paint region or not
     */
    minMaxOfKeepers = (keepers, regions, regionMode) => {
        const values = [];
        if (regionMode) {
            regions.forEach((region) => {
                const binkeys = reg2bins(region.start, region.end).map((k) => k.toString());
                binkeys.forEach((binkey) => {
                    if (keepers.hasOwnProperty(region.chrom)) {
                        if (keepers[region.chrom].hasOwnProperty(binkey)) {
                            keepers[region.chrom][binkey].forEach((item) => {
                                if (item.start >= region.start && item.end <= region.end) {
                                    values.push(item.score);
                                }
                            });
                        }
                    }
                });
            });
        } else {
            regions.forEach((chrom) => {
                Object.keys(keepers[chrom]).forEach((binkey) => {
                    keepers[chrom][binkey].forEach((item) => values.push(item.score));
                });
            });
        }
        return values.length ? percentile([5, 95], values) : [0, 0]; // use percentile instead for better visual
    };

    paintWithBigwig = async (bwUrl, resolution, regions, chooseRegion) => {
        this.setState({ paintMethod: "score", paintRegion: chooseRegion });
        const { legendMinColor, legendMaxColor } = this.state;
        const keepers = {};
        const queryChroms = chooseRegion === "region" ? regions.map((r) => r.chrom) : regions;
        const fetchedChroms = [];
        const promises = [];
        const key = `${bwUrl}-${resolution}`;
        if (!this.bwData.hasOwnProperty(key)) {
            this.bwData[key] = {};
        }
        queryChroms.forEach((chrom) => {
            if (!this.bwData[key].hasOwnProperty(chrom)) {
                fetchedChroms.push(chrom);
                promises.push(this.fetchBwData(bwUrl, resolution, chrom));
            } else {
                keepers[chrom] = this.bwData[key][chrom];
            }
        });

        const fetchedData = await Promise.all(promises);
        for (let i = 0; i < fetchedChroms.length; i++) {
            keepers[fetchedChroms[i]] = fetchedData[i];
            this.bwData[key][fetchedChroms[i]] = fetchedData[i];
        }
        const [minScore, maxScore] = this.minMaxOfKeepers(keepers, regions, chooseRegion === "region");
        const filterRegions = {}; // key, chrom, value, list of [start, end] , for GSV later
        if (chooseRegion === "region") {
            regions.forEach((r) => {
                if (!filterRegions.hasOwnProperty(r.chrom)) {
                    filterRegions[r.chrom] = [];
                }
                filterRegions[r.chrom].push([r.start, r.end]);
            });
        } else {
            regions.forEach((chrom) => {
                if (!filterRegions.hasOwnProperty(chrom)) {
                    filterRegions[chrom] = [];
                }
                filterRegions[chrom].push([0, this.chromHash[chrom]]);
            });
        }
        // console.log(filterRegions);
        const colorScale = scaleLinear()
            .domain([minScore, maxScore])
            .range([legendMinColor, legendMaxColor])
            .clamp(true);
        const colorByValue = function (atom) {
            if (atomInFilterRegions(atom, filterRegions)) {
                const value = getBigwigValueForAtom(keepers, atom, resolution);
                if (value) {
                    return colorAsNumber(colorScale(value));
                } else {
                    return "grey";
                }
            } else {
                return "grey";
            }
        };
        queryChroms.forEach((chrom) => {
            this.viewer.setStyle(
                { chain: chrom },
                { cartoon: { colorfunc: colorByValue, style: "trace", thickness: 1 } }
            );
        });
        this.viewer.render();
        this.setState({
            legendMax: maxScore,
            legendMin: minScore,
            colorScale,
        });
    };

    removePaint = () => {
        if (!this.state.colorScale) return;
        this.setState({ paintRegion: "none" });
        // this.viewer.setStyle({}, { cartoon: { color: "grey", style: "trace", thickness: 1 } });
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: 0.3 } });
        this.viewer.render();
        this.setState({
            legendMax: 0,
            legendMin: 0,
            colorScale: null,
            highlightingOn: false,
        });
    };

    paintBigwig = async (chooseRegion) => {
        this.setState({ paintRegion: chooseRegion, message: "numerical painting..." });
        const { useExistingBigwig, bigWigUrl, bigWigInputUrl, resolution } = this.state;
        const bwUrl = useExistingBigwig ? bigWigUrl : bigWigInputUrl;
        if (!bwUrl.length) {
            this.setState({ message: "bigwig url for paint is empty, abort..." });
            return;
        }
        const regions = this.viewRegionToRegions();
        const chroms = this.viewRegionToChroms();
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: 0.3 } });
        switch (chooseRegion) {
            case "region":
                await this.paintWithBigwig(bwUrl, resolution, regions, chooseRegion);
                break;
            case "chrom":
                await this.paintWithBigwig(bwUrl, resolution, chroms, chooseRegion);
                break;
            case "genome":
                await this.paintWithBigwig(bwUrl, resolution, Object.keys(this.chromHash), chooseRegion);
                break;
            default:
                break;
        }
        this.setState({ message: "" });
    };

    /**
     * fetch whole chrom data from bigwig, bwurl-resolution as data cache key
     * @param {*} bwUrl bigwig url
     * @param {*} resolution resolution in number
     * @param {*} chrom chrom string
     */
    fetchBwData = async (bwUrl, resolution, chrom) => {
        try {
            const keeper = {};
            const bw = new BigwigSource(bwUrl);
            const bwData = await bw.getData(chrom, 0, this.chromHash[chrom], { scale: 1 / resolution });
            bwData.forEach((bw) => {
                const binkey = reg2bin(bw.start, bw.end).toString();
                if (!keeper.hasOwnProperty(binkey)) {
                    keeper[binkey] = [];
                }
                keeper[binkey].push(bw);
            });
            return keeper;
        } catch (error) {
            this.setState({ message: "reading bigwig error, abort..." });
            return;
        }
    };

    paintWithAnnotation = async () => {
        this.setState({ paintMethod: "category" });
        const { compAcolor, compBcolor } = this.state;
        const ann = this.annData.length ? this.annData : await this.getAnnotationData();
        const annStarts = ann.map((b) => b.start); //sorted by default
        const colorByCategory = function (atom) {
            const a = getClosestValueIndex(annStarts, atom.properties.start);
            // if(atom.properties.start >= start && atom.properties.start <= end){
            // console.log(atom)
            const category = ann[a].category;
            // console.log(a, value)
            return category === "A" ? compAcolor : compBcolor;
            // }else {
            //   return 'grey';
            // }
        };
        this.viewer.setStyle(
            { chain: "chr7" },
            { cartoon: { colorfunc: colorByCategory, style: "trace", thickness: 1 } }
        );
        this.viewer.render();
    };

    getAnnotationData = async () => {
        const response = await axios.get("https://wangftp.wustl.edu/~dli/tmp/4DNFIL65C8ZI.txt.gz", {
            responseType: "arraybuffer",
        });
        //    const response = await axios.get(
        //     'https://wangftp.wustl.edu/~dli/tmp/4DNFIL65C8ZI_copy.txt',
        //     {responseType: 'arraybuffer'}
        //  );
        // console.log(response)
        const buffer = Buffer.from(response.data);
        //  console.log(buffer)
        let dataString;
        if (response.headers["content-type"] === "text/plain") {
            // text file
            dataString = buffer.toString();
        } else {
            const unzipped = await unzip(buffer);
            dataString = unzipped.toString();
        }
        const data = dataString.split("\n");
        // console.log(data);
        const ann = [];
        data.slice(1).forEach((line) => {
            const t = line.trim().split("\t");
            if (t.length === 8) {
                if (t[0] === "chr7") {
                    ann.push({
                        start: Number.parseInt(t[1], 10),
                        end: Number.parseInt(t[1], 10),
                        category: Number.parseFloat(t[7]) > 0 ? "A" : "B",
                    });
                }
            }
        });
        console.log(ann);
        this.annData = ann;
        return ann;
    };

    onLayoutChange = (e) => {
        this.setState({
            layout: e.target.value,
        });
    };

    handleThumbStyleChange = (e) => {
        this.setState({
            thumbStyle: e.target.value,
        });
    };

    render() {
        const {
            legendMax,
            legendMin,
            colorScale,
            layout,
            thumbStyle,
            hoveringAtom,
            compAcolor,
            compBcolor,
            paintMethod,
            resolutions,
            resolution,
            childShow,
            message,
            modelDisplayConfig,
            menuFlexDirection,
            highlightingOn,
            mainBoxHeight,
            mainBoxWidth,
            thumbBoxHeight,
            thumbBoxWidth,
            useExistingBigwig,
            bigWigUrl,
            bigWigInputUrl,
            paintRegion,
        } = this.state;
        const { tracks } = this.props;
        const categories = { A: compAcolor, B: compBcolor };
        const bwTracks = tracks.filter((track) => getTrackConfig(track).isBigwigTrack());
        return (
            <div id="threed-mol-container">
                {childShow && (
                    <Drawer
                        placement={this.state.placement}
                        width={this.state.width}
                        height={this.state.height}
                        level={null}
                    >
                        <div id="accordion" style={{ flexDirection: menuFlexDirection }}>
                            <div className="card">
                                <div className="card-header" id="headingOne">
                                    <h5 className="mb-0">
                                        <button
                                            className="btn btn-link btn-block text-left"
                                            data-toggle="collapse"
                                            data-target="#collapseOne"
                                            aria-expanded="true"
                                            aria-controls="collapseOne"
                                        >
                                            Model data
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapseOne" className="collapse show" aria-labelledby="headingOne">
                                    <div className="card-body">
                                        <div>
                                            <ResolutionList
                                                resolution={resolution}
                                                resolutions={resolutions}
                                                onUpdateResolution={this.updateResolution}
                                            />
                                        </div>
                                        <div>
                                            <ModelListMenu
                                                modelDisplay={modelDisplayConfig}
                                                onToggleModelDisplay={this.toggleModelDisplay}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-header" id="headingTwo">
                                    <h5 className="mb-0">
                                        <button
                                            className="btn btn-link btn-block text-left"
                                            data-toggle="collapse"
                                            data-target="#collapseTwo"
                                            aria-expanded="true"
                                            aria-controls="collapseTwo"
                                        >
                                            Layout
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapseTwo" className="collapse show" aria-labelledby="headingTwo">
                                    <div className="card-body">
                                        <div>
                                            <strong>Viwers:</strong>
                                            <ul>
                                                <li>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            value="picture"
                                                            name="layout"
                                                            checked={layout === "picture"}
                                                            onChange={this.onLayoutChange}
                                                        />
                                                        <span>Picture in picture</span>
                                                    </label>
                                                </li>

                                                <li>
                                                    <label>
                                                        <input
                                                            type="radio"
                                                            name="layout"
                                                            value="side"
                                                            checked={layout === "side"}
                                                            onChange={this.onLayoutChange}
                                                        />
                                                        <span>Side by side</span>
                                                    </label>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="thumb-control">
                                            <strong>Thumbnail structure:</strong>
                                            <label>
                                                <input
                                                    name="thumbStyle"
                                                    type="radio"
                                                    value="cartoon"
                                                    checked={this.state.thumbStyle === "cartoon"}
                                                    onChange={this.handleThumbStyleChange}
                                                />
                                                Cartoon
                                            </label>
                                            <label>
                                                <input
                                                    name="thumbStyle"
                                                    type="radio"
                                                    value="sphere"
                                                    checked={this.state.thumbStyle === "sphere"}
                                                    onChange={this.handleThumbStyleChange}
                                                />
                                                Sphere
                                            </label>
                                            <label>
                                                <input
                                                    name="thumbStyle"
                                                    type="radio"
                                                    value="cross"
                                                    checked={this.state.thumbStyle === "cross"}
                                                    onChange={this.handleThumbStyleChange}
                                                />
                                                Cross
                                            </label>
                                            <label>
                                                <input
                                                    name="thumbStyle"
                                                    type="radio"
                                                    value="line"
                                                    checked={this.state.thumbStyle === "line"}
                                                    onChange={this.handleThumbStyleChange}
                                                />
                                                Line
                                            </label>
                                            <label>
                                                <input
                                                    name="thumbStyle"
                                                    type="radio"
                                                    value="hide"
                                                    checked={this.state.thumbStyle === "hide"}
                                                    onChange={this.handleThumbStyleChange}
                                                />
                                                Hide
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header" id="headingThree">
                                    <h5 className="mb-0">
                                        <button
                                            className="btn btn-link btn-block text-left"
                                            data-toggle="collapse"
                                            data-target="#collapseThree"
                                            aria-expanded="true"
                                            aria-controls="collapseThree"
                                        >
                                            Highlighting
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapseThree" className="collapse show" aria-labelledby="headingThree">
                                    <div className="card-body">
                                        <p>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={highlightingOn}
                                                onClick={this.highlightRegions}
                                            >
                                                Highlight
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                disabled={!highlightingOn}
                                                onClick={this.removeHighlightRegions}
                                            >
                                                Remove highlight
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header" id="heading4">
                                    <h5 className="mb-0">
                                        <button
                                            className="btn btn-link btn-block text-left"
                                            data-toggle="collapse"
                                            data-target="#collapse4"
                                            aria-expanded="true"
                                            aria-controls="collapse4"
                                        >
                                            Numerical Painting
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapse4" className="collapse show" aria-labelledby="heading4">
                                    <div className="card-body">
                                        <div>
                                            <p>
                                                <strong>BigWig data:</strong>
                                            </p>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="useBw"
                                                    checked={useExistingBigwig === true}
                                                    onChange={this.toggleUseBigWig}
                                                />
                                                <span>Use loaded tracks</span>
                                            </label>
                                        </div>
                                        {useExistingBigwig ? (
                                            bwTracks.length ? (
                                                <select
                                                    name="bwUrlList"
                                                    onChange={this.handleBigWigUrlChange}
                                                    defaultValue={bigWigUrl}
                                                >
                                                    <option value="">--</option>
                                                    {bwTracks.map((tk) => (
                                                        <option key={tk.url} value={tk.url}>
                                                            {tk.getDisplayLabel() || tk.url}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className="text-danger font-italic text-sm-left">
                                                    No loaded bigwig track, please uncheck the option above and use a
                                                    bigwig file URL.
                                                </span>
                                            )
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder="bigwig url"
                                                value={bigWigInputUrl}
                                                onChange={this.handleBigWigInputUrlChange}
                                            />
                                        )}

                                        <p>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={paintRegion === "region"}
                                                onClick={() => this.paintBigwig("region")}
                                            >
                                                Paint region
                                            </button>
                                            <button
                                                className="btn btn-success btn-sm"
                                                disabled={paintRegion === "chrom"}
                                                onClick={() => this.paintBigwig("chrom")}
                                            >
                                                Paint chromosome
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                disabled={paintRegion === "genome"}
                                                onClick={() => this.paintBigwig("genome")}
                                            >
                                                Paint genome
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                disabled={paintRegion === "none"}
                                                onClick={this.removePaint}
                                            >
                                                Remove paint
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header" id="heading5">
                                    <h5 className="mb-0">
                                        <button
                                            className="btn btn-link btn-block text-left"
                                            data-toggle="collapse"
                                            data-target="#collapse5"
                                            aria-expanded="true"
                                            aria-controls="collapse5"
                                        >
                                            Annotation Painting
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapse5" className="collapse show" aria-labelledby="heading5">
                                    <div className="card-body">
                                        <p>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={this.paintWithAnnotation}
                                            >
                                                paint chr7 with compartments data
                                            </button>{" "}
                                            <a
                                                href="https://data.4dnucleome.org/files-processed/4DNFIL65C8ZI/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                4DNFIL65C8ZI
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Drawer>
                )}

                <div>
                    <div className="placement-container">
                        <div className="text-left">
                            <label>
                                Menu position:
                                <select
                                    style={{ marginLeft: "1ch", marginRight: "1ch" }}
                                    defaultValue={this.state.placement}
                                    onChange={this.onMenuPositionChange}
                                >
                                    <option value="left">Left</option>
                                    <option value="top">Top</option>
                                    <option value="right">Right</option>
                                    <option value="bottom">Bottom</option>
                                </select>
                            </label>
                            <span className="text-danger font-italic">
                                {message.length ? <div>{message}</div> : null}
                            </span>
                        </div>

                        <div id="legend">
                            {paintMethod === "score" ? (
                                <Legend
                                    min={legendMin}
                                    max={legendMax}
                                    colorScale={colorScale}
                                    onUpdateLegendColor={this.updateLegendColor}
                                />
                            ) : (
                                <CategoryLegend categories={categories} onUpdateLegendColor={this.updateLegendColor} />
                            )}
                        </div>
                    </div>

                    <div className={layout}>
                        <div id="hoverbox">
                            <HoverInfo atom={hoveringAtom} resolution={resolution} />
                        </div>
                        <div
                            className="box1"
                            style={{ width: mainBoxWidth, height: mainBoxHeight }}
                            ref={this.myRef}
                        ></div>
                        <div
                            className="box2"
                            style={{
                                width: thumbBoxWidth,
                                height: thumbBoxHeight,
                                display: thumbStyle === "hide" ? "none" : "block",
                            }}
                            ref={this.myRef2}
                        ></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ThreedmolContainer;
