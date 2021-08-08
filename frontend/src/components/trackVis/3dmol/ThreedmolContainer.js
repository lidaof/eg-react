import React from "react";
import PropTypes from "prop-types";
import G3dFile from "g3djs";
import { scaleLinear } from "d3-scale";
import _ from "lodash";
import zlib from "zlib";
import util from "util";
import axios from "axios";
import percentile from "percentile";
import { notify } from "react-notify-toast";
import Drawer from "rc-drawer";
import TrackModel from "model/TrackModel";
import DisplayedRegionModel from "model/DisplayedRegionModel";
import ChromosomeInterval from "model/interval/ChromosomeInterval";
import { getTrackConfig } from "components/trackConfig/getTrackConfig";
import GeneSearchBox3D from "components/genomeNavigator/GeneSearchBox3D";
import { BigwigSource } from "./BigwigSource";
import { CORS_PROXY } from "../imageTrack/OmeroSvgVisualizer";
import { chromColors, colorAsNumber, g3dParser, getClosestValueIndex, CYTOBAND_COLORS_SIMPLE } from "./helpers-3dmol";
import { Legend } from "./Legend";
import { HoverInfo } from "./HoverInfo";
import { CategoryLegend } from "./CategoryLegend";
import { ResolutionList } from "./ResolutionList";
import { ModelListMenu } from "./ModelListMenu";
import { FrameListMenu } from "./FrameListMenu";
import { ShapeList } from "./ShapeList";
import { OpacityThickness } from "./OpacityThickness";
import { ColorPicker } from "./ColorPicker";
import { ArrowList } from "./ArrowList";
import { StaticLegend } from "./StaticLegend";
import {
    reg2bin,
    reg2bins,
    getBigwigValueForAtom,
    atomInFilterRegions,
    findAtomsWithRegion,
    getCompartmentNameForAtom,
} from "./binning";
import {
    arraysEqual,
    readFileAsText,
    readFileAsBuffer,
    HELP_LINKS,
    getContrastingColor,
    getSymbolRegions,
} from "../../../util";

import "rc-drawer/assets/index.css";
import "./ThreedmolContainer.css";

const unzip = util.promisify(zlib.unzip);

/**
 * the container for holding 3D structure rendered by 3Dmol.js
 * @author Daofeng Li
 */

class ThreedmolContainer extends React.Component {
    static propTypes = {
        tracks: PropTypes.arrayOf(PropTypes.instanceOf(TrackModel)).isRequired,
        g3dtrack: PropTypes.instanceOf(TrackModel).isRequired, // g3d track id to get g3d track to render
        viewRegion: PropTypes.instanceOf(DisplayedRegionModel).isRequired,
        width: PropTypes.number,
        height: PropTypes.number,
        x: PropTypes.number, // x position to left screen from flex layout
        y: PropTypes.number, // y position
    };

    constructor(props) {
        super(props);
        this.mol = window.$3Dmol;
        // this.mol.Parsers.g3d = g3dParser;
        this.viewer = null;
        this.viewer2 = null;
        this.model = {}; // hap as key, model as value
        this.model2 = {};
        this.arrows = [];
        this.spheres = [];
        this.sphereLabels = [];
        this.shapes = [];
        this.shapeLabels = [];
        this.imageLabels = [];
        this.g3dFile = null;
        this.bwData = {};
        this.compData = {};
        this.annoData = {}; // annotation data cache
        this.expData = {}; // gene expression data cache
        this.cytobandData = {};
        this.atomData = {}; //resolution string as key, value: {hap: [atoms...]}
        this.atomStartsByChrom = {}; // resolution string as key, value: {hap: {chrom: [list of sorted atoms' starts]} }
        this.newAtoms = {}; // holder for addtional models for animation, key: file name, value {hap: [list of atoms]}
        this.atomKeeper = {}; // resolution string as key, value: {hap: keeper}
        // this.mol.chrom = {};
        // this.mol.chrom.atom = chromColors;
        this.bedLegend = {};
        this.chromHash = {}; // key: chrom, value: length
        this.mol.builtinColorSchemes.chrom = { prop: "chain", map: chromColors };
        this.myRef = React.createRef();
        this.myRef2 = React.createRef();
        this.state = {
            placement: "left",
            childShow: false,
            width: "25vw",
            height: null,
            menuFlexDirection: "column",
            layout: "picture",
            legendMin: 0,
            legendMax: 10,
            legendMinColor: "yellow", //yellow
            legendMaxColor: "red", //red
            colorScale: null,
            chrom: "",
            start: 0,
            end: 0,
            thumbStyle: "cartoon",
            hoveringAtom: null,
            hoveringX: 0,
            hoveringY: 0,
            paintMethod: "score", // other ways are compartmemt, annotation
            paintRegion: "none", // region, chrom, genome, or new when switch bw url
            paintCompartmentRegion: "none",
            paintAnnotationRegion: "none",
            A: "green", //  color for compartment A, same as below
            B: "red",
            A1: "rgb(34,139,34)",
            A2: "rgb(152,251,152)",
            B1: "rgb(220,20,60)",
            B2: "rgb(255,255,0)",
            B3: "rgb(112,128,144)",
            B4: "rgb(75,0,130)",
            NA: "rgb(255,255,255)",
            compFormat: "4dn", // default use 4DN format, or the 2014 Cell paper from Rao et.al
            resolutions: [],
            resolution: 0, //auto, choose the lowest one, or dynamic in future with zoom level
            message: "",
            modelDisplayConfig: null, // key: hap, value: true or false, true for display, false for hidden
            highlightingOn: false,
            highlightingColor: "#ffff00", // yellow
            highlightingColorChanged: false,
            // highlightingChromColor: "grey",
            highlightingChromColor: "#f2f2f2",
            mainBoxWidth: 600,
            mainBoxHeight: 400,
            thumbBoxWidth: 300,
            thumbBoxHeight: 240,
            useExistingBigwig: true,
            bigWigUrl: "",
            bigWigInputUrl: "",
            uploadCompartmentFile: true,
            compartmentFileUrl: "",
            compartmentFileObject: null,
            annotationFileObject: null,
            numFileObject: null,
            newG3dUrl: "",
            animateMode: false,
            frameAtoms: [],
            frameLabels: [],
            currentFrame: 0,
            myShapes: {},
            myShapeLabel: "",
            myShapeRegion: "",
            lineOpacity: 0.7,
            cartoonThickness: 0.3,
            useLegengMin: 0,
            useLegengMax: 10,
            autoLegendScale: true,
            myArrows: {},
            labelStyle: "shape", // or arrow
            annoFormat: "cytoband", // cytoband, refgene, bedrgb
            annoUsePromoter: false,
            gene: "green",
            promoter: "green",
            categories: null,
            staticCategories: null,
            numFormat: "bwtrack", //bwtrack, geneexp
        };
        this.paintWithBigwig = _.debounce(this.paintWithBigwig, 150);
        this.paintWithComparment = _.debounce(this.paintWithComparment, 150);
        this.paintWithAnnotation = _.debounce(this.paintWithAnnotation, 150);
    }

    async componentDidMount() {
        const { width, height, viewRegion, g3dtrack } = this.props;
        this.setState({ mainBoxHeight: height, mainBoxWidth: width });
        const features = viewRegion.getNavigationContext().getFeatures();
        features.forEach((feature) => (this.chromHash[feature.name] = feature.locus.end));
        const element = this.myRef.current;
        const element2 = this.myRef2.current;
        const config = { backgroundColor: "white" };
        this.viewer = this.mol.createViewer(element, { ...config, id: "box1" }); // main
        this.viewer2 = this.mol.createViewer(element2, { ...config, id: "box2" }); // thumbnail
        this.viewer.linkViewer(this.viewer2);
        this.viewer2.linkViewer(this.viewer);
        if (!g3dtrack) {
            this.setMessage("cannot parse g3d file error, please check your file or contact the browser team.");
            return;
        }
        let g3dconfig;
        if (g3dtrack.fileObj) {
            g3dconfig = { blob: g3dtrack.fileObj };
        } else {
            g3dconfig = { url: g3dtrack.url };
        }
        try {
            this.g3dFile = new G3dFile(g3dconfig);
        } catch (error) {
            this.setMessage("parse g3d file error, please check your file or contact the browser team.");
            return;
        }
        await this.g3dFile.readHeader();
        const reso = Math.max(...this.g3dFile.meta.resolutions);
        this.setState({ resolutions: this.g3dFile.meta.resolutions, resolution: reso });
    }

