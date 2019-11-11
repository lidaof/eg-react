import React from 'react';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export class ThreeScene extends React.PureComponent {
    constructor(props) {
        super(props);
        this.myRef = React.createRef();
        this.container = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.labelRenderer = null;
    }

    componentDidMount() {
        this.container = this.myRef.current;
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.props.options.backgroundColor);
        this.createCamera();
        this.createControls();
        this.createLights();
        this.createRenderer();
        // start the animation loop
        this.renderer.setAnimationLoop(() => {
            this.updateScene();
            this.renderScene();
        });
    }

    createCamera() {
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        const aspect = containerWidth / containerHeight;
        this.camera = new THREE.PerspectiveCamera(
            50, // FOV
            aspect, // aspect
            0.1, // near clipping plane
            10000 // far clipping plane
        );
        this.camera.position.set(0, 50, 200);
    }

    createControls() {
        this.controls = new OrbitControls(this.camera, this.container);
    }

    createLights() {
        const ambientLight = new THREE.HemisphereLight(
            0xddeeff, // sky color
            0x202020, // ground color
            8 // intensity
        );

        const mainLight = new THREE.DirectionalLight(0xffffff, 5);
        mainLight.position.set(10, 10, 10);

        this.scene.add(ambientLight, mainLight);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);

        // label renderer
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = 0;
        // this.labelRenderer.domElement.id = 'labelDiv' // for by pass mouse events
        this.container.appendChild(this.labelRenderer.domElement);
        // this.labelControls = new OrbitControls(
        //   this.camera,
        //   this.labelRenderer.domElement
        // )
    }

    updateScene() {}

    renderScene() {
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.options.backgroundColor !== this.props.options.backgroundColor) {
            this.scene.background = new THREE.Color(this.props.options.backgroundColor);
        }
    }

    render() {
        const { width, height, data } = this.props;
        console.log(data);
        const style = { width: `${width}px`, height: `${height}px` };
        return <div style={style} ref={this.myRef}></div>;
    }
}
