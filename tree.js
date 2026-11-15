// =============================================================================
// tree.js
// Owner: Member 1 (Geometry and hierarchy)
// -----------------------------------------------------------------------------
// What this file does:
//   The tree model. It builds each tree's branch hierarchy recursively, keeps
//   every branch's LOCAL transform (its attachment point and rotation relative
//   to its parent), and every frame walks the hierarchy from the trunk outward
//   to compute each branch's WORLD matrix:
//
//       branch.world = parent.world * translate(offset) * sway * rotation
//
//   The trunk is the root, and its parent matrix is the identity. No mesh
//   scaling goes into world matrices: renderer.js applies each cylinder's
//   thickness and length only when it draws it, so children inherit their
//   parent's motion but not its size.
//
//   The tree and branch objects created here are shared with the whole team
//   (README section 5.2). Member 2 writes their animation fields.
//
// Provides:
//   createTree           (input.js, when planting)
//   setBranchAngle       (ui.js, when the angle slider moves)
//   setDepth             (ui.js, when the depth slider moves)
//   updateWorldMatrices  (main.js, every frame)
//   getBranchTip         (picking.js and renderer.js)
//   MAX_DEPTH, TREE_SETTINGS
// Uses:
//   transforms.js: identity, multiply, translate, rotateY, rotateZ, transformPoint
//   animation.js:  scheduleGrowth (after the branches are built)
// =============================================================================

const MAX_DEPTH = 5;   // most branching levels a tree may have (the depth slider's maximum)

// Starting values. Tune them freely.
const TREE_SETTINGS = {
  trunkLength: 1.6,     // full-grown trunk length, in world units
  trunkRadius: 0.11,    // radius at the base of the trunk
  lengthRatio: 0.74,    // child length / parent length
  radiusRatio: 0.7,     // child radius / parent radius; also the cylinder's taper,
                        // so a child's base is as wide as its parent's tip
  twist: Math.PI / 2    // each fork turns about its parent's axis, so the tree fills 3D space
};


/**
 * Creates a tree whose trunk stands at `position`, and builds its branches.
 * Called by input.js (plantTree).
 *
 * @param {number[]} position     [x, 0, z], the trunk's base on the ground
 * @param {number}   depth        branching levels above the trunk, 1 to MAX_DEPTH
 *                                (depth d gives 2^(d+1) - 1 branches and 2^d blossoms)
 * @param {number}   branchAngle  angle between a child and its parent's axis, in radians
 * @param {number}   time         the current scene time (garden.time); growth starts now
 * @returns {object} the tree
 */
function createTree(position, depth, branchAngle, time) {
  const tree = {
    id: 0,               // 1, 2 or 3; set by input.js when planted, shown in the panel
    position,            // [x, 0, z]
    depth,               // branching levels above the trunk
    branchAngle,         // radians
    plantedAt: time,     // scene time when growth (re)started; animation.js measures age from here
    root: null,          // the trunk branch
    branches: [],        // every branch, parents before children; renderer.js and picking.js loop over it
    bounds: null         // { min: [x, y, z], max: [x, y, z] }; picking.js updates it every frame
  };
  buildBranches(tree);
  return tree;
}


/**
 * (Re)builds the whole hierarchy for the tree's current depth and branch
 * angle, then asks animation.js to schedule the growth.
 * Used by createTree and setDepth.
 */
function buildBranches(tree) {
  tree.branches = [];
  tree.root = createBranch(tree, null, 0);
  scheduleGrowth(tree);   // Member 2 (animation.js): startTime and duration of every branch
}


/**
 * Creates one branch and, while its level is below tree.depth, its two
 * children (by calling itself). Returns the branch.
 *
 * @param {object}      tree    the tree it belongs to
 * @param {object|null} parent  the parent branch, or null for the trunk
 * @param {number}      side    -1 or +1: which way it bends away from its parent (0 for the trunk)
 */
