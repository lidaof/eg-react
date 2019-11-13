import React from 'react';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { getSplines, getTubeMesh } from '../../../util';

import './ThreeScene.css';

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
        this.meshes = {};
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
        this.toggleChromLabelDisplay();
        window.addEventListener('resize', this.onWindowResize);
    }

    componentDidUpdate(prevProps, prevState) {
        const { options, data } = this.props;
        if (prevProps.options.backgroundColor !== options.backgroundColor) {
            this.scene.background = new THREE.Color(options.backgroundColor);
        }
        if (prevProps.data !== data && data.length) {
            this.clearScene();
            this.clearLabelDiv();
            this.addShapes();
        }
        if (prevProps.options.showChromLabels !== options.showChromLabels) {
            this.toggleChromLabelDisplay();
        }
        if (prevProps.options.height !== options.height) {
            this.onWindowResize();
        }
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

    clearLabelDiv() {
        const labelDiv = this.labelRenderer.domElement;
        while (labelDiv.firstChild) {
            labelDiv.removeChild(labelDiv.firstChild);
        }
    }

    toggleChromLabelDisplay() {
        const labelDiv = this.labelRenderer.domElement;
        labelDiv.style.display = this.props.options.showChromLabels ? 'block' : 'none';
    }

    disposeMesh(mesh) {
        mesh.geometry.dispose();
        if (mesh.material.isMaterial) {
            mesh.material.dispose();
        } else {
            for (const material of mesh.material) {
                material.dispose();
            }
        }
    }
    clearScene() {
        if (Object.keys(this.meshes).length) {
            Object.keys(this.meshes).forEach(chrom => {
                const mesh = this.meshes[chrom];
                this.scene.remove(mesh);
                this.disposeMesh(mesh);
            });
        }
    }

    addShapes() {
        const splines = getSplines(this.props.data);
        Object.keys(splines).forEach(chrom => {
            const { spline, color } = splines[chrom];
            const mesh = getTubeMesh(spline, color);
            this.scene.add(mesh);
            // add label
            const labelDiv = document.createElement('div');
            labelDiv.className = 'label';
            labelDiv.textContent = chrom;
            labelDiv.style.marginTop = '-1em';
            labelDiv.style.color = color;
            const label = new CSS2DObject(labelDiv);
            label.position.copy(spline.getPoint(0));
            mesh.add(label);
            this.meshes[chrom] = mesh;
        });
    }

    updateScene() {}

    renderScene() {
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }

    onWindowResize = () => {
        // set the aspect ratio to match the new browser window aspect ratio
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;

        // update the camera's frustum
        this.camera.updateProjectionMatrix();

        // update the size of the renderer AND the canvas
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
    };

    render() {
        const { width, height } = this.props;
        const style = { width: `${width}px`, height: `${height}px` };
        return <div style={style} ref={this.myRef}></div>;
    }
}
