import React from 'react';
import { Custom3DObject } from './Custom3DObject';

export class Ribbon extends React.Component {
    render() {
        const THREE = (window as any).THREE;
        // const ribbonShape = new THREE.Shape();

        const ribbonShape = new THREE.Shape();
        ribbonShape.moveTo(-10, 0);
        ribbonShape.quadraticCurveTo(0, 10, 10, 0);
        ribbonShape.quadraticCurveTo(0, 9.5, -10, 0);
        
        const geometry = new THREE.ExtrudeGeometry(ribbonShape, {
            curveSegments: 30, amount: 1, depth: 1, bevelEnabled: false
        });
        const material = new THREE.MeshPhongMaterial({color: "red", transparent: true, opacity: 0.5});
        const mesh = new THREE.Mesh( geometry, material );
        return <Custom3DObject object={mesh} position="0 0 -5" />;
    }
}
