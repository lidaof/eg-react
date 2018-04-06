/**
 * Merges an array of BufferGeometry into one BufferGeometry.
 * 
 * @param {THREE.BufferGeometry[]} geometries - the geometries to merge
 * @return {THREE.BufferGeometry} the merged geometry
 */
function mergeGeometries(geometries) {
    const totalVertices = geometries.reduce(
        (currentCount, geometry) => currentCount + geometry.getAttribute('position').count,
        0
    );

    let mergedGeometry = new window.THREE.BufferGeometry();
    // We are assuming Vector3s
    mergedGeometry.addAttribute('position', new window.THREE.BufferAttribute(new Float32Array(totalVertices * 3), 3));
    let vertexNum = 0;
    for (let geometry of geometries) {
        // If indexed, we have to convert to non-indexed since merge() does not support indices.
        let toMerge = geometry.getAttribute('index') === null ? geometry : geometry.toNonIndexed();
        mergedGeometry.merge(toMerge, vertexNum);
        vertexNum += toMerge.getAttribute('position').count;
    }
    return mergedGeometry;
}

export default mergeGeometries;