    async componentDidUpdate(prevProps, prevState) {
        const {
            paintRegion,
            bigWigUrl,
            bigWigInputUrl,
            useExistingBigwig,
            paintCompartmentRegion,
            frameLabels,
            animateMode,
            modelDisplayConfig,
            mainBoxHeight,
            mainBoxWidth,
            highlightingColor,
            lineOpacity,
            cartoonThickness,
            autoLegendScale,
            layout,
            thumbStyle,
            highlightingOn,
            myShapes,
            myArrows,
            A,
            B,
            A1,
            A2,
            B1,
            B2,
            B3,
            B4,
            legendMaxColor,
            legendMinColor,
            resolution,
            annoUsePromoter,
            gene,
            promoter,
            paintAnnotationRegion,
            annoFormat,
            numFormat,
            useLegengMax,
            useLegengMin,
        } = this.state;
        const { width, height } = this.props;
        const halftWidth = width * 0.5;
        if (legendMaxColor !== prevState.legendMaxColor || legendMinColor !== prevState.legendMinColor) {
            await this.paintBigwig(paintRegion);
        }
        if (
            A !== prevState.A ||
            B !== prevState.B ||
            A1 !== prevState.A1 ||
            A2 !== prevState.A2 ||
            B1 !== prevState.B1 ||
            B2 !== prevState.B2 ||
            B3 !== prevState.B3 ||
            B4 !== prevState.B4
        ) {
            await this.paintCompartment(paintCompartmentRegion);
        }
        if (gene !== prevState.gene || promoter !== prevState.promoter) {
            await this.paintAnnotation(paintAnnotationRegion);
        }
        if (thumbStyle !== prevState.thumbStyle) {
            switch (thumbStyle) {
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
                    this.setState({
                        mainBoxWidth: width,
                    });
                    break;
                default:
                    break;
            }
            this.viewer2.render();
        }
        if (resolution !== prevState.resolution) {
            this.removeHover();
            await this.prepareAtomData();
        }
        if (highlightingOn !== prevState.highlightingOn) {
            if (highlightingOn) {
                this.highlightRegions();
            } else {
                this.removeHighlightRegions();
            }
        }
        if (animateMode && frameLabels !== prevState.frameLabels) {
            this.updateModelFrames();
        }
        if (this.props.anchors3d !== prevProps.anchors3d) {
            if (this.props.anchors3d.length) {
                this.addAnchors3dToMyArrows(this.props.anchors3d);
            }
        }
        if (!_.isEqual(myArrows, prevState.myArrows)) {
            if (!_.isEmpty(myArrows)) {
                this.drawAnchors3d(modelDisplayConfig);
            } else {
                this.removeAnchors3d();
            }
        }
        if (this.props.geneFor3d !== prevProps.geneFor3d) {
            if (this.props.geneFor3d) {
                this.addGeneToMyShapes(this.props.geneFor3d);
            }
        }
        if (!_.isEqual(myShapes, prevState.myShapes)) {
            if (!_.isEmpty(myShapes)) {
                this.drawMyShapes(modelDisplayConfig);
            } else {
                this.removeMyShapes();
            }
        }
        if (!_.isEqual(prevProps.imageInfo, this.props.imageInfo)) {
            if (this.props.imageInfo) {
                this.drawImageLabel(modelDisplayConfig);
            } else {
                this.removeImageLabel();
            }
        }
        if (prevProps.viewRegion !== this.props.viewRegion) {
            const chroms = this.viewRegionToChroms();
            const prevChroms = prevProps.viewRegion.getFeatureSegments().map((region) => region.getName());
            if (!arraysEqual(prevChroms, chroms)) {
                // this.updateMainViewerClickable();
                // this.updateMainViewer();
                if (highlightingOn) {
                    this.highlightRegions();
                }
            }
            if (highlightingOn) {
                this.highlightRegions();
            }
            if (paintRegion === "region") {
                await this.paintBigwig("region");
            } else if (paintRegion === "chrom") {
                if (!arraysEqual(prevChroms, chroms)) {
                    await this.paintBigwig("chrom");
                }
            }
            if (paintCompartmentRegion === "region") {
                await this.paintCompartment("region");
            } else if (paintRegion === "chrom") {
                if (!arraysEqual(prevChroms, chroms)) {
                    await this.paintCompartment("chrom");
                }
            }
        }
        if (
            bigWigUrl !== prevState.bigWigUrl ||
            bigWigInputUrl !== prevState.bigWigInputUrl ||
            useExistingBigwig !== prevState.useExistingBigwig ||
            useLegengMax !== prevState.useLegengMax ||
            useLegengMin !== prevState.useLegengMin
        ) {
            this.setState({ paintRegion: "new" });
        }
        if (layout !== prevState.layout) {
            if (layout === "side" && thumbStyle !== "hide") {
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
        if (width !== prevProps.width || height !== prevProps.height) {
            this.setState({ mainBoxHeight: height, mainBoxWidth: width });
        }
        if (mainBoxHeight !== prevState.mainBoxHeight || mainBoxWidth !== prevState.mainBoxWidth) {
            this.viewer.render();
            this.viewer2.render();
        }
        if (highlightingColor !== prevState.highlightingColor) {
            this.setState({ highlightingColorChanged: true });
        }
        if (lineOpacity !== prevState.lineOpacity || cartoonThickness !== prevState.cartoonThickness) {
            this.setState({
                highlightingColorChanged: true,
                paintRegion: "none",
                paintCompartmentRegion: "none",
                paintAnnotationRegion: "none",
            });
        }
        if (autoLegendScale !== prevState.autoLegendScale) {
            this.setState({ paintRegion: "none" });
        }
        if (annoUsePromoter !== prevState.annoUsePromoter) {
            this.setState({ paintAnnotationRegion: "none" });
        }
        if (annoFormat !== prevState.annoFormat) {
            this.setState({ paintAnnotationRegion: "none", annotationFileObject: null });
        }
        if (numFormat !== prevState.numFormat) {
            this.setState({ paintRegion: "none", numFileObject: null });
        }
    }

    componentWillUnmount() {
        this.clearScene();
        this.bwData = {}; //clean
        this.compData = {};
        this.annoData = {};
        this.expData = {};
        this.atomData = {};
        this.newAtoms = {};
        this.atomStartsByChrom = {};
        this.cytobandData = {};
        // if (this.props.anchors3d.length && this.props.onSetAnchors3d) {
        //     this.props.onSetAnchors3d([]);
        // }
    }

    onSwitch = () => {
        this.setState((prevState) => {
            return { childShow: !prevState.childShow };
        });
    };

    removeHover = () => {
        this.setState({ hoveringAtom: null, hoveringX: 0, hoveringY: 0 });
    };

    drawImageLabel = (displayConfig) => {
        const { resolution } = this.state;
        const { imageInfo } = this.props;
        const resString = resolution.toString();
        this.prepareAtomKeeper();
        const displayedModelKeys = this.getDisplayedModelKeys(displayConfig);
        if (this.imageLabels.length) {
            this.removeImageLabel();
        }
        if (imageInfo) {
            //"assay_info": "Chromosomes, Nucleolus, GRCm38:11:16745166-16937185 mouse region"
            const splits = imageInfo.details.assay_info.split(":");
            const regionstr = "chr" + splits[1] + ":" + splits[2].split(" ")[0]; // tmp solution, to be fixed
            // console.log(imageInfo, regionstr);
            const locus = ChromosomeInterval.parse(regionstr);
            const atoms = findAtomsWithRegion(
                this.atomKeeper[resString],
                locus.chr,
                locus.start,
                locus.end,
                resolution,
                displayedModelKeys
            );
            // const img = document.createElement("img");
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.alt = imageInfo.imageId;
            img.width = 100;
            img.height = 100;
            // console.log(img);
            img.addEventListener("load", () => {
                atoms.forEach((atom) => {
                    this.imageLabels.push(
                        this.viewer.addLabel("", {
                            position: { x: atom.x, y: atom.y, z: atom.z },
                            backgroundImage: img,
                            // screenOffset: { x: 0, y: 0 },
                        })
                    );
                });
            });
            document.body.appendChild(img);
            img.src = `${CORS_PROXY}/${imageInfo.thumbnail}`;
        }
    };

    removeImageLabel = () => {
        this.imageLabels.forEach((label) => this.viewer.removeLabel(label));
        this.imageLabels = [];
    };

    drawMyShapes = (displayConfig) => {
        const { resolution, myShapes } = this.state;
        const resString = resolution.toString();
        this.prepareAtomKeeper();
        const displayedModelKeys = this.getDisplayedModelKeys(displayConfig);
        if (this.shapes.length) {
            this.removeMyShapes(false);
        }
        Object.keys(myShapes).forEach((s) => {
            if (myShapes[s].locus) {
                const locus = myShapes[s].locus;
                const atoms = findAtomsWithRegion(
                    this.atomKeeper[resString],
                    locus.chr,
                    locus.start,
                    locus.end,
                    resolution,
                    displayedModelKeys
                );
                atoms.forEach((atom) => {
                    let addingShape;
                    if (myShapes[s].outline === "sphere") {
                        addingShape = this.viewer.addSphere({
                            center: { x: atom.x, y: atom.y, z: atom.z },
                            radius: myShapes[s].size,
                            color: myShapes[s].color,
                            wireframe: myShapes[s].wireframe,
                        });
                    } else if (myShapes[s].outline === "box") {
                        addingShape = this.viewer.addBox({
                            corner: { x: atom.x, y: atom.y, z: atom.z },
                            dimensions: { w: myShapes[s].size, h: myShapes[s].size, d: myShapes[s].size },
                            color: myShapes[s].color,
                            wireframe: myShapes[s].wireframe,
                        });
                    }
                    this.shapes.push(addingShape);
                    this.shapeLabels.push(
                        this.viewer.addLabel(myShapes[s].label, {
                            position: { x: atom.x, y: atom.y, z: atom.z },
                            fontColor: myShapes[s].color,
                            backgroundColor: getContrastingColor(myShapes[s].color),
                            backgroundOpacity: 0.8,
                        })
                    );
                });
            } else if (myShapes[s].loci) {
                myShapes[s].loci.forEach((locusObj) => {
                    const { locus, label } = locusObj;
                    const atoms = findAtomsWithRegion(
                        this.atomKeeper[resString],
                        locus.chr,
                        locus.start,
                        locus.end,
                        resolution,
                        displayedModelKeys
                    );
                    atoms.forEach((atom) => {
                        let addingShape;
                        if (myShapes[s].outline === "sphere") {
                            addingShape = this.viewer.addSphere({
                                center: { x: atom.x, y: atom.y, z: atom.z },
                                radius: myShapes[s].size,
                                color: myShapes[s].color,
                                wireframe: myShapes[s].wireframe,
                            });
                        } else if (myShapes[s].outline === "box") {
                            addingShape = this.viewer.addBox({
                                corner: { x: atom.x, y: atom.y, z: atom.z },
                                dimensions: { w: myShapes[s].size, h: myShapes[s].size, d: myShapes[s].size },
                                color: myShapes[s].color,
                                wireframe: myShapes[s].wireframe,
                            });
                        }
                        this.shapes.push(addingShape);
                        this.shapeLabels.push(
                            this.viewer.addLabel(label, {
                                position: { x: atom.x, y: atom.y, z: atom.z },
                                fontColor: myShapes[s].color,
                                backgroundColor: getContrastingColor(myShapes[s].color),
                                backgroundOpacity: 0.8,
                            })
                        );
                    });
                });
            }
        });
        if (!this.shapes.length) {
            this.removeMyShapes();
            this.setState({ message: "cannot find matched atoms to label or no model is displaying, skip" });
            return;
        }
        this.viewer.render();
    };

    removeMyShapes = (updateRender = true) => {
        this.shapes.forEach((shape) => this.viewer.removeShape(shape));
        this.shapeLabels.forEach((label) => this.viewer.removeLabel(label));
        this.shapes = [];
        this.shapeLabels = [];
        if (updateRender) {
            this.viewer.render();
            this.setState({ message: "" });
        }
    };

    prepareAtomKeeper = () => {
        const { resolution } = this.state;
        const resString = resolution.toString();
        if (_.isEmpty(this.atomKeeper) || !this.atomKeeper.hasOwnProperty(resString)) {
            this.buildAtomKeeper();
        }
    };

    getDisplayedModelKeys = (displayConfig) => {
        const { resolution } = this.state;
        const resString = resolution.toString();
        let displayedModelKeys = Object.keys(this.atomKeeper[resString]);
        if (displayConfig) {
            displayedModelKeys = [];
            Object.keys(displayConfig).forEach((key) => {
                if (displayConfig[key]) {
                    displayedModelKeys.push(key);
                }
            });
        }
        return displayedModelKeys;
    };

    drawAnchors3d = (displayConfig) => {
        const { resolution, myArrows } = this.state;
        const resString = resolution.toString();
        this.prepareAtomKeeper();
        const displayedModelKeys = this.getDisplayedModelKeys(displayConfig);
        // console.log(displayedModelKeys);
        //clean existing arrows
        if (this.arrows.length) {
            this.removeAnchors3d(false);
        }
        Object.keys(myArrows).forEach((s) => {
            const anchor = myArrows[s];
            if (anchor.locus) {
                const atoms = findAtomsWithRegion(
                    this.atomKeeper[resString],
                    anchor.locus.chr,
                    anchor.locus.start,
                    anchor.locus.end,
                    resolution,
                    displayedModelKeys
                );
                atoms.forEach((atom) => {
                    this.arrows.push(
                        this.viewer.addArrow({
                            start: anchor.start,
                            end: { x: atom.x, y: atom.y, z: atom.z },
                            radius: anchor.radius,
                            color: anchor.color,
                            radiusRadio: 0.2, //hard-coded
                            mid: 1.0, //hard-coded
                        })
                    );
                });
            } else if (anchor.loci) {
                anchor.loci.forEach((lociItem) => {
                    const { locus } = lociItem;
                    const atoms = findAtomsWithRegion(
                        this.atomKeeper[resString],
                        locus.chr,
                        locus.start,
                        locus.end,
                        resolution,
                        displayedModelKeys
                    );
                    // console.log(atoms);
                    atoms.forEach((atom) => {
                        this.arrows.push(
                            this.viewer.addArrow({
                                start: anchor.start,
                                end: { x: atom.x, y: atom.y, z: atom.z },
                                radius: anchor.radius,
                                color: anchor.color,
                                radiusRadio: 0.2, //hard-coded
                                mid: 1.0, //hard-coded
                            })
                        );
                    });
                });
            }
        });
        if (!this.arrows.length) {
            this.removeAnchors3d();
            this.setState({ message: "cannot find matched atoms to point or no model is displaying, skip" });
            return;
        }
        this.viewer.render();
    };

    removeAnchors3d = (updateRender = true) => {
        this.arrows.forEach((arrow) => this.viewer.removeShape(arrow));
        this.arrows = [];
        if (updateRender) {
            this.viewer.render();
            this.setState({ message: "" });
        }
    };

    /**
     * build an atom keeper object for quick search atoms given region
     */
    buildAtomKeeper = () => {
        const { resolution } = this.state;
        const resString = resolution.toString();
        if (!this.atomData.hasOwnProperty(resString)) {
            this.setState({ message: "error, model data empty, abort" });
            return;
        }
        this.atomKeeper[resString] = {};
        const atoms2 = this.atomData[resString];
        Object.keys(atoms2).forEach((hap) => {
            if (!this.atomKeeper[resString].hasOwnProperty(hap)) {
                this.atomKeeper[resString][hap] = {};
            }
            atoms2[hap].forEach((atom) => {
                if (!this.atomKeeper[resString][hap].hasOwnProperty(atom.chain)) {
                    this.atomKeeper[resString][hap][atom.chain] = {};
                }
                const binkey = reg2bin(atom.properties.start, atom.properties.start + resolution).toString();
                if (!this.atomKeeper[resString][hap][atom.chain].hasOwnProperty(binkey)) {
                    this.atomKeeper[resString][hap][atom.chain][binkey] = [];
                }
                this.atomKeeper[resString][hap][atom.chain][binkey].push(atom);
            });
        });
    };

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

    setAtomClickable = (at) => {
        const screenXY = this.viewer.modelToScreen(at);
        this.setState({ hoveringAtom: at, hoveringX: screenXY.x, hoveringY: screenXY.y });
    };

    clearScene = () => {
        this.viewer2.clear();
        this.viewer.clear();
        this.model2 = {};
        this.model = {};
    };

    prepareAtomData = async () => {
        this.setState({ message: "updating...", frameAtoms: [], frameLabels: [] });
        this.clearScene();
        const { resolution, lineOpacity, cartoonThickness } = this.state;
        const resString = resolution.toString();
        const stateAtoms = [],
            stateLabels = [];
        let atoms2; //, atoms; // atoms2 original object, atoms with added events callback
        if (this.atomData.hasOwnProperty(resString)) {
            // [atoms2, atoms] = this.atomData[resString];
            atoms2 = this.atomData[resString];
        } else {
            const data = await this.g3dFile.readData(resolution);
            atoms2 = g3dParser(data, this.setAtomClickable);
            // atoms = this.assginAtomsCallbacks(atoms2);
            // this.atomData[resString] = [atoms2, atoms];
            this.atomData[resString] = atoms2;
            // fill starts object
            this.atomStartsByChrom[resString] = {};
            Object.keys(atoms2).forEach((hap) => {
                if (!this.atomStartsByChrom[resString].hasOwnProperty(hap)) {
                    this.atomStartsByChrom[resString][hap] = {};
                }
                atoms2[hap].forEach((atom) => {
                    if (!this.atomStartsByChrom[resString][hap].hasOwnProperty(atom.chain)) {
                        this.atomStartsByChrom[resString][hap][atom.chain] = [atom.properties.start];
                    } else {
                        this.atomStartsByChrom[resString][hap][atom.chain].push(atom.properties.start);
                    }
                });
            });
        }
        const modelDisplayConfig = {};
        Object.keys(atoms2).forEach((hap) => (modelDisplayConfig[hap] = true));
        this.setState({ modelDisplayConfig });
        Object.keys(atoms2).forEach((hap) => {
            this.model2[hap] = this.viewer2.addModel();
            this.model2[hap].addAtoms(atoms2[hap]);
            this.model[hap] = this.viewer.addModel();
            this.model[hap].addAtoms(atoms2[hap]);
        });

        //set atoms for animation

        Object.keys(atoms2).forEach((hap) => {
            stateAtoms.push(atoms2[hap]);
            stateLabels.push(hap);
        });

        this.viewer2.setStyle({}, { cartoon: { colorscheme: "chrom", style: "trace", thickness: cartoonThickness } });
        this.viewer2.render();

        // the main viewer

        // this.viewer.setBackgroundColor('white');
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: lineOpacity } });
        this.viewer.zoomTo();
        this.viewer.render();
        // this.viewer.zoom(1.2, 1000);

