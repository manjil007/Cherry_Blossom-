// =============================================================================
// camera.js
// Owner: Member 3 (Camera and interaction)
// -----------------------------------------------------------------------------
// What this file does:
//   The orbit camera. It circles the middle of the garden at a set distance
//   and height angle, and provides the matrices that renderer.js draws with
//   and that picking.js uses to turn clicks into rays.
//
// Provides:
//   camera                     (the shared camera settings)
//   getViewProjection(aspect)  (renderer.js every frame, input.js on every click)
//   getCameraPosition()        (renderer.js, if a shader needs the eye position)
//   orbitCamera(dx, dy)        (input.js, while the mouse drags)
//   zoomCamera(amount)         (input.js, mouse wheel; optional)
// Uses:
//   transforms.js: multiply, subtract, cross, normalize, dot, clamp
// =============================================================================

// Starting values. Tune them freely.
const camera = {
  target: [0, 2, 0],      // the point the camera looks at (garden center, about trunk height)
  azimuth: Math.PI / 6,   // angle around the vertical axis, in radians
  elevation: 0.28,        // angle above the ground, in radians (keep it between about 0.05 and 1.5)
  distance: 14,           // distance from the target
  fov: Math.PI / 4,       // vertical field of view, in radians
  near: 0.3,              // near clipping plane
  far: 80                 // far clipping plane
};


/**
 * Perspective projection matrix (column-major): maps the view frustum to
 * clip space.
 *
 * @param {number} fovy    vertical field of view, in radians
 * @param {number} aspect  width / height of the canvas
 */
function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}


/**
 * View matrix for a camera at `eye` looking toward `target`, with `up`
 * (usually [0, 1, 0]) as the up direction.
 */
function lookAt(eye, target, up) {
  const z = normalize(subtract(eye, target));
  const x = normalize(cross(up, z));
  const y = cross(z, x);

  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1
  ]);
}


/** Returns the camera's world position, computed from camera.target, azimuth, elevation and distance. */
function getCameraPosition() {
  const { target, azimuth, elevation, distance } = camera;
  const horizontalDistance = distance * Math.cos(elevation);
  return [
    target[0] + horizontalDistance * Math.sin(azimuth),
    target[1] + distance * Math.sin(elevation),
    target[2] + horizontalDistance * Math.cos(azimuth)
  ];
}


/**
 * Returns projection * view for a canvas with the given aspect ratio
 * (width / height), built with perspective() and lookAt() from the camera
 * settings. renderer.js draws with it every frame, and input.js passes it to
 * picking.js on every click, so drawing and picking always use the same camera.
 */
function getViewProjection(aspect) {
  const projection = perspective(camera.fov, aspect, camera.near, camera.far);
  const view = lookAt(getCameraPosition(), camera.target, [0, 1, 0]);
  return multiply(projection, view);
}


/**
 * Orbits the camera while the mouse drags by (dx, dy) pixels: dx turns the
 * camera around the garden (azimuth) and dy raises or lowers it (elevation),
 * clamped so it never goes below the ground or over the top.
 * Called by input.js.
 */
function orbitCamera(dx, dy) {
  camera.azimuth -= dx * 0.005;
  camera.elevation = clamp(camera.elevation + dy * 0.005, 0.05, 1.5);
}


/**
 * Optional: moves the camera closer or farther (mouse wheel), within limits.
 * Called by input.js.
 */
function zoomCamera(amount) {
  camera.distance = clamp(camera.distance * (1 + amount * 0.001), 4, 40);
}
