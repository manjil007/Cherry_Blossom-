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
const INPUT_GARDEN_FULL_NOTICE = "The garden is full (3 trees). Click a tree to select it.";

// This file's own state
const inputState = {
  canvas: null,               // the canvas, saved by initInput
  press: null                 // the press in progress: where it started, its last position,
                              // and whether it has become a drag
};


/** Returns the pointer position relative to the canvas in CSS pixels. */
function inputGetCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return [event.clientX - rect.left, event.clientY - rect.top];
}


/**
 * Attaches the mouse listeners to the canvas. Called once by main.js.
 *   pointerdown: remember where the press started
 *   pointermove: once the press has moved more than DRAG_THRESHOLD pixels it
 *                is a drag; while dragging, call orbitCamera(dx, dy)
 *   pointerup:   if the press never became a drag, call handleClick(x, y)
 *   wheel:       optional, call zoomCamera
 */
function initInput(canvas) {
  inputState.canvas = canvas;

  canvas.addEventListener("pointerdown", event => {
    const [x, y] = inputGetCanvasPoint(canvas, event);
    inputState.press = { startX: x, startY: y, lastX: x, lastY: y, dragging: false };
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", event => {
    const press = inputState.press;
    if (!press) return;

    const [x, y] = inputGetCanvasPoint(canvas, event);
    if (!press.dragging && Math.hypot(x - press.startX, y - press.startY) > DRAG_THRESHOLD) {
      press.dragging = true;
    }
    if (press.dragging) orbitCamera(x - press.lastX, y - press.lastY);

    press.lastX = x;
    press.lastY = y;
  });

  canvas.addEventListener("pointerup", event => {
    if (inputState.press && !inputState.press.dragging) {
      const [x, y] = inputGetCanvasPoint(canvas, event);
      handleClick(x, y);
    }
    inputState.press = null;
  });

  canvas.addEventListener("pointercancel", () => {
    inputState.press = null;
  });

  canvas.addEventListener("wheel", event => {
    event.preventDefault();
    zoomCamera(event.deltaY);
  }, { passive: false });
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
  const { width, height } = inputState.canvas.getBoundingClientRect();
  const ray = screenToRay(x, y, width, height, getViewProjection(width / height));
  if (!ray) return;

  const hit = pickTree(ray, garden.trees);
  if (hit) {
    selectTree(hit);
    return;
  }

  if (garden.trees.length >= MAX_TREES) {
    showNotice(INPUT_GARDEN_FULL_NOTICE);
    return;
  }

  const point = intersectRayGround(ray);
  if (point && Math.hypot(point[0], point[2]) <= GARDEN_RADIUS) {
    plantTree(point);
  } else {
    showNotice("Click on the ground inside the garden to plant a tree.");
  }
}


/**
 * Plants a new tree at position [x, 0, z] with the current slider values
 * (getUISettings()) and the current scene time (garden.time). Gives it the
 * next free id (1, 2 or 3), adds it to garden.trees and selects it.
 * main.js calls this once at startup for the tree the scene opens with.
 */
function plantTree(position) {
  if (garden.trees.length >= MAX_TREES) {
    showNotice(INPUT_GARDEN_FULL_NOTICE);
    return null;
  }

  const { depth, branchAngle } = getUISettings();
  const tree = createTree([position[0], 0, position[2]], depth, branchAngle, garden.time);
  let id = 1;
  while (garden.trees.some(existingTree => existingTree.id === id)) id++;
  tree.id = id;

  garden.trees.push(tree);
  selectTree(tree);
  return tree;
}


/**
 * Makes `tree` the selected tree (null for none), and calls
 * showSelectedTree(tree) so the panel shows its settings.
 */
function selectTree(tree) {
  garden.selected = tree;
  showSelectedTree(tree);
}
