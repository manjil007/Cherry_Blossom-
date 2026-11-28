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


/** Signed determinant of the 3x3 submatrix after removing a row and column. */
function pickingMatrixCofactor(m, excludedRow, excludedColumn) {
  const minor = [];
  for (let column = 0; column < 4; column++) {
    if (column === excludedColumn) continue;
    for (let row = 0; row < 4; row++) {
      if (row !== excludedRow) minor.push(m[column * 4 + row]);
    }
  }

  const [a, d, g, b, e, h, c, f, i] = minor;
  const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  return (excludedRow + excludedColumn) % 2 === 0 ? determinant : -determinant;
}


/** General 4x4 matrix inverse (column-major). Returns null if m cannot be inverted. */
function invertMatrix(m) {
  const adjugate = new Array(16);
  for (let column = 0; column < 4; column++) {
    for (let row = 0; row < 4; row++) {
      // Transpose the cofactors as they are stored.
      adjugate[row * 4 + column] = pickingMatrixCofactor(m, row, column);
    }
  }

  // Expand along the first row of m, using its cofactors from the first column of the adjugate.
  const determinant = m[0] * adjugate[0] + m[4] * adjugate[1]
    + m[8] * adjugate[2] + m[12] * adjugate[3];
  if (!Number.isFinite(determinant) || Math.abs(determinant) < 1e-12) return null;

  return Float32Array.from(adjugate, value => value / determinant);
}


/** Applies a column-major matrix to a homogeneous 4-component vector. */
function pickingMultiplyVec4(m, v) {
  const [x, y, z, w] = v;
  const result = new Array(4);
  for (let row = 0; row < 4; row++) {
    result[row] = m[row] * x + m[4 + row] * y + m[8 + row] * z + m[12 + row] * w;
  }
  return result;
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
  if (width <= 0 || height <= 0) return null;
  const nx = 2 * x / width - 1;
  const ny = 1 - 2 * y / height;
  const inverse = invertMatrix(viewProjection);
  if (inverse === null) return null;

  const [nearX, nearY, nearZ, nearW] = pickingMultiplyVec4(inverse, [nx, ny, -1, 1]);
  const [farX, farY, farZ, farW] = pickingMultiplyVec4(inverse, [nx, ny, 1, 1]);
  if (nearW === 0 || farW === 0) return null;

  const nearPoint = [nearX / nearW, nearY / nearW, nearZ / nearW];
  const farPoint = [farX / farW, farY / farW, farZ / farW];
  return { origin: nearPoint, direction: normalize(subtract(farPoint, nearPoint)) };
}


/**
 * Ray against an axis-aligned box { min: [x, y, z], max: [x, y, z] }
 * (slab method). Returns the distance along the ray to where it enters the
 * box, or null if it misses.
 */
function intersectRayBox(ray, box) {
  let tNear = -Infinity;
  let tFar = Infinity;

  for (let axis = 0; axis < 3; axis++) {
    const origin = ray.origin[axis];
    const direction = ray.direction[axis];
    const min = box.min[axis];
    const max = box.max[axis];

    if (Math.abs(direction) < 1e-9) {
      if (origin < min || origin > max) return null;
      continue;
    }

    const t1 = (min - origin) / direction;
    const t2 = (max - origin) / direction;
    tNear = Math.max(tNear, Math.min(t1, t2));
    tFar = Math.min(tFar, Math.max(t1, t2));
    if (tNear > tFar) return null;
  }

  if (tFar < 0) return null;
  return Math.max(tNear, 0);
}


/**
 * Ray against the ground plane y = 0. Returns the hit point [x, 0, z], or
 * null if the ray points up (a click on the sky) or the plane is behind it.
 */
function intersectRayGround(ray) {
  const [ox, oy, oz] = ray.origin;
  const [dx, dy, dz] = ray.direction;
  if (dy >= -1e-6) return null;

  const t = -oy / dy;
  if (t < 0) return null;
  return [ox + t * dx, 0, oz + t * dz];
}


/**
 * Returns the tree whose bounding box the ray enters closest to the camera,
 * or null if it hits none. Called by input.js.
 */
function pickTree(ray, trees) {
  let closestTree = null;
  let closestDistance = Infinity;
  for (const tree of trees) {
    if (!tree.bounds) continue;

    const distance = intersectRayBox(ray, tree.bounds);
    if (distance !== null && distance < closestDistance) {
      closestTree = tree;
      closestDistance = distance;
    }
  }
  return closestTree;
}


/**
 * Rebuilds tree.bounds around the part of the tree that is visible now, in
 * its current pose: the trunk's base and the tip of every branch with
 * growth > 0 (getBranchTip), padded by BOUNDS_MARGIN. A young tree therefore
 * has a small box and doesn't block clicks on the ground around it.
 * Called every frame by main.js, after updateWorldMatrices.
 */
function updateBounds(tree) {
  const min = tree.position.slice();
  const max = tree.position.slice();

  for (const branch of tree.branches) {
    if (branch.growth > 0) {
      const tip = getBranchTip(branch);
      for (let axis = 0; axis < 3; axis++) {
        min[axis] = Math.min(min[axis], tip[axis]);
        max[axis] = Math.max(max[axis], tip[axis]);
      }
    }
  }

  for (let axis = 0; axis < 3; axis++) {
    min[axis] -= BOUNDS_MARGIN;
    max[axis] += BOUNDS_MARGIN;
  }
  tree.bounds = { min, max };
}
