// =============================================================================
// ui.js
// Owner: Member 2 (Growth, wind and controls)
// -----------------------------------------------------------------------------
// What this file does:
//   Runs the control panel in index.html. It reads the three sliders, shows
//   their values, applies angle and depth changes to the selected tree, keeps
//   the status line up to date, and shows short notices.
//
// Provides:
//   initUI            (main.js, once at startup)
//   getUISettings     (input.js, when planting a tree)
//   showSelectedTree  (input.js, when the selection changes)
//   showNotice        (input.js, for messages such as "the garden is full")
// Uses:
//   tree.js:       setBranchAngle, setDepth
//   transforms.js: radians
//   input.js:      MAX_TREES (for the status line)
//   main.js:       garden (selected, trees, time, windStrength)
//   index.html:    the ids angleSlider, depthSlider, windSlider, angleValue,
//                  depthValue, windValue, status and notice
// =============================================================================


/**
 * Called once by main.js at startup. Finds the sliders and listens for their
 * "input" events:
 *   angle slider: setBranchAngle(garden.selected, radians(value)), if a tree is selected
 *   depth slider: setDepth(garden.selected, value, garden.time), if a tree is selected
 *   wind slider:  garden.windStrength = value / 100
 * Every change also updates the readout next to its slider.
 */
function initUI() {
  // TODO (Member 2)
}


/**
 * The settings a new tree is planted with, read from the sliders.
 * Called by input.js (plantTree).
 *
 * @returns {{branchAngle: number, depth: number}} branchAngle is in radians
 */
function getUISettings() {
  // TODO (Member 2): read angleSlider and depthSlider instead of these fixed values
  return { branchAngle: Math.PI / 6, depth: 4 };
}


/**
 * Called by input.js whenever the selection changes. Moves the angle and
 * depth sliders to the selected tree's own values, and updates the status
 * line, for example "Tree 2 selected · 2 of 3 planted". tree may be null.
 */
function showSelectedTree(tree) {
  // TODO (Member 2)
}


/** Shows a short message at the bottom of the screen for a few seconds, then hides it. */
function showNotice(message) {
  // TODO (Member 2)
}
