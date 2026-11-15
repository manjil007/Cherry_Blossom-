// =============================================================================
// input.js
// Owner: Member 3 (Camera and interaction)
// -----------------------------------------------------------------------------
// What this file does:
//   Handles the mouse on the canvas, and owns planting and selecting trees.
//   A press that moves less than DRAG_THRESHOLD pixels is a click: it selects
//   the nearest tree under the cursor, or plants a new tree on open ground.
//   A press that moves farther is a drag: it orbits the camera.
//
// Provides:
//   initInput   (main.js, once at startup)
//   plantTree   (main.js, once at startup for the tree the scene opens with)
//   selectTree
//   MAX_TREES, GARDEN_RADIUS, DRAG_THRESHOLD
// Uses:
//   picking.js: screenToRay, pickTree, intersectRayGround
//   camera.js:  getViewProjection, orbitCamera, zoomCamera
//   tree.js:    createTree
//   ui.js:      getUISettings, showSelectedTree, showNotice
//   main.js:    garden (trees, selected, time)
// =============================================================================

const MAX_TREES = 3;          // the garden holds at most three trees
const GARDEN_RADIUS = 6;      // trees can be planted within this distance of the center
const DRAG_THRESHOLD = 5;     // pixels a press may move and still count as a click

// This file's own state
const inputState = {
  canvas: null,               // the canvas, saved by initInput
  press: null                 // the press in progress: where it started, its last position,
                              // and whether it has become a drag
};


/**
 * Attaches the mouse listeners to the canvas. Called once by main.js.
 *   pointerdown: remember where the press started
 *   pointermove: once the press has moved more than DRAG_THRESHOLD pixels it
 *                is a drag; while dragging, call orbitCamera(dx, dy)
 *   pointerup:   if the press never became a drag, call handleClick(x, y)
 *   wheel:       optional, call zoomCamera
 */
function initInput(canvas) {
  // TODO (Member 3)
}


/**
 * Handles a click at canvas pixel (x, y):
 *   1. ray = screenToRay(...), using getViewProjection(canvas width / height)
 *   2. if pickTree(ray, garden.trees) finds a tree, selectTree(that tree) and stop
 *   3. if MAX_TREES trees are already planted, showNotice(...) and stop
 *   4. point = intersectRayGround(ray); if it lies within GARDEN_RADIUS of the
 *      center, plantTree(point), otherwise showNotice(...)
 */
function handleClick(x, y) {
  // TODO (Member 3)
}


/**
 * Plants a new tree at position [x, 0, z] with the current slider values
 * (getUISettings()) and the current scene time (garden.time). Gives it the
 * next free id (1, 2 or 3), adds it to garden.trees and selects it.
 * main.js calls this once at startup for the tree the scene opens with.
 */
function plantTree(position) {
  // TODO (Member 3)
}


/**
 * Makes `tree` the selected tree (null for none), and calls
 * showSelectedTree(tree) so the panel shows its settings.
 */
function selectTree(tree) {
  // TODO (Member 3)
}
