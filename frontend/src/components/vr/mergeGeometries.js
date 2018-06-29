import _ from 'lodash';

/**
 * Merges an array of BufferGeometry into one BufferGeometry.
 * 
 * @param {THREE.BufferGeometry[]} geometries - the geometries to merge
 * @return {THREE.BufferGeometry} the merged geometry
 */
export function mergeGeometries(geometries) {
    const nonIndexedInput = geometries.map(geometry =>
        geometry.getAttribute('index') === null ? geometry : geometry.toNonIndexed()
    );
    const totalVertices = _.sumBy(nonIndexedInput, geometry => geometry.getAttribute('position').count);

    let mergedGeometry = new window.THREE.BufferGeometry();
    // We are assuming Vector3s
    mergedGeometry.addAttribute('position', new window.THREE.BufferAttribute(new Float32Array(totalVertices * 3), 3));
    let vertexNum = 0;
    for (let geometry of nonIndexedInput) {
        mergedGeometry.merge(geometry, vertexNum);
        vertexNum += geometry.getAttribute('position').count;
    }
    return mergedGeometry;
}
