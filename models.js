// =============================================================================
// models.js
// Owner: Member 1 (Geometry and hierarchy)
// -----------------------------------------------------------------------------
// What this file does:
//   Generates the two reusable meshes every tree is made of. renderer.js
//   uploads each one to the GPU once. After that, every branch of every tree
//   reuses the same cylinder, and every joint and blossom reuses the same
//   sphere; the renderer scales them differently when it draws them.
//
// Every generator returns plain typed arrays:
//   {
//     positions: Float32Array   // x, y, z for each vertex
//     normals:   Float32Array   // unit normal for each vertex, in the same order
//     indices:   Uint16Array    // 3 per triangle, counter-clockwise seen from outside
//   }
//
// Provides: createTaperedCylinder, createSphere (to renderer.js)
// Uses:     nothing (it may use the vector helpers in transforms.js).
// =============================================================================


/**
 * A tapered cylinder standing on the XZ plane and pointing up the +Y axis:
 *   - base: a circle of radius 1 at y = 0
 *   - tip:  a circle of radius tipRadius at y = 1
 *   - open at both ends: the base hides inside the parent branch or the
 *     ground, and a sphere covers the tip
 * Because the side leans inward, its normals tilt slightly upward instead of
 * pointing straight out.
 * renderer.js calls it with tipRadius = TREE_SETTINGS.radiusRatio, so a
 * child's base is exactly as wide as its parent's tip.
 *
 * @param {number} tipRadius  tip radius relative to the base radius (0 to 1)
 * @param {number} segments   number of sides around the circle (16 is plenty)
 */
function createTaperedCylinder(tipRadius, segments) {
  // TODO (Member 1)
  return createEmptyMesh();
}


/**
 * A sphere of radius 1 centered at the origin. Its normals are equal to its
 * positions. Used for the joints at branch tips and for the blossoms.
 *
 * @param {number} stacks  rings from pole to pole (about 12)
 * @param {number} slices  segments around the sphere (about 16)
 */
function createSphere(stacks, slices) {
  // TODO (Member 1)
  return createEmptyMesh();
}


/**
 * A mesh with no triangles. It is the placeholder the generators return until
 * they are written, so the renderer simply draws nothing.
 */
function createEmptyMesh() {
  return { positions: new Float32Array(0), normals: new Float32Array(0), indices: new Uint16Array(0) };
}