function createBranch(tree, parent, side) {
  const level = parent ? parent.level + 1 : 0;

  const branch = {
    // ---- Member 1: structure and local transform ----
    level,                                 // 0 = trunk, 1 = first fork, ...
    side,                                  // -1 or +1 for the two children of a fork, 0 for the trunk
    length: TREE_SETTINGS.trunkLength,     // full-grown length (TODO: shorter at each level)
    radius: TREE_SETTINGS.trunkRadius,     // radius at its base (TODO: thinner at each level)
    parent,                                // the parent branch, or null for the trunk
    children: [],                          // two branches, or none at the last level
    offset: parent ? [0, parent.length, 0] : tree.position,
                                           // attachment point in the parent's frame: the parent's tip
                                           // (the trunk attaches to the ground at the tree's position)
    twist: 0,                              // turn about the parent's axis (TODO: about TREE_SETTINGS.twist)
    rotation: identity(),                  // rest rotation relative to the parent; see updateRotation
    world: identity(),                     // world matrix (rotation and translation, no scaling);
                                           // see updateWorldMatrices

    // ---- Member 2: animation state. These defaults mean "fully grown, no wind",
    //      so trees can be drawn and clicked before animation.js is finished. ----
    startTime: 0,                          // seconds after planting when it starts growing
    duration: 1,                           // seconds it takes to reach full length
    growth: 1,                             // 0 to 1, the share of its length that is shown
    bloom: 1,                              // 0 to 1, blossom size and brightness (branches without children)
    sway: identity()                       // wind rotation at its base, in the parent's frame
  };
  tree.branches.push(branch);

  // TODO (Member 1):
  //   1. Make the branch shorter and thinner than its parent, using lengthRatio
  //      and radiusRatio. A little random variation makes every tree look
  //      different (optional).
  //   2. Give it a twist, then call updateRotation(branch, tree.branchAngle).
  //   3. If its level is below tree.depth, create its two children by calling
  //      createBranch again with side -1 and side +1, and store them in
  //      branch.children.

  return branch;
}


/**
 * Sets branch.rotation, the branch's rest rotation relative to its parent:
 * bend away from the parent's axis by side * branchAngle (a rotation about the
 * Z axis), then turn the bent branch about the parent's axis by its twist
 * (a rotation about the Y axis).
 * Used by createBranch and setBranchAngle.
 */
function updateRotation(branch, branchAngle) {
  // TODO (Member 1)
}


/**
 * Changes an existing tree's branch angle by updating every branch's rest
 * rotation in place. Growth is not restarted.
 * Called by ui.js when the angle slider moves.
 */
function setBranchAngle(tree, branchAngle) {
  // TODO (Member 1): store the new angle on the tree, then update every branch's rotation.
}


/**
 * Changes an existing tree's depth: rebuilds its hierarchy at the same ground
 * position, and the tree grows again from the trunk.
 * Called by ui.js when the depth slider moves.
 *
 * @param {number} time  the current scene time (garden.time)
 */
function setDepth(tree, depth, time) {
  // TODO (Member 1): store the depth, set tree.plantedAt = time, then call buildBranches(tree).
}


/**
 * The hierarchical traversal. Called every frame by main.js, after
 * animation.js has updated growth and sway, and before picking.js and
 * renderer.js read the world matrices.
 * For every branch, parents before children:
 *     branch.world = parent.world * translate(offset) * sway * rotation
 * with the identity matrix as the trunk's parent.
 * Branches with growth 0 have not sprouted yet and can be skipped.
 */
function updateWorldMatrices(tree) {
  // TODO (Member 1)
}


/**
 * Returns the world position of a branch's tip at its current growth, which
 * is the point (0, length * growth, 0) in the branch's own frame.
 * Used by picking.js (bounding boxes) and renderer.js (where blossoms go).
 *
 * @returns {number[]} [x, y, z]
 */
function getBranchTip(branch) {
  // TODO (Member 1)
  return [0, 0, 0];
}
