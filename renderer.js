// =============================================================================
// renderer.js
// Owner: Member 4 (Rendering and deployment)
// -----------------------------------------------------------------------------
// What this file does:
//   All WebGL drawing. initRenderer sets up the context, the shader program
//   and the meshes once. drawScene then runs every frame: it clears the screen
//   and draws the ground and every tree, with lighting and glowing blossoms.
//   Each branch is drawn with the shared cylinder mesh using
//       model = branch.world * scale(radius, length * growth, radius)
//   The scaling shapes only this cylinder. The branch's children were placed
//   with branch.world alone, so they never inherit it.
//
// Provides:
//   initRenderer  (main.js, once at startup)
//   drawScene     (main.js, every frame)
// Uses:
//   transforms.js: multiply, translate, scale, normalize, scaleVector
//   models.js:     createTaperedCylinder, createSphere
//   shaders.js:    VERTEX_SHADER, FRAGMENT_SHADER
//   camera.js:     getViewProjection (and getCameraPosition if a shader needs it)
//   tree.js:       TREE_SETTINGS, getBranchTip, and the branch fields world,
//                  length, radius, growth, bloom and children
// =============================================================================

// Starting colors for a night garden with warm cherry blossoms. Tune them freely.
const BACKGROUND = [0.02, 0.02, 0.05];
const AMBIENT = [0.28, 0.3, 0.42];
const LIGHT_DIRECTION = [0.7, 0.55, 0.45];   // toward the moon; normalize it before use
const LIGHT_COLOR = [0.85, 0.9, 1.0];
const BARK_COLOR = [0.36, 0.26, 0.24];
const GROUND_COLOR = [0.07, 0.1, 0.1];
const BLOSSOM_COLORS = [                     // one per tree, indexed by tree.id - 1
  [1.0, 0.55, 0.75],                         // pale pink
  [1.0, 0.4, 0.55],                          // rose
  [1.0, 0.7, 0.6]                            // peach
];
const GROUND_RADIUS = 20;                    // radius of the ground disk
const RENDERER_NO_EMISSION = [0, 0, 0];
const RENDERER_RING_COLOR = [0.65, 0.42, 0.32];

// This file's own state, filled in by initRenderer
const renderer = {
  canvas: null,
  gl: null,          // the WebGL 2 context
  program: null,     // the linked shader program
  uniforms: {},      // uniform locations, e.g. renderer.uniforms.uModel
  meshes: {},        // cylinder, sphere, ground and selection ring, each { vao, count }
  groundModel: null
};


/**
 * One-time setup, called by main.js at startup:
 *   1. get the WebGL 2 context from the canvas (show a message if the browser
 *      has none)
 *   2. compile and link VERTEX_SHADER and FRAGMENT_SHADER, and look up the
 *      uniform locations
 *   3. upload the meshes: createTaperedCylinder(TREE_SETTINGS.radiusRatio, 16),
 *      createSphere(12, 16) and createGroundMesh()
 *   4. enable the depth test (and back-face culling), and set the clear color
 *      and the light uniforms that never change
 */
function initRenderer(canvas) {
  renderer.canvas = canvas;
  const gl = canvas.getContext("webgl2");
  renderer.gl = gl;
  if (!gl) {
    document.getElementById("notice").textContent = "This garden needs a browser with WebGL 2 enabled.";
    return;
  }

  const program = createProgram(VERTEX_SHADER, FRAGMENT_SHADER);
  renderer.program = program;
  gl.useProgram(program);
  for (const name of ["uModel", "uViewProjection", "uNormalMatrix", "uColor",
                      "uEmissive", "uAmbient", "uLightDirection", "uLightColor"]) {
    renderer.uniforms[name] = gl.getUniformLocation(program, name);
  }

  renderer.meshes.cylinder = createMesh(createTaperedCylinder(TREE_SETTINGS.radiusRatio, 16));
  renderer.meshes.sphere = createMesh(createSphere(12, 16));
  renderer.meshes.ground = createMesh(createGroundMesh());
  renderer.meshes.ring = createMesh(createRendererDisk(0.88));
  renderer.groundModel = scale(GROUND_RADIUS, 1, GROUND_RADIUS);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(...BACKGROUND, 1);
  gl.uniform3fv(renderer.uniforms.uAmbient, AMBIENT);
  gl.uniform3fv(renderer.uniforms.uLightDirection, normalize(LIGHT_DIRECTION));
  gl.uniform3fv(renderer.uniforms.uLightColor, LIGHT_COLOR);
}


/** Compiles one shader. Throws an error with the shader's info log if it fails. */
function compileShader(type, source) {
  const gl = renderer.gl;
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    const stage = type === gl.VERTEX_SHADER ? "Vertex" : "Fragment";
    throw new Error(stage + " shader compilation failed: " + log);
  }
  return shader;
}


/**
 * Links a program from a vertex and a fragment shader source, with aPosition
 * bound to attribute location 0 and aNormal to location 1.
 */
function createProgram(vertexSource, fragmentSource) {
  const gl = renderer.gl;
  const program = gl.createProgram();
  try {
    for (const [type, source] of [[gl.VERTEX_SHADER, vertexSource], [gl.FRAGMENT_SHADER, fragmentSource]]) {
      const shader = compileShader(type, source);
      gl.attachShader(program, shader);
      gl.deleteShader(shader); // The program retains the attached shader.
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error("Shader program link failed: " + gl.getProgramInfoLog(program));
    }
    return program;
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  }
}


/**
 * Uploads mesh data from models.js ({ positions, normals, indices }) into a
 * vertex array object. Returns { vao, count }, where count is the number of
 * indices.
 */
