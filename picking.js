// =============================================================================
// picking.js
// Owner: Member 3 (Camera and interaction)
// -----------------------------------------------------------------------------
// What this file does:
//   Turns a click into a ray in world space and tests that ray against each
//   tree's bounding box and against the ground. It also keeps every tree's
//   bounding box around the part of the tree that is visible right now.
//
// Provides:
//   screenToRay, pickTree, intersectRayGround  (input.js, on every click)
//   updateBounds                               (main.js, every frame)
// Uses:
//   transforms.js: add, subtract, scaleVector, normalize
//   tree.js:       getBranchTip, and the fields tree.branches and branch.growth
// =============================================================================

const BOUNDS_MARGIN = 0.25;   // padding around each box, so thin twigs and blossoms are easy to click


/** General 4x4 matrix inverse (column-major). Returns null if m cannot be inverted. */
function invertMatrix(m) {
  // TODO (Member 3)
  return null;
}


/**
 * Converts a click at canvas pixel (x, y) into a world-space ray:
 *   1. pixel to normalized device coordinates: x from -1 (left edge) to 1
 *      (right edge), y from -1 (bottom) to 1 (top)
 *   2. unproject the points at z = -1 (near plane) and z = 1 (far plane) with
 *      invertMatrix(viewProjection), dividing each by its w
 *   3. origin = the near point; direction = the unit vector toward the far point
 *
 * @param {number}       width, height   the canvas size in CSS pixels
 * @param {Float32Array} viewProjection  from getViewProjection(width / height)
 * @returns {{origin: number[], direction: number[]} | null}
 */
function screenToRay(x, y, width, height, viewProjection) {
  // TODO (Member 3)
  return null;
}


/**
 * Ray against an axis-aligned box { min: [x, y, z], max: [x, y, z] }
 * (slab method). Returns the distance along the ray to where it enters the
 * box, or null if it misses.
 */
function intersectRayBox(ray, box) {
  // TODO (Member 3)
  return null;
}


/**
 * Ray against the ground plane y = 0. Returns the hit point [x, 0, z], or
 * null if the ray points up (a click on the sky) or the plane is behind it.
 */
function intersectRayGround(ray) {
  // TODO (Member 3)
  return null;
}


/**
 * Returns the tree whose bounding box the ray enters closest to the camera,
 * or null if it hits none. Called by input.js.
 */
function pickTree(ray, trees) {
  // TODO (Member 3)
  return null;
}


/**
 * Rebuilds tree.bounds around the part of the tree that is visible now, in
 * its current pose: the trunk's base and the tip of every branch with
 * growth > 0 (getBranchTip), padded by BOUNDS_MARGIN. A young tree therefore
 * has a small box and doesn't block clicks on the ground around it.
 * Called every frame by main.js, after updateWorldMatrices.
 */
function updateBounds(tree) {
  // TODO (Member 3)
}
