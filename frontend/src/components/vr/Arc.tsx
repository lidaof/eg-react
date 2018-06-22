import React from 'react';
import { Custom3DObject } from './Custom3DObject';

interface ArcProps {
    startX: number;
    endX: number;
    height: number;
    depth: number;
    z?: number;
    opacity?: number;
}

const THICKNESS_FACTOR = 0.025; // Thickness of the arc as a multiple of the arc's width

export class Arc extends React.Component<ArcProps, {}> {
    render() {
        const {startX, endX, height, depth, z, opacity} = this.props;
        const thickness = (endX - startX) * THICKNESS_FACTOR;
        const centerX = (startX + endX) / 2;
        const THREE = (window as any).THREE;

        const arcShape = new THREE.Shape();
        arcShape.moveTo(startX, 0);
        arcShape.quadraticCurveTo(centerX, height + thickness, endX, 0);
        arcShape.quadraticCurveTo(centerX, height, startX, 0);
        
        const geometry = new THREE.ExtrudeGeometry(arcShape, {
            curveSegments: 30, amount: depth, depth, bevelEnabled: false
        });
        const material = new THREE.MeshPhongMaterial({color: '#B8008A', transparent: true, opacity: opacity || 1});
        const mesh = new THREE.Mesh(geometry, material);
        return <Custom3DObject object={mesh} position={`0 0 ${z || 0}`} />;
    }
}
