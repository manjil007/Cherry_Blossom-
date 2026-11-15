// =============================================================================
// main.js
// Owner: Member 2 (Growth, wind and controls)
// -----------------------------------------------------------------------------
// What this file does:
//   Starts the app and runs the animation loop. It owns the shared `garden`
//   state, sets every part up once, plants the tree the scene opens with, and
//   then, every frame, advances the scene clock, updates every tree and draws
//   the scene.
//
//   This file loads last, and it is the only file that calls other files'
//   functions while the page loads. The calls below are the team's wiring
//   (README sections 5.3 and 5.4); keep them in this order.
//
// Provides:
//   garden  (read and changed by ui.js and input.js, drawn by renderer.js)
// Uses:
//   renderer.js:  initRenderer, drawScene
//   ui.js:        initUI
//   input.js:     initInput, plantTree
//   animation.js: updateAnimation
//   tree.js:      updateWorldMatrices
//   picking.js:   updateBounds
//   camera.js:    camera
// =============================================================================

// Shared state of the scene
const garden = {
  trees: [],             // planted trees, at most MAX_TREES (input.js adds them)
  selected: null,        // the selected tree, or null (input.js sets it)
  time: 0,               // scene clock in seconds (advanced in frame below)
  windStrength: 0.35     // 0 to 1, set by the wind slider (ui.js)
};

const sceneCanvas = document.getElementById("glcanvas");


// ---- Startup (the order matters) --------------------------------------------

initRenderer(sceneCanvas);   // Member 4: WebGL context, shaders, meshes
initUI();                    // Member 2: slider listeners
initInput(sceneCanvas);      // Member 3: mouse listeners
plantTree([0, 0, 0]);        // Member 3: the scene opens with one tree growing in the center


// ---- Animation loop -----------------------------------------------------------

let lastFrameTime = 0;       // timestamp of the previous frame, in milliseconds

/**
 * Runs once per screen refresh; requestAnimationFrame passes `now` in
 * milliseconds. Advances the clock, updates every tree, then draws.
 */
function frame(now) {
  // TODO (Member 2): advance garden.time by the seconds since the last frame,
  // (now - lastFrameTime) / 1000, capped at about 0.1 s so the animation
  // doesn't jump after the browser tab was in the background. Then store
  // `now` in lastFrameTime.

  for (const tree of garden.trees) {
    updateAnimation(tree, garden.time, garden.windStrength);  // Member 2: growth, bloom, sway
    updateWorldMatrices(tree);                                // Member 1: parent x local, no scaling
    updateBounds(tree);                                       // Member 3: box for picking
  }
  drawScene(garden, camera);                                  // Member 4

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