function createMesh(meshData) {
  const gl = renderer.gl;
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  for (const [location, data] of [[0, meshData.positions], [1, meshData.normals]]) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(location);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, meshData.indices, gl.STATIC_DRAW);
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return { vao, count: meshData.indices.length };
}


/**
 * A flat disk of radius 1 in the XZ plane, facing up, for the ground. It is
 * scaled by GROUND_RADIUS when drawn. Same format as the meshes in models.js.
 */
function createGroundMesh() {
  return createRendererDisk(0);
}

/** A unit disk, or an annulus when the selection marker needs a hole. */
function createRendererDisk(innerRadius) {
  const segments = 64;
  const positions = [];
  const normals = [];
  const indices = [];
  const radii = innerRadius > 0 ? [1, innerRadius] : [1];
  for (const radius of radii) {
    for (let i = 0; i < segments; i++) {
      const angle = 2 * Math.PI * i / segments;
      positions.push(radius * Math.cos(angle), 0, radius * Math.sin(angle));
      normals.push(0, 1, 0);
    }
  }
  if (innerRadius === 0) {
    positions.push(0, 0, 0);
    normals.push(0, 1, 0);
  }
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    const inner = innerRadius > 0 ? segments + i : segments;
    indices.push(inner, next, i);
    if (innerRadius > 0) indices.push(inner, segments + next, next);
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices)
  };
}


/**
 * Normal matrix: the inverse transpose of the upper-left 3x3 of `model`, as a
 * Float32Array(9) for gl.uniformMatrix3fv. It is needed because branches are
 * scaled differently along their length than across it.
 */
function normalMatrix(model) {
  // The cofactor matrix is the inverse transpose times the determinant.
  const [a, d, g, , b, e, h, , c, f, i] = model; // rows: [a b c], [d e f], [g h i]
  const first = e * i - f * h;
  const second = c * h - b * i;
  const third = b * f - c * e;
  const determinant = a * first + d * second + g * third;
  if (determinant === 0) return new Float32Array(9);
  const inverseDet = 1 / determinant;
  return new Float32Array([
    first * inverseDet, second * inverseDet, third * inverseDet,
    (f * g - d * i) * inverseDet, (a * i - c * g) * inverseDet, (c * d - a * f) * inverseDet,
    (d * h - e * g) * inverseDet, (b * g - a * h) * inverseDet, (a * e - b * d) * inverseDet
  ]);
}


/** Draws one mesh with a model matrix, a base color and an emissive (glow) color. */
function drawMesh(mesh, model, color, emissive = RENDERER_NO_EMISSION) {
  if (mesh.count === 0) return;
  const { gl, uniforms } = renderer;
  gl.uniformMatrix4fv(uniforms.uModel, false, model);
  gl.uniformMatrix3fv(uniforms.uNormalMatrix, false, normalMatrix(model));
  gl.uniform3fv(uniforms.uColor, color);
  gl.uniform3fv(uniforms.uEmissive, emissive);
  gl.bindVertexArray(mesh.vao);
  gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
}


/**
 * Draws one tree. For every branch with growth > 0:
 *   - its cylinder, scaled at draw time as described at the top of this file
 *   - a small sphere at its tip that rounds off the joint with its children
 * For every branch without children whose bloom is above 0:
 *   - a blossom sphere at its tip, colored BLOSSOM_COLORS[tree.id - 1], with
 *     an emissive brightness of bloom times that color
 */
function drawTree(tree) {
  const { cylinder, sphere } = renderer.meshes;
  const blossomColor = BLOSSOM_COLORS[tree.id - 1];
  for (const branch of tree.branches) {
    if (branch.growth <= 0) continue;
    const branchScale = scale(branch.radius, branch.length * branch.growth, branch.radius);
    drawMesh(cylinder, multiply(branch.world, branchScale), BARK_COLOR);

    const tip = translate(...getBranchTip(branch));
    const jointRadius = branch.radius * TREE_SETTINGS.radiusRatio;
    drawMesh(sphere, multiply(tip, scale(jointRadius, jointRadius, jointRadius)), BARK_COLOR);
    if (branch.children.length === 0 && branch.bloom > 0) {
      const radius = Math.max(0.075, 2 * branch.radius) * branch.bloom;
      const model = multiply(tip, scale(radius, radius, radius));
      drawMesh(sphere, model, blossomColor, scaleVector(blossomColor, branch.bloom));
    }
  }
}


/** Matches the canvas's drawing buffer to its size on screen, and updates the viewport. */
function resizeCanvas() {
  const { canvas, gl } = renderer;
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
  const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
}


/**
 * Draws one frame. Called by main.js after every tree has been updated;
 * garden and camera are the shared objects from main.js and camera.js.
 *   1. resizeCanvas(), then clear the color and depth buffers
 *   2. viewProjection = getViewProjection(width / height)
 *   3. draw the ground, then drawTree() for each tree in garden.trees
 *   4. mark garden.selected, for example with a ring on the ground
 */
function drawScene(garden, camera) {
  const { gl, uniforms, meshes } = renderer;
  if (!gl) return;
  resizeCanvas();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const viewProjection = getViewProjection(gl.drawingBufferWidth / gl.drawingBufferHeight);
  gl.uniformMatrix4fv(uniforms.uViewProjection, false, viewProjection);
  drawMesh(meshes.ground, renderer.groundModel, GROUND_COLOR);
  for (const tree of garden.trees) drawTree(tree);
  if (garden.selected) {
    const [x, y, z] = garden.selected.position;
    const marker = multiply(translate(x, y + 0.012, z), scale(0.45, 1, 0.45));
    drawMesh(meshes.ring, marker, RENDERER_RING_COLOR);
  }
  gl.bindVertexArray(null);
}
