// =============================================================================
// transforms.js
// Owner: Member 1 (Geometry and hierarchy)
// -----------------------------------------------------------------------------
// What this file does:
//   The shared math library: 4x4 matrices and 3D vectors. Every other file
//   uses it, so it loads first. Start from the matrix helpers you wrote for
//   the homework and add whatever is missing.
//
// Conventions the whole team relies on:
//   - A matrix is a Float32Array(16) in column-major order, like the homework
//     and like WebGL expects, so it can go straight into gl.uniformMatrix4fv.
//   - A point or vector is a plain array [x, y, z].
//   - Angles are in radians.
//   - Functions never change their inputs. They return new arrays.
//
// Matrix functions that only one file needs live in that file instead:
//   perspective() and lookAt() in camera.js, invertMatrix() in picking.js,
//   and normalMatrix() in renderer.js.
//
// Provides: every function below, to every other file.
// Uses:     nothing.
// =============================================================================


// ---- Matrices ----------------------------------------------------------------

/** Returns the 4x4 identity matrix. */
function identity() {
  // TODO (Member 1)
  return new Float32Array(16);
}

/**
 * Returns the matrix product a * b. Applied to a point, b acts first, then a.
 * Example: multiply(translate(0, 1, 0), rotateZ(angle)) rotates a point,
 * then moves it up by 1.
 */
function multiply(a, b) {
  // TODO (Member 1)
  return new Float32Array(16);
}

/** Returns a matrix that moves points by (x, y, z). */
function translate(x, y, z) {
  // TODO (Member 1)
  return new Float32Array(16);
}

/** Returns a matrix that scales by x, y and z along the three axes. */
function scale(x, y, z) {
  // TODO (Member 1)
  return new Float32Array(16);
}

// Rotations about the coordinate axes are right-handed: a positive angle turns
// counter-clockwise when you look from the positive end of the axis toward
// the origin.

/** Rotation by `angle` radians about the X axis. */
function rotateX(angle) {
  // TODO (Member 1)
  return new Float32Array(16);
}

/** Rotation by `angle` radians about the Y axis. */
function rotateY(angle) {
  // TODO (Member 1)
  return new Float32Array(16);
}

/** Rotation by `angle` radians about the Z axis. */
function rotateZ(angle) {
  // TODO (Member 1)
  return new Float32Array(16);
}

/**
 * Rotation by `angle` radians about any unit-length `axis` [x, y, z]
 * (Rodrigues' rotation formula). animation.js can use it for wind sway.
 */
function rotateAxis(axis, angle) {
  // TODO (Member 1)
  return new Float32Array(16);
}

/**
 * Applies matrix m to the point p = [x, y, z] (treated as [x, y, z, 1]) and
 * returns the transformed [x, y, z]. tree.js uses it to find branch tips.
 */
function transformPoint(m, p) {
  // TODO (Member 1)
  return [0, 0, 0];
}


// ---- Vectors -----------------------------------------------------------------

/** Returns a + b. */
function add(a, b) {
  // TODO (Member 1)
  return [0, 0, 0];
}

/** Returns a - b. */
function subtract(a, b) {
  // TODO (Member 1)
  return [0, 0, 0];
}

/** Returns the vector v multiplied by the number s. */
function scaleVector(v, s) {
  // TODO (Member 1)
  return [0, 0, 0];
}

/** Returns the dot product of a and b. */
function dot(a, b) {
  // TODO (Member 1)
  return 0;
}

/** Returns the cross product a x b. */
function cross(a, b) {
  // TODO (Member 1)
  return [0, 0, 0];
}

/** Returns the length of v. (It is not named "length", which would clash with window.length.) */
function vectorLength(v) {
  // TODO (Member 1)
  return 0;
}

/** Returns v scaled to length 1. */
function normalize(v) {
  // TODO (Member 1)
  return [0, 0, 0];
}


// ---- Numbers -----------------------------------------------------------------

/** Converts degrees to radians. */
function radians(degrees) {
  // TODO (Member 1)
  return 0;
}

/** Returns x limited to the range [min, max]. */
function clamp(x, min, max) {
  // TODO (Member 1)
  return x;
}