        // console.log(this.viewer, this.model)
        // element.style.border='1px red solid';
        // element2.style.border='1px black solid';

        this.highlightRegions();

        this.setState({ message: "", frameAtoms: stateAtoms, frameLabels: stateLabels });
    };

    toggleUseBigWig = () => {
        this.setState((prevState) => {
            return { useExistingBigwig: !prevState.useExistingBigwig };
        });
    };

    toggleUsePromoter = () => {
        this.setState((prevState) => {
            return { annoUsePromoter: !prevState.annoUsePromoter };
        });
    };

    toggleUseCompartment = () => {
        this.setState((prevState) => {
            return { uploadCompartmentFile: !prevState.uploadCompartmentFile };
        });
    };

    handleNewG3dUrlChange = (e) => {
        this.setState({ newG3dUrl: e.target.value.trim() });
    };

    handleBigWigUrlChange = (e) => {
        this.setState({ bigWigUrl: e.target.value.trim() });
    };

    handleAnnoFormatChange = (e) => {
        this.setState({ annoFormat: e.target.value });
    };

    handleNumFormatChange = (e) => {
        this.setState({ numFormat: e.target.value });
    };

    handleBigWigInputUrlChange = (e) => {
        this.setState({ bigWigInputUrl: e.target.value.trim() });
    };

    handleCompartmentFileUrlChange = (e) => {
        this.setState({ compartmentFileUrl: e.target.value.trim() });
    };

    handleCompartmentFileUpload = (e) => {
        this.setState({ compartmentFileObject: e.target.files[0] });
    };

    handleAnnotationFileUpload = (e) => {
        this.setState({ annotationFileObject: e.target.files[0] });
    };

    handleNumFileUpload = (e) => {
        this.setState({ numFileObject: e.target.files[0] });
    };

    toggleModelDisplay = (hap) => {
        const newDisplayConfig = { ...this.state.modelDisplayConfig, [hap]: !this.state.modelDisplayConfig[hap] };
        // console.log(newDisplayConfig, hap);
        if (newDisplayConfig[hap]) {
            this.model2[hap].show();
            this.model[hap].show();
        } else {
            this.model2[hap].hide();
            this.model[hap].hide();
        }
        this.viewer2.render();
        this.setState({ modelDisplayConfig: newDisplayConfig });
        if (this.props.anchors3d.length) {
            this.drawAnchors3d(newDisplayConfig);
        } else {
            this.viewer.render(); //avoid dup render in drawAnchors3d
        }
        if (!_.isEmpty(this.state.myShapes)) {
            this.drawMyShapes(newDisplayConfig);
        } else {
            this.viewer.render(); //avoid dup render in drawAnchors3d
        }
        if (!_.isEmpty(this.state.myArrows)) {
            this.drawAnchors3d(newDisplayConfig);
        } else {
            this.viewer.render(); //avoid dup render in drawAnchors3d
        }
        if (this.props.imageInfo) {
            this.drawImageLabel(newDisplayConfig);
        } else {
            this.viewer.render();
        }
    };

    updateLegendColor = (k, color) => {
        this.setState({ [k]: color });
    };

    updateResolution = (resolution) => {
        this.setState({ resolution });
    };

    highlightRegions = () => {
        const { highlightingColor, resolution, lineOpacity, cartoonThickness, modelDisplayConfig } = this.state;
        const regions = this.viewRegionToRegions();
        // const colorByRegion = function (atom, region) {
        //     if (
        //         atom.chain === region.chrom &&
        //         atom.properties.start >= region.start &&
        //         atom.properties.start <= region.end
        //     ) {
        //         return highlightingColor;
        //     } else {
        //         return highlightingChromColor;
        //     }
        // };
        const regionRange = {}; // key: hap: {key: chrom, value: [lower resi, higher resi] used for selection}
        const resString = resolution.toString();
        Object.keys(modelDisplayConfig).forEach((hap) => {
            regions.forEach((reg) => {
                const leftResi = getClosestValueIndex(this.atomStartsByChrom[resString][hap][reg.chrom], reg.start)[1];
                const rightResi = getClosestValueIndex(this.atomStartsByChrom[resString][hap][reg.chrom], reg.end)[0];
                regionRange[hap] = {};
                regionRange[hap][reg.chrom] = [leftResi, rightResi];
            });
        });

        // this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: 0.3, hidden: true } }); //remove existing style
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: lineOpacity } }); //remove existing style
        // regions.forEach((region) => {
        //     this.viewer.setStyle(
        //         { chain: region.chrom },
        //         { cartoon: { colorfunc: (atom) => colorByRegion(atom, region), style: "trace", thickness: 1 } }
        //     );
        // });
        let validateRegion = false;
        Object.keys(modelDisplayConfig).forEach((hap) => {
            regions.forEach((region) => {
                if (
                    regionRange[hap][region.chrom][0] !== undefined &&
                    regionRange[hap][region.chrom][1] !== undefined
                ) {
                    const resiSelect = `${regionRange[hap][region.chrom][0]}-${regionRange[hap][region.chrom][1]}`;
                    this.viewer.setStyle(
                        { chain: region.chrom, resi: [resiSelect], properties: { hap: hap } },
                        { cartoon: { color: highlightingColor, style: "trace", thickness: cartoonThickness } }
                    );
                    validateRegion = true;
                }
            });
        });
        if (validateRegion) {
            this.setState({ highlightingOn: true, highlightingColorChanged: false });
            this.viewer.render();
        } else {
            this.setState({ message: "cannot find matched region to highlight, skip" });
            return;
        }
    };

    removeHighlightRegions = () => {
        const { lineOpacity } = this.state;
        const regions = this.viewRegionToRegions();
        regions.forEach((region) => {
            this.viewer.setStyle({ chain: region.chrom }, { line: { colorscheme: "chrom", opacity: lineOpacity } });
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
        return values.length ? percentile([5, 95], values).map((n) => n.toFixed(2)) : [0, 0]; // use percentile instead for better visual
    };

    paintWithBigwig = async (bwUrl, resolution, regions, chooseRegion) => {
        this.setState({ paintMethod: "score" });
        const {
            legendMinColor,
            legendMaxColor,
            cartoonThickness,
            useLegengMax,
            useLegengMin,
            autoLegendScale,
            numFormat,
            modelDisplayConfig,
        } = this.state;
        let keepers = {};
        const queryChroms = chooseRegion === "region" ? regions.map((r) => r.chrom) : regions;
        if (numFormat === "bwtrack") {
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
                if (fetchedData[i]) {
                    // only assign value is there is something
                    keepers[fetchedChroms[i]] = fetchedData[i];
                    this.bwData[key][fetchedChroms[i]] = fetchedData[i];
                }
            }
        }
        if (numFormat === "geneexp") {
            keepers = await this.getGeneexpData();
        }
        if (_.isEmpty(keepers)) {
            this.setState({
                message: "bigwig/expression file empty or error parse file, please check your file",
                paintRegion: "none",
            });
            return;
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
        let minValue, maxValue;
        if (autoLegendScale) {
            [minValue, maxValue] = [minScore, maxScore];
        } else {
            [minValue, maxValue] = [useLegengMin, useLegengMax];
            if (minValue > maxValue) {
                this.setMessage("min value much smaller than max value, abort");
                return;
            }
        }
        // console.log(filterRegions);
        const colorScale = scaleLinear()
            .domain([minValue, maxValue])
            .range([legendMinColor, legendMaxColor])
            .clamp(true);
        const colorByValue = function (atom) {
            if (atomInFilterRegions(atom, filterRegions)) {
                const value = getBigwigValueForAtom(keepers, atom, resolution);
                if (value) {
                    return colorAsNumber(colorScale(value));
                } else {
                    // console.log(atom, "no value");
                    return "grey";
                }
            } else {
                // console.log(atom, "not in region");
                return "grey";
            }
        };
        if (chooseRegion === "region") {
            const regionRange = {}; // key: hap: {key: chrom, value: [lower resi, higher resi] used for selection}
            const resString = resolution.toString();
            Object.keys(modelDisplayConfig).forEach((hap) => {
                regions.forEach((reg) => {
                    const leftResi = getClosestValueIndex(
                        this.atomStartsByChrom[resString][hap][reg.chrom],
                        reg.start
                    )[1];
                    const rightResi = getClosestValueIndex(
                        this.atomStartsByChrom[resString][hap][reg.chrom],
                        reg.end
                    )[0];
                    regionRange[hap] = {};
                    regionRange[hap][reg.chrom] = [leftResi, rightResi];
                });
            });
            Object.keys(modelDisplayConfig).forEach((hap) => {
                queryChroms.forEach((chrom) => {
                    if (regionRange[hap][chrom][0] !== undefined && regionRange[hap][chrom][1] !== undefined) {
                        const resiSelect = `${regionRange[hap][chrom][0]}-${regionRange[hap][chrom][1]}`;
                        this.viewer.setStyle(
                            { chain: chrom, resi: [resiSelect], properties: { hap: hap } },
                            { cartoon: { colorfunc: colorByValue, style: "trace", thickness: cartoonThickness } }
                        );
                    }
                });
            });
        } else {
            queryChroms.forEach((chrom) => {
                this.viewer.setStyle(
                    { chain: chrom },
                    { cartoon: { colorfunc: colorByValue, style: "trace", thickness: cartoonThickness } }
                );
            });
        }
        this.viewer.render();
        this.setState({
            legendMax: maxScore,
            legendMin: minScore,
            colorScale,
            staticCategories: { "no data": "grey" },
        });
    };

    getGeneexpData = async () => {
        const { numFileObject } = this.state;
        if (!numFileObject) {
            this.setMessage("gene expression file empty, abort...");
            return;
        }
        const key = numFileObject.name;
        if (this.expData.hasOwnProperty(key)) {
            return this.expData[key];
        }
        const data = await this.parseUploadedFile(numFileObject);
        if (!data) {
            this.setMessage("expression file empty or error parse file, please check your file 1");
            return;
        }
        const exp = {};
        const first = data[0].trim().split("\t");
        if (first.length !== 5) {
            this.setMessage("file is not a gene expression file, abort");
            return;
        }
        data.forEach((line) => {
            const t = line.trim().split("\t");
            const chrom = t[0];
            const start = Number.parseInt(t[1], 10);
            const end = Number.parseInt(t[2], 10);
            const binkey = reg2bin(start, end).toString();
            if (!exp.hasOwnProperty(chrom)) {
                exp[chrom] = {};
            }
            if (!exp[chrom].hasOwnProperty(binkey)) {
                exp[chrom][binkey] = [];
            }
            exp[chrom][binkey].push({
                chrom,
                start,
                end,
                id: t[3],
                score: Number.parseFloat(t[4]),
            });
        });
        this.expData[key] = exp;
        // console.log(exp);
        return exp;
    };

    removePaint = () => {
        if (!this.state.colorScale) return;
        const { lineOpacity } = this.state;
        this.setState({ paintRegion: "none" });
        // this.viewer.setStyle({}, { cartoon: { color: "grey", style: "trace", thickness: 1 } });
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: lineOpacity } });
        this.viewer.render();
        this.setState({
            legendMax: 0,
            legendMin: 0,
            colorScale: null,
            highlightingOn: false,
            staticCategories: null,
        });
    };

    paintBigwig = async (chooseRegion) => {
        this.setState({ paintRegion: chooseRegion, message: "numerical painting..." });
        const { useExistingBigwig, bigWigUrl, bigWigInputUrl, resolution, lineOpacity, numFormat } = this.state;
        const bwUrl = useExistingBigwig ? bigWigUrl : bigWigInputUrl;
        if (numFormat === "bwtrack") {
            if (!bwUrl.length) {
                this.setState({ message: "bigwig url for paint is empty, abort...", paintRegion: "none" });
                return;
            }
        }
        const regions = this.viewRegionToRegions();
        const chroms = this.viewRegionToChroms();
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: lineOpacity } });
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
            // console.log(bwData);
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

    parseRemoteFileData = async (url) => {
        // console.log(url);
        // const headers = url.includes("4dnucleome")
        //     ? {
        //           Authorization: process.env.REACT_APP_4DN_KEY,
        //       }
        //     : {};
        // console.log(headers);
        try {
            const response = await axios.get(url, { responseType: "arraybuffer" });
            const buffer = Buffer.from(response.data);
            //  console.log(buffer)
            let dataString;
            // if (response.headers["content-type"] === "text/plain") {
            if (!url.endsWith(".gz")) {
                // text file...amazon s3 for gzipped file also return text in headers...
                dataString = buffer.toString();
            } else {
                const unzipped = await unzip(buffer);
                dataString = unzipped.toString();
            }
            return dataString.split("\n");
        } catch (error) {
            this.setState({ message: "error parse annotation file url" });
            return;
        }
    };

    parseUploadedFile = async (fileobj) => {
        // console.log(fileobj);
        try {
            const gzipFile = /gzip/;
            let dataString;
            if (fileobj.type.match(gzipFile)) {
                const zipped = await readFileAsBuffer(fileobj);
                const unzipped = await unzip(zipped);
                dataString = unzipped.toString();
            } else {
                dataString = await readFileAsText(fileobj);
            }
            return dataString.trim().split("\n");
        } catch (error) {
            console.error("unzip error", error);
            this.setState({ message: "error parse uploaded annotation file" });
            return;
        }
    };

    getCompartmentData = async () => {
        const { compartmentFileUrl, compartmentFileObject, uploadCompartmentFile } = this.state;
        if (!compartmentFileUrl.length && !compartmentFileObject) {
            this.setState({ message: "compartment url or file empty, abort..." });
            return;
        }
        const key = uploadCompartmentFile ? compartmentFileObject.name : compartmentFileUrl;
        if (this.compData.hasOwnProperty(key)) {
            return this.compData[key];
        }
        const data = uploadCompartmentFile
            ? await this.parseUploadedFile(compartmentFileObject)
            : await this.parseRemoteFileData(compartmentFileUrl);
        // console.log(data);
        if (!data) {
            this.setState({ message: "file empty or error parse compartment file, please check your file 1" });
            return;
        }
        const comp = {};
        let compFormat = "4dn",
            dataToUse;
        if (!data[0].startsWith("chrom")) {
            compFormat = "cell";
            if (data[0].trim().split("\t").length === 4) {
                compFormat = "custom";
            }
            this.setState({ compFormat });
            dataToUse = data;
        } else {
            dataToUse = data.slice(1);
        }
        // console.log(key, compFormat, dataToUse);
        dataToUse.forEach((line) => {
            const t = line.trim().split("\t");
            // console.log(t);
            // > ''.trim().split('\t').length
            // 1;
            if (t.length > 1) {
                let score, compName;
                const chrom = t[0];
                const start = Number.parseInt(t[1], 10);
                const end = Number.parseInt(t[2], 10);
                // console.log(start, end, reg2bin(start, end));
                const binkey = reg2bin(start, end).toString();
                if (!comp.hasOwnProperty(chrom)) {
                    comp[chrom] = {};
                }
                if (!comp[chrom].hasOwnProperty(binkey)) {
                    comp[chrom][binkey] = [];
                }
                if (compFormat === "4dn") {
                    score = Number.parseFloat(t[7]);
                    comp[chrom][binkey].push({
                        chrom,
                        start,
                        end,
                        score,
                    });
                } else {
                    compName = t[3];
                    comp[chrom][binkey].push({
                        chrom,
                        start,
                        end,
                        name: compName,
                    });
                }
            }
        });
        this.compData[key] = comp;
        // console.log(comp);
        return comp;
    };

    paintCompartment = async (chooseRegion) => {
        const { lineOpacity } = this.state;
        this.setState({
            paintCompartmentRegion: chooseRegion,
            paintMethod: "compartment",
            message: "compartment painting...",
        });
        const comp = await this.getCompartmentData();
        if (_.isEmpty(comp)) {
            this.setState({
                message: "file empty or error parse compartment file, please check your file 2",
                paintCompartmentRegion: "none",
            });
            return;
        }
        const regions = this.viewRegionToRegions();
        const chroms = this.viewRegionToChroms();
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: lineOpacity } });
        switch (chooseRegion) {
            case "region":
                this.paintWithComparment(comp, regions, chooseRegion);
                break;
            case "chrom":
                this.paintWithComparment(comp, chroms, chooseRegion);
                break;
            case "genome":
                this.paintWithComparment(comp, Object.keys(this.chromHash), chooseRegion);
                break;
            default:
                break;
        }
        this.setState({ message: "" });
    };

    paintWithComparment = (comp, regions, chooseRegion) => {
        const { A, B, A1, A2, B1, B2, B3, B4, NA, compFormat, resolution, cartoonThickness, modelDisplayConfig } =
            this.state; // resolution for atom end pos
        const queryChroms = chooseRegion === "region" ? regions.map((r) => r.chrom) : regions;
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
        const overlapFunc = compFormat === "4dn" ? getBigwigValueForAtom : getCompartmentNameForAtom;
        const colorByCompartment = (atom) => {
            if (atomInFilterRegions(atom, filterRegions)) {
                const value = overlapFunc(comp, atom, resolution);
                if (value !== undefined) {
                    if (typeof value === "number") {
                        return value >= 0 ? A : B;
                    } else {
                        return value.startsWith("#") ? value : colorAsNumber(this.state[value]);
                    }
                } else {
                    return "grey";
                }
            } else {
                return "grey";
            }
        };
        if (chooseRegion === "region") {
            const regionRange = {}; // key: hap: {key: chrom, value: [lower resi, higher resi] used for selection}
            const resString = resolution.toString();
            Object.keys(modelDisplayConfig).forEach((hap) => {
                regions.forEach((reg) => {
                    const leftResi = getClosestValueIndex(
                        this.atomStartsByChrom[resString][hap][reg.chrom],
                        reg.start
                    )[1];
                    const rightResi = getClosestValueIndex(
                        this.atomStartsByChrom[resString][hap][reg.chrom],
                        reg.end
                    )[0];
                    regionRange[hap] = {};
                    regionRange[hap][reg.chrom] = [leftResi, rightResi];
                });
            });
            Object.keys(modelDisplayConfig).forEach((hap) => {
                queryChroms.forEach((chrom) => {
                    if (regionRange[hap][chrom][0] !== undefined && regionRange[hap][chrom][1] !== undefined) {
                        const resiSelect = `${regionRange[hap][chrom][0]}-${regionRange[hap][chrom][1]}`;
                        this.viewer.setStyle(
                            { chain: chrom, resi: [resiSelect], properties: { hap: hap } },
                            { cartoon: { colorfunc: colorByCompartment, style: "trace", thickness: cartoonThickness } }
                        );
                    }
                });
            });
        } else {
            queryChroms.forEach((chrom) => {
                this.viewer.setStyle(
                    { chain: chrom },
                    { cartoon: { colorfunc: colorByCompartment, style: "trace", thickness: cartoonThickness } }
                );
            });
        }
        this.viewer.render();
        if (compFormat === "4dn") {
            this.setState({ categories: { A, B }, staticCategories: { "no data": "grey" } });
        } else if (compFormat === "cell") {
            this.setState({ categories: { A1, A2, B1, B2, B3, B4, NA } });
        }
        if (compFormat !== "cell") {
            // cell data already has NA
            this.setState({ staticCategories: { "no data": "grey" } });
        }
    };

    removeCompartmentPaint = () => {
        const { lineOpacity } = this.state;
        this.setState({ paintCompartmentRegion: "none" });
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: lineOpacity } });
        this.viewer.render();
        this.setState({
            highlightingOn: false,
            categories: null,
            staticCategories: null,
        });
    };

    formatCytoband = () => {
        const { genomeConfig } = this.props;
        Object.keys(genomeConfig.cytobands).forEach((chrom) => {
            genomeConfig.cytobands[chrom].forEach((item) => {
                const binkey = reg2bin(item.chromStart, item.chromEnd).toString();
                if (!this.cytobandData.hasOwnProperty(item.chrom)) {
                    this.cytobandData[item.chrom] = {};
                }
                if (!this.cytobandData[item.chrom].hasOwnProperty(binkey)) {
                    this.cytobandData[item.chrom][binkey] = [];
                }
                this.cytobandData[item.chrom][binkey].push({
                    chrom: item.chrom,
                    start: item.chromStart,
                    end: item.chromEnd,
                    id: item.name,
                    name: item.gieStain,
                });
            });
        });
    };

    getAnnotationData = async () => {
        const { annotationFileObject, annoFormat } = this.state;
        if (annoFormat === "cytoband") {
            if (_.isEmpty(this.cytobandData)) {
                this.formatCytoband();
            }
            return this.cytobandData;
        }
        if (!annotationFileObject) {
            this.setMessage("annotation file empty, abort...");
            return;
        }
        const key = annotationFileObject.name;
        if (this.annoData.hasOwnProperty(key)) {
            return this.annoData[key];
        }
        const data = await this.parseUploadedFile(annotationFileObject);
        // console.log(data);
        if (!data) {
            this.setMessage("file empty or error parse annotation file, please check your file 1");
            return;
        }
        const anno = {};
        const first = data[0].trim().split("\t");
        // console.log(first);
        if (annoFormat === "bedrgb") {
            if (first.length < 9) {
                this.setMessage("requires at least 9 columns for bed annotations, abort");
                return;
            }
            data.forEach((line) => {
                const t = line.trim().split("\t");
                const chrom = t[0];
                const start = Number.parseInt(t[1], 10);
                const end = Number.parseInt(t[2], 10);
                const binkey = reg2bin(start, end).toString();
                if (!anno.hasOwnProperty(chrom)) {
                    anno[chrom] = {};
                }
                if (!anno[chrom].hasOwnProperty(binkey)) {
                    anno[chrom][binkey] = [];
                }
                anno[chrom][binkey].push({
                    chrom,
                    start,
                    end,
                    name: t[3],
                });
                if (!this.bedLegend.hasOwnProperty(t[3])) {
                    this.bedLegend[t[3]] = "rgb(" + t[8] + ")";
                }
            });
        }
        if (annoFormat === "refgene") {
            if (first.length !== 16) {
                this.setMessage("file is not a refGene file, abort");
                return;
            }
            data.forEach((line) => {
                const t = line.trim().split("\t");
                const chrom = t[2];
                const start = Number.parseInt(t[4], 10);
                const end = Number.parseInt(t[5], 10);
                let startp, endp;
                if (t[3] === "-") {
                    startp = end - 1000;
                    endp = end + 2000;
                } else {
                    startp = start - 2000;
                    endp = start + 1000;
                }
                const binkey = reg2bin(start, end).toString();
                if (!anno.hasOwnProperty(chrom)) {
                    anno[chrom] = {};
                }
                if (!anno[chrom].hasOwnProperty(binkey)) {
                    anno[chrom][binkey] = [];
                }
                anno[chrom][binkey].push({
                    chrom,
                    start,
                    end,
                    startp,
                    endp,
                    id: t[1],
                    name: t[12],
                });
            });
        }

        this.annoData[key] = anno;
        // console.log(anno);
        return anno;
    };

    paintAnnotation = async (chooseRegion) => {
        const { lineOpacity } = this.state;
        this.setState({
            paintAnnotationRegion: chooseRegion,
            paintMethod: "annotation",
            message: "annotation painting...",
        });
        const anndata = await this.getAnnotationData();
        if (_.isEmpty(anndata)) {
            this.setState({
                message: "no system cytoband data, file empty or error parse annotation file, please check your file",
                paintAnnotationRegion: "none",
            });
            return;
        }
        const regions = this.viewRegionToRegions();
        const chroms = this.viewRegionToChroms();
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: lineOpacity } });
        switch (chooseRegion) {
            case "region":
                this.paintWithAnnotation(anndata, regions, chooseRegion);
                break;
            case "chrom":
                this.paintWithAnnotation(anndata, chroms, chooseRegion);
                break;
            case "genome":
                this.paintWithAnnotation(anndata, Object.keys(this.chromHash), chooseRegion);
                break;
            default:
                break;
        }
        this.setState({ message: "" });
    };

    paintWithAnnotation = (anndata, regions, chooseRegion) => {
        const { annoFormat, resolution, cartoonThickness, annoUsePromoter, gene, promoter } = this.state; // resolution for atom end pos
        const queryChroms = chooseRegion === "region" ? regions.map((r) => r.chrom) : regions;
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
        const colorByAnnotation = (atom) => {
            if (atomInFilterRegions(atom, filterRegions)) {
                const value = getCompartmentNameForAtom(
                    anndata,
                    atom,
                    resolution,
                    annoFormat === "refgene",
                    annoUsePromoter
                );
                if (value !== undefined) {
                    if (typeof value === "number") {
                        return annoUsePromoter ? promoter : gene;
                    } else {
                        return annoFormat === "cytoband"
                            ? colorAsNumber(CYTOBAND_COLORS_SIMPLE[value])
                            : colorAsNumber(this.bedLegend[value]);
                    }
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
                { cartoon: { colorfunc: colorByAnnotation, style: "trace", thickness: cartoonThickness } }
            );
        });
        this.viewer.render();
        if (annoFormat === "cytoband") {
            this.setState({ staticCategories: CYTOBAND_COLORS_SIMPLE, categories: null });
        } else if (annoFormat === "bedrgb") {
            this.setState({ staticCategories: this.bedLegend, categories: null });
        } else {
            const glabel = annoUsePromoter ? "promoter" : "gene";
            this.setState({ categories: { [glabel]: this.state[glabel] }, staticCategories: null });
        }
    };

    removeAnnotationPaint = () => {
        const { lineOpacity } = this.state;
        this.setState({ paintAnnotationRegion: "none" });
        this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: lineOpacity } });
        this.viewer.render();
        this.setState({
            highlightingOn: false,
            staticCategories: null,
            categories: null,
        });
    };

    set4DNExampleURL = () => {
        this.setState({
            compartmentFileUrl:
                "https://4dn-open-data-public.s3.amazonaws.com/fourfront-webprod/wfoutput/808517c7-9913-494d-bab5-7c3681d17ae2/4DNFIL65C8ZI.txt.gz",
            compFormat: "4dn",
        });
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

    clearMessage = () => {
        this.setState({ message: "" });
    };

    addNewG3D = async (url, key, resolution) => {
        const newg3d = new G3dFile({ url });
        const data = await newg3d.readData(resolution);
        // console.log(data);
        if (!data) {
            this.setState({ message: "g3d model file empty or resolution not exist, abort" });
            return;
        }
        const newatoms = g3dParser(data);
        // console.log(newatoms);
        this.newAtoms[key] = newatoms;
        return newatoms;
    };

    prepareModelFrames = async () => {
        const { newG3dUrl, resolution, frameAtoms, frameLabels } = this.state;
        if (!newG3dUrl.length) {
            this.setState({ message: "g3d url empty, abort" });
            return;
        }

        const splits = _.split(newG3dUrl, "/");
        const key = splits[splits.length - 1];
        if (this.newAtoms.hasOwnProperty(key)) {
            this.setState({ message: "g3d url already added, abort" });
            return;
        }
        const newatoms = await this.addNewG3D(newG3dUrl, key, resolution);
        const atoms = [],
            labels = [];

        Object.keys(newatoms).forEach((hap) => {
            atoms.push(newatoms[hap]);
            labels.push(key + " " + hap);
        });
        // console.log(atoms);
        this.setState({
            animateMode: true,
            frameAtoms: frameAtoms.concat(atoms),
            frameLabels: frameLabels.concat(labels),
        });
    };

    updateModelFrames = () => {
        this.setState({ thumbStyle: "hide" });
        this.clearScene();
        const { frameAtoms, frameLabels } = this.state;
        const model = this.viewer.addModelsAsFrames();
        const labelY = this.props.height - 36; //default label font size 18
        frameAtoms.forEach((al, idx) => {
            model.addFrame(al);
            this.viewer.addLabel(frameLabels[idx], {
                position: { x: 6, y: labelY, z: 0 },
                useScreen: true,
                backgroundColor: 0x800080,
                backgroundOpacity: 0.8,
                frame: idx,
                inFront: true,
                showBackground: true,
            });
        });
        model.setFrame(0);
        // this.viewer.setStyle({}, { line: { colorscheme: "chrom", opacity: 1 } });
        // this.viewer.setStyle({}, { cartoon: { colorscheme: "chrom", style: "trace", thickness: 1 } });
        // this.viewer.zoomTo();
        // this.viewer.render();
        this.highlightRegions();
    };

    animate = async () => {
        if (!this.state.animateMode) {
            this.updateModelFrames();
        }
        this.viewer.animate({ loop: "forward", reps: 0, interval: 500 });
    };

    stopAnimate = () => {
        this.viewer.stopAnimate();
    };

    resetAnimate = () => {
        this.setState({ animateMode: false, thumbStyle: "cartoon", message: "working..." });
        this.clearScene();
        this.prepareAtomData();
        this.setState({ message: "" });
    };

    syncHic = () => {
        const dHicTracks = this.props.tracks.filter((tk) => tk.type === "dynamichic");
        if (!dHicTracks.length) {
            this.setState({ message: "Abort, no dynamic hic track loaded..." });
            return;
        }
        if (this.viewer.isAnimated()) {
            this.stopAnimate();
        }
        if (!this.state.animateMode) {
            this.updateModelFrames();
        }
        this.props.onToggleSync3d(true);
        this.props.onGetViewer3dAndNumFrames({ viewer3d: this.viewer, numFrames: this.viewer.getNumFrames() });
        this.setState({ message: "sync mode" });
    };

    stopSync = () => {
        this.props.onToggleSync3d(false);
        this.props.onGetViewer3dAndNumFrames({ viewer3d: null, numFrames: 0 });
        this.setState({ message: "" });
    };

    saveImage = (viewer) => {
        const ImgData = viewer.pngURI();
        const dl = document.createElement("a");
        document.body.appendChild(dl); // This line makes it work in Firefox.
        dl.setAttribute("href", ImgData);
        dl.setAttribute("download", new Date().toISOString() + "_eg3d.png");
        dl.click();
        document.body.removeChild(dl);
    };

    setUseLegendMax = (e) => {
        // console.log(e.target.value, Number.parseFloat(e.target.value));
        this.setState({ useLegengMax: Number.parseFloat(e.target.value) });
    };

    setUseLegendMin = (e) => {
        this.setState({ useLegengMin: Number.parseFloat(e.target.value) });
    };

    handleAutoLegendScaleChange = () => {
        this.setState((prevState) => {
            return { autoLegendScale: !prevState.autoLegendScale };
        });
    };

    setLabelStyle = (e) => {
        this.setState({ labelStyle: e.target.value });
    };

    handleMyShapeLabelChange = (e) => {
        this.setState({ myShapeLabel: e.target.value.trim() });
    };

    handleMyShapeRegionChange = (e) => {
        this.setState({ myShapeRegion: e.target.value.trim() });
    };

    addAnchors3dToMyArrows = (anchors, asShape = false) => {
        const newShapes = { ...this.state.myShapes };
        if (asShape) {
            anchors.forEach((locus, idx) => {
                const color = idx % 2 ? "red" : "blue";
                const regionStr = locus.toString();
                if (!newShapes.hasOwnProperty(regionStr)) {
                    newShapes[regionStr] = {
                        label: regionStr,
                        outline: "sphere",
                        locus,
                        loci: null,
                        size: 2,
                        wireframe: false,
                        color,
                    };
                } else {
                    this.setState({ message: "warning, duplicated arrow region" });
                    // return;
                }
            });
            this.setState({ myShapes: newShapes });
        } else {
            const newArrows = { ...this.state.myArrows };
            anchors.forEach((locus, idx) => {
                const color = idx % 2 ? "red" : "blue";
                const regionStr = locus.toString();
                if (!newArrows.hasOwnProperty(regionStr)) {
                    newArrows[regionStr] = {
                        start: { x: 0, y: 0.0, z: 0.0 },
                        locus,
                        loci: null,
                        radius: 0.2,
                        color,
                    };
                } else {
                    this.setState({ message: "warning, duplicated arrow region" });
                    // return;
                }
            });
            this.setState({ myArrows: newArrows });
        }
    };

    addRegionToMyShapes = () => {
        const { labelStyle } = this.state;
        if (labelStyle === "shape") {
            const { myShapeRegion, myShapeLabel, myShapes } = this.state;
            const newShapes = { ...myShapes };
            try {
                const locus = ChromosomeInterval.parse(myShapeRegion);
                const regionStr = locus.toString();
                if (!newShapes.hasOwnProperty(regionStr)) {
                    newShapes[regionStr] = {
                        label: myShapeLabel,
                        color: "blue",
                        outline: "sphere",
                        locus,
                        loci: null,
                        size: 2,
                        wireframe: false,
                    };
                    this.setState({ myShapeRegion: "", myShapeLabel: "", myShapes: newShapes });
                } else {
                    this.setState({ message: "error, duplicated label region, skip" });
                    return;
                }
            } catch (error) {
                this.setState({
                    message: "error parse the region, format should like: chr:start-end, chr start end etc.",
                });
                return;
            }
        } else if (labelStyle === "arrow") {
            const { myShapeRegion, myArrows } = this.state;
            const newArrows = { ...myArrows };
            try {
                const locus = ChromosomeInterval.parse(myShapeRegion);
                const regionStr = locus.toString();
                if (!newArrows.hasOwnProperty(regionStr)) {
                    newArrows[regionStr] = {
                        start: { x: 0, y: 0.0, z: 0.0 },
                        locus,
                        loci: null,
                        radius: 0.2,
                        color: "blue",
                    };
                    this.setState({ myShapeRegion: "", myShapeLabel: "", myArrows: newArrows });
                } else {
                    this.setState({ message: "error, duplicated label region, skip" });
                    return;
                }
            } catch (error) {
                this.setState({
                    message: "error parse the region, format should like: chr:start-end, chr start end etc.",
                });
                return;
            }
        }
    };

    addGeneToMyShapes = (gene) => {
        const { labelStyle } = this.state;
        if (labelStyle === "shape") {
            const { myShapes } = this.state;
            const newShapes = { ...myShapes };

            const locus = gene.getLocus();
            const regionStr = locus.toString();
            if (!newShapes.hasOwnProperty(regionStr)) {
                newShapes[regionStr] = {
                    label: gene.getName(),
                    color: "blue",
                    outline: "sphere",
                    locus,
                    loci: null,
                    size: 2,
                    wireframe: false,
                };
                this.setState({ myShapes: newShapes });
            } else {
                this.setState({ message: "error, duplicated gene region, skip" });
                return;
            }
        } else if (labelStyle === "arrow") {
            const { myArrows } = this.state;
            const newArrows = { ...myArrows };

            const locus = gene.getLocus();
            const regionStr = locus.toString();
            if (!newArrows.hasOwnProperty(regionStr)) {
                newArrows[regionStr] = {
                    start: { x: 0, y: 0.0, z: 0.0 },
                    locus,
                    loci: null,
                    radius: 0.2,
                    color: "blue",
                };
                this.setState({ myArrows: newArrows });
            } else {
                this.setState({ message: "error, duplicated gene region, skip" });
                return;
            }
        }
    };

    handleLoopFileUpload = async (e) => {
        const fileobj = e.target.files[0];
        if (!fileobj) {
            this.setMessage("loop file empty, abort");
            return;
        }
        const data = await this.parseUploadedFile(fileobj);
        if (!data) {
            this.setMessage("loop file empty or error parse file, please check your file");
            return;
        }
        const first = data[0].trim().split("\t");
        if (first.length < 6) {
            this.setMessage("loop file requires at least 6 columns, abort");
            return;
        }
        const loci = [];
        data.slice(1).forEach((line) => {
            const t = line.trim().split("\t");
            if (t.length >= 6) {
                let chrom = t[0];
                if (!chrom.startsWith("chr")) {
                    chrom = "chr" + chrom;
                }
                const start = Number.parseInt(t[1], 10);
                const end = Number.parseInt(t[2], 10);
                let chrom2 = t[3];
                if (!chrom2.startsWith("chr")) {
                    chrom2 = "chr" + chrom2;
                }
                const start2 = Number.parseInt(t[4], 10);
                const end2 = Number.parseInt(t[5], 10);
                loci.push(new ChromosomeInterval(chrom, start, end));
                loci.push(new ChromosomeInterval(chrom2, start2, end2));
            }
        });
        this.addAnchors3dToMyArrows(loci, false);
    };

    handleRegionFileUpload = async (e) => {
        const fileobj = e.target.files[0];
        if (!fileobj) {
            this.setMessage("region file empty, abort");
            return;
        }
        const label = fileobj.name;
        const loci = await this.parseUploadedRegionFile(fileobj);
        const { labelStyle } = this.state;
        if (labelStyle === "shape") {
            const { myShapes } = this.state;
            const newShapes = { ...myShapes };

            if (!newShapes.hasOwnProperty(label)) {
                newShapes[label] = {
                    label,
                    color: "blue",
                    outline: "sphere",
                    loci,
                    locus: null,
                    size: 2,
                    wireframe: false,
                };
                this.setState({ myShapes: newShapes });
            } else {
                this.setState({ message: "error, duplicated file name, skip" });
                return;
            }
        } else if (labelStyle === "arrow") {
            const { myArrows } = this.state;
            const newArrows = { ...myArrows };
            if (!newArrows.hasOwnProperty(label)) {
                newArrows[label] = {
                    loci,
                    locus: null,
                    start: { x: 0, y: 0.0, z: 0.0 },
                    radius: 0.2,
                    color: "blue",
                };
                this.setState({ myArrows: newArrows });
            } else {
                this.setState({ message: "error, duplicated file name, skip" });
                return;
            }
        }
    };

    parseUploadedRegionFile = async (fileobj) => {
        const dataString = await readFileAsText(fileobj);
        const inputListRaw = dataString.trim().split("\n");
        const inputListRaw2 = inputListRaw.map((item) => item.trim());
        const inputList = inputListRaw2.filter((item) => item !== "");
        if (inputList.length === 0) {
            this.setMessage("region file is empty or cannot find any location on genome, skip");
            return;
        }
        const genomeName = this.props.genomeConfig.genome.getName();
        const promise = inputList.map((symbol) => {
            try {
                const locus = ChromosomeInterval.parse(symbol);
                const t = symbol.split("\t");
                // console.log(t);
                const label = t.length > 3 ? t[3] : symbol; // 4th column of bed used as label
                if (locus) {
                    return { label, locus };
                }
            } catch (error) {}
            return getSymbolRegions(genomeName, symbol);
        });
        const parsed = await Promise.all(promise);
        const parsed2 = parsed.map((item, index) => {
            if (Array.isArray(item)) {
                if (item.length === 0) {
                    return null;
                }
                // eslint-disable-next-line array-callback-return
                const hits = item.map((gene) => {
                    if (gene.name.toLowerCase() === inputList[index].toLowerCase()) {
                        return {
                            label: gene.name,
                            locus: new ChromosomeInterval(gene.chrom, gene.txStart, gene.txEnd),
                        };
                    }
                });
                const hits2 = hits.filter((hit) => hit); // removes undefined
                if (hits2.length === 0) {
                    return null;
                }
                // console.log(hits2);
                return hits2[0] || null;
            } else {
                return item;
            }
        });
        const nullList = parsed2.filter((item) => item === null);
        if (nullList.length > 0) {
            notify.show(`${nullList.length} item(s) cannot find location(s) on genome`, "error", 2000);
        } else {
            notify.show(`${parsed2.length} region(s) added`, "success", 2000);
        }
        const parsed3 = parsed2.filter((item) => item);
        if (parsed3.length === 0) {
            this.setMessage("region file is empty or cannot find any location on genome, skip");
            return;
        }
        return parsed3;
    };

    updateMyShapes = (shapeKey, shape) => {
        const newShapes = { ...this.state.myShapes, [shapeKey]: shape };
        this.setState({ myShapes: newShapes });
        // this.drawMyShapes(this.state.modelDisplayConfig);
    };

    deleteShapeByKey = (shapekey) => {
        const { [shapekey]: remove, ...newShapes } = this.state.myShapes;
        this.setState({ myShapes: newShapes });
    };

    updateMyArrows = (arrowKey, arrow) => {
        const newArrows = { ...this.state.myArrows, [arrowKey]: arrow };
        this.setState({ myArrows: newArrows });
    };

    deleteArrowByKey = (arrowkey) => {
        const { [arrowkey]: remove, ...newArrows } = this.state.myArrows;
        this.setState({ myArrows: newArrows });
    };

    setMessage = (message) => {
        this.setState({ message });
    };

    render() {
        const {
            legendMax,
            legendMin,
            colorScale,
            layout,
            thumbStyle,
            hoveringAtom,
            hoveringX,
            hoveringY,
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
            uploadCompartmentFile,
            compartmentFileUrl,
            paintCompartmentRegion,
            categories,
            staticCategories,
            newG3dUrl,
            frameLabels,
            myShapeLabel,
            myShapeRegion,
            myShapes,
            highlightingColor,
            highlightingColorChanged,
            lineOpacity,
            cartoonThickness,
            autoLegendScale,
            useLegengMin,
            useLegengMax,
            labelStyle,
            myArrows,
            annoFormat,
            paintAnnotationRegion,
            annoUsePromoter,
            numFormat,
        } = this.state;
        const { tracks, x, y, onNewViewRegion, viewRegion, sync3d } = this.props;
        const bwTracks = tracks.filter((track) => getTrackConfig(track).isBigwigTrack());
        return (
            <div id="threed-mol-container">
                {childShow && (
                    <Drawer
                        placement={this.state.placement}
                        width={this.state.width}
                        height={this.state.height}
                        level={null}
                        open={childShow}
                        handler={false}
                        showMask={false}
                    >
                        <div id="accordion" style={{ flexDirection: menuFlexDirection }}>
                            <div className="closeMenu-3d" onClick={this.onSwitch}>
                                &times;
                            </div>
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
                                            <strong>Viewers:</strong>
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
                                            Highlighting &amp; Labeling
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapseThree" className="collapse show" aria-labelledby="headingThree">
                                    <div className="card-body">
                                        <OpacityThickness
                                            opacity={lineOpacity}
                                            thickness={cartoonThickness}
                                            onUpdate={this.updateLegendColor}
                                        />
                                        <div style={{ display: "flex", alignItems: "flex-start" }}>
                                            <ColorPicker
                                                onUpdateLegendColor={this.updateLegendColor}
                                                colorKey={"highlightingColor"}
                                                initColor={highlightingColor}
                                            />

                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={highlightingOn && !highlightingColorChanged}
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
                                        </div>
                                        <div>
                                            <label style={{ marginBottom: 0 }}>
                                                <strong>Labeling style</strong>{" "}
                                                <select value={labelStyle} onChange={this.setLabelStyle}>
                                                    <option value="shape">shape</option>
                                                    <option value="arrow">arrow</option>
                                                </select>
                                            </label>
                                        </div>
                                        <p>
                                            <strong>Gene labeling</strong>
                                        </p>
                                        <div>
                                            <GeneSearchBox3D setGeneCallback={this.addGeneToMyShapes} />
                                        </div>
                                        <p>
                                            <strong>Region labeling</strong>
                                        </p>
                                        <div style={{ display: "flex", alignItems: "baseline" }}>
                                            <span>Region:</span>{" "}
                                            <input
                                                type="text"
                                                placeholder="chr start end"
                                                value={myShapeRegion}
                                                onChange={this.handleMyShapeRegionChange}
                                            />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "baseline" }}>
                                            <span>Label:</span>{" "}
                                            <input
                                                type="text"
                                                placeholder="my region"
                                                value={myShapeLabel}
                                                onChange={this.handleMyShapeLabelChange}
                                            />
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={this.addRegionToMyShapes}
                                            >
                                                Add
                                            </button>
                                        </div>

                                        <div>
                                            Upload a text file with genes/regions:
                                            <input type="file" onChange={this.handleRegionFileUpload} />
                                        </div>

                                        {/* <div>
                                            Upload file with domain/loop anchors:
                                            <input type="file" onChange={this.handleLoopFileUpload} />
                                        </div> */}

                                        <div>
                                            <ShapeList
                                                shapes={myShapes}
                                                onUpdateMyShapes={this.updateMyShapes}
                                                onDeleteShapeByKey={this.deleteShapeByKey}
                                                onSetMessage={this.setMessage}
                                            />
                                        </div>
                                        <div>
                                            <ArrowList
                                                arrows={myArrows}
                                                onUpdateMyArrows={this.updateMyArrows}
                                                onDeleteArrowByKey={this.deleteArrowByKey}
                                                onSetMessage={this.setMessage}
                                            />
                                        </div>
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
                                        <p>
                                            <span>Data:</span>{" "}
                                            <select
                                                name="numFormat"
                                                defaultValue={numFormat}
                                                onChange={this.handleNumFormatChange}
                                            >
                                                <option value="bwtrack">Bigwig track</option>
                                                <option value="geneexp">Gene expression</option>
                                            </select>
                                        </p>
                                        <div style={{ display: numFormat === "bwtrack" ? "block" : "none" }}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="useBw"
                                                    checked={useExistingBigwig === true}
                                                    onChange={this.toggleUseBigWig}
                                                />
                                                <span>Use loaded tracks</span>
                                            </label>
                                            {useExistingBigwig ? (
                                                bwTracks.length ? (
                                                    <select
                                                        name="bwUrlList"
                                                        onChange={this.handleBigWigUrlChange}
                                                        defaultValue={bigWigUrl}
                                                    >
                                                        <option value="">--</option>
                                                        {bwTracks.map((tk, idx) => (
                                                            <option key={idx} value={tk.url}>
                                                                {tk.getDisplayLabel() || tk.url}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-danger font-italic text-sm-left">
                                                        No loaded bigwig track, please uncheck the option above and use
                                                        a bigwig file URL.
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
                                        </div>
                                        <input
                                            style={{ display: numFormat === "geneexp" ? "block" : "none" }}
                                            type="file"
                                            name="numFile"
                                            onChange={this.handleNumFileUpload}
                                            key={numFormat}
                                        />
                                        <OpacityThickness
                                            opacity={lineOpacity}
                                            thickness={cartoonThickness}
                                            onUpdate={this.updateLegendColor}
                                        />
                                        {colorScale && (
                                            <div>
                                                <label>
                                                    auto scale:{" "}
                                                    <input
                                                        type="checkbox"
                                                        checked={autoLegendScale}
                                                        onChange={this.handleAutoLegendScaleChange}
                                                    />
                                                    current data: (min {legendMin}: max: {legendMax})
                                                </label>
                                                <div>
                                                    <label>
                                                        min:{" "}
                                                        <input
                                                            style={{ width: "9ch" }}
                                                            type="number"
                                                            value={useLegengMin}
                                                            onChange={this.setUseLegendMin}
                                                            disabled={autoLegendScale}
                                                        />
                                                    </label>
                                                    <label>
                                                        max:{" "}
                                                        <input
                                                            style={{ width: "9ch" }}
                                                            type="number"
                                                            value={useLegengMax}
                                                            onChange={this.setUseLegendMax}
                                                            disabled={autoLegendScale}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
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
                                            Compartment Painting
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapse5" className="collapse show" aria-labelledby="heading5">
                                    <div className="card-body">
                                        <div>
                                            <p>
                                                <strong>Compartment data:</strong>{" "}
                                                <span className="font-italic">
                                                    <a
                                                        href={HELP_LINKS.threed}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        formats requirement
                                                    </a>
                                                </span>
                                            </p>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="useAnnot"
                                                    checked={uploadCompartmentFile === false}
                                                    onChange={this.toggleUseCompartment}
                                                />
                                                <span>Use File URL</span>
                                            </label>
                                        </div>
                                        <input
                                            style={{ display: uploadCompartmentFile ? "block" : "none" }}
                                            type="file"
                                            name="annotFile"
                                            onChange={this.handleCompartmentFileUpload}
                                        />
                                        <div style={{ display: uploadCompartmentFile ? "none" : "block" }}>
                                            <input
                                                type="text"
                                                placeholder="compartment file url"
                                                value={compartmentFileUrl}
                                                onChange={this.handleCompartmentFileUrlChange}
                                            />
                                            <button
                                                style={{ display: uploadCompartmentFile ? "none" : "block" }}
                                                className="btn btn-warning btn-sm"
                                                onClick={this.set4DNExampleURL}
                                            >
                                                Example
                                            </button>
                                        </div>
                                        <OpacityThickness
                                            opacity={lineOpacity}
                                            thickness={cartoonThickness}
                                            onUpdate={this.updateLegendColor}
                                        />
                                        <p>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={paintCompartmentRegion === "region"}
                                                onClick={() => this.paintCompartment("region")}
                                            >
                                                Paint region
                                            </button>
                                            <button
                                                className="btn btn-success btn-sm"
                                                disabled={paintCompartmentRegion === "chrom"}
                                                onClick={() => this.paintCompartment("chrom")}
                                            >
                                                Paint chromosome
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                disabled={paintCompartmentRegion === "genome"}
                                                onClick={() => this.paintCompartment("genome")}
                                            >
                                                Paint genome
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                disabled={paintCompartmentRegion === "none"}
                                                onClick={this.removeCompartmentPaint}
                                            >
                                                Remove paint
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header" id="heading8">
                                    <h5 className="mb-0">
                                        <button
                                            className="btn btn-link btn-block text-left"
                                            data-toggle="collapse"
                                            data-target="#collapse8"
                                            aria-expanded="true"
                                            aria-controls="collapse8"
                                        >
                                            Annotation Painting
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapse8" className="collapse show" aria-labelledby="heading8">
                                    <div className="card-body">
                                        <div>
                                            <p>
                                                <strong>Annotation data:</strong>{" "}
                                                <span className="font-italic">
                                                    <a
                                                        href={HELP_LINKS.threed}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        formats requirement
                                                    </a>
                                                </span>
                                            </p>
                                            <p>
                                                <span>File format:</span>{" "}
                                                <select
                                                    name="annoFormat"
                                                    defaultValue={annoFormat}
                                                    onChange={this.handleAnnoFormatChange}
                                                >
                                                    <option value="cytoband">Ideogram cytoband</option>
                                                    <option value="refgene">UCSC refGene</option>
                                                    <option value="bedrgb">Bed (9 columns)</option>
                                                </select>
                                            </p>
                                        </div>
                                        <input
                                            style={{ display: annoFormat === "cytoband" ? "none" : "block" }}
                                            type="file"
                                            name="annoFile"
                                            onChange={this.handleAnnotationFileUpload}
                                            key={annoFormat}
                                        />
                                        <OpacityThickness
                                            opacity={lineOpacity}
                                            thickness={cartoonThickness}
                                            onUpdate={this.updateLegendColor}
                                        />
                                        <label style={{ display: annoFormat === "refgene" ? "block" : "none" }}>
                                            <input
                                                type="checkbox"
                                                name="usePromoter"
                                                checked={annoUsePromoter === true}
                                                onChange={this.toggleUsePromoter}
                                            />
                                            <span>Use promoter only</span>
                                        </label>
                                        <p>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                disabled={paintAnnotationRegion === "region"}
                                                onClick={() => this.paintAnnotation("region")}
                                            >
                                                Paint region
                                            </button>
                                            <button
                                                className="btn btn-success btn-sm"
                                                disabled={paintAnnotationRegion === "chrom"}
                                                onClick={() => this.paintAnnotation("chrom")}
                                            >
                                                Paint chromosome
                                            </button>
                                            <button
                                                className="btn btn-info btn-sm"
                                                disabled={paintAnnotationRegion === "genome"}
                                                onClick={() => this.paintAnnotation("genome")}
                                            >
                                                Paint genome
                                            </button>
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                disabled={paintAnnotationRegion === "none"}
                                                onClick={this.removeAnnotationPaint}
                                            >
                                                Remove paint
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header" id="heading6">
                                    <h5 className="mb-0">
                                        <button
                                            className="btn btn-link btn-block text-left"
                                            data-toggle="collapse"
                                            data-target="#collapse6"
                                            aria-expanded="true"
                                            aria-controls="collapse6"
                                        >
                                            Animation
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapse6" className="collapse show" aria-labelledby="heading6">
                                    <div className="card-body">
                                        <FrameListMenu frameList={frameLabels} />
                                        <div style={{ display: "flex" }}>
                                            <input
                                                type="text"
                                                placeholder="new g3d url"
                                                value={newG3dUrl}
                                                onChange={this.handleNewG3dUrlChange}
                                            />
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={this.prepareModelFrames}
                                            >
                                                Add
                                            </button>
                                        </div>
                                        {frameLabels.length > 1 ? (
                                            <div>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={this.animate}
                                                    disabled={sync3d}
                                                >
                                                    Play
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm"
                                                    onClick={this.stopAnimate}
                                                    disabled={sync3d}
                                                >
                                                    Stop
                                                </button>
                                                <button
                                                    className="btn btn-info btn-sm"
                                                    onClick={this.resetAnimate}
                                                    disabled={sync3d}
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        ) : (
                                            <div>add 2 and more models for animation</div>
                                        )}
                                        <div>
                                            <button
                                                className="btn btn-warning btn-sm"
                                                onClick={this.syncHic}
                                                disabled={sync3d}
                                            >
                                                Sync dynamic HiC
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={this.stopSync}
                                                disabled={!sync3d}
                                            >
                                                Stop sync
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <div className="card-header" id="heading7">
                                    <h5 className="mb-0">
                                        <button
                                            className="btn btn-link btn-block text-left"
                                            data-toggle="collapse"
                                            data-target="#collapse7"
                                            aria-expanded="true"
                                            aria-controls="collapse7"
                                        >
                                            Export
                                        </button>
                                    </h5>
                                </div>
                                <div id="collapse7" className="collapse show" aria-labelledby="heading7">
                                    <div className="card-body">
                                        <div>
                                            Save main and thumbnail viewer as image.
                                            <div>
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => this.saveImage(this.viewer)}
                                                >
                                                    Save main
                                                </button>
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => this.saveImage(this.viewer2)}
                                                >
                                                    Save thumbnail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Drawer>
                )}

                <div style={{ position: "relative" }}>
                    <div className="placement-container">
                        <div className="text-left">
                            <div>
                                <button className="btn btn-primary btn-sm" onClick={this.onSwitch}>
                                    {childShow ? "Close menu" : "Open menu"}
                                </button>{" "}
                                <span className="text-danger font-italic">
                                    {message.length ? (
                                        <div>
                                            {message}{" "}
                                            <button className="btn btn-danger btn-sm" onClick={this.clearMessage}>
                                                X
                                            </button>
                                        </div>
                                    ) : null}
                                </span>
                            </div>
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
                        </div>
                    </div>

                    <div id="legend">
                        {paintMethod === "score" && (
                            <Legend colorScale={colorScale} onUpdateLegendColor={this.updateLegendColor} />
                        )}

                        {(paintMethod === "compartment" || paintMethod === "annotation") && (
                            <CategoryLegend
                                categories={categories}
                                onUpdateLegendColor={this.updateLegendColor}
                                fullWidth={paintMethod === "annotation"}
                            />
                        )}
                    </div>
                    <div id="static-legend">
                        <StaticLegend categories={staticCategories} />
                    </div>

                    <div className={layout}>
                        <HoverInfo
                            atom={hoveringAtom}
                            resolution={resolution}
                            x={hoveringX - x}
                            y={hoveringY - y}
                            viewRegion={viewRegion}
                            onNewViewRegion={onNewViewRegion}
                            removeHover={this.removeHover}
                            addToLabel={this.addAnchors3dToMyArrows}
                        />
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
