// =============================================================================
// animation.js
// Owner: Member 2 (Growth, wind and controls)
// -----------------------------------------------------------------------------
// What this file does:
//   Everything that changes over time: when each branch starts growing, how
//   far it has grown, when its blossom appears and how bright it is, and the
//   wind sway. All of it is computed from elapsed time.
//   This file only writes the animation fields of each branch (startTime,
//   duration, growth, bloom, sway). tree.js turns them into world matrices,
//   and renderer.js draws the result.
//
// Provides:
//   scheduleGrowth   (tree.js, whenever a tree's branches are built)
//   updateAnimation  (main.js, every frame, before updateWorldMatrices)
// Uses:
//   transforms.js: identity, rotateX, rotateZ or rotateAxis, clamp
//   the tree and branch objects from tree.js (README section 5.2)
// =============================================================================

// Starting values. Tune them freely.
const GROWTH_SPEED = 1.0;      // branch length grown per second, in world units
const BLOOM_TIME = 2.0;        // seconds a blossom takes to reach full brightness

const WIND = {
  frequency: 1.5,              // how fast branches sway, in radians per second
  baseAmplitude: 0.014,        // trunk sway at full wind strength, in radians (about 0.8 degrees)
  amplitudePerLevel: 0.021,    // extra sway for each branching level (about 1.2 degrees)
  phasePerLevel: 0.5           // delay for each level, so the sway ripples outward
};


/**
 * Sets the growth schedule of every branch in the tree:
 *   duration  = the branch's length / GROWTH_SPEED
 *   startTime = 0 for the trunk; otherwise the moment its parent reaches full
 *               length (parent.startTime + parent.duration)
 * Called by tree.js every time a tree's branches are built or rebuilt.
 * tree.branches lists parents before children, so one pass in order works.
 */
function scheduleGrowth(tree) {
  // TODO (Member 2)
}


/**
 * Updates the animation fields of every branch for scene time `time`.
 * Called every frame by main.js, before tree.js's updateWorldMatrices.
 *   age    = time - tree.plantedAt
 *   growth = how much of its duration has passed since its startTime, from 0 to 1
 *   bloom  = for branches without children: rises from 0 to 1 over BLOOM_TIME
 *            once the branch has finished growing
 *   sway   = windRotation(branch, time, windStrength)
 *
 * @param {number} time          scene time in seconds (garden.time)
 * @param {number} windStrength  0 to 1, from the wind slider (garden.windStrength)
 */
function updateAnimation(tree, time, windStrength) {
  // TODO (Member 2)
}


/**
 * The wind: a small, time-varying rotation about the branch's base, in its
 * parent's frame. The amplitude grows with branch.level, so the trunk barely
 * moves and the outer twigs sway most, and the phase is delayed by level.
 * windStrength scales the amplitude (0 means no wind). Because the rotation is
 * part of the branch's local transform, everything attached to the branch
 * moves with it.
 * A simple version rotates about X and Z by small angles. For one consistent
 * wind direction across the garden, turn a world-space axis into the parent's
 * frame using the parent's world matrix from the previous frame.
 *
 * @returns {Float32Array} a rotation matrix
 */
function windRotation(branch, time, windStrength) {
  // TODO (Member 2)
  return identity();
}
