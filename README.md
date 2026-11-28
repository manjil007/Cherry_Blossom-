# Cherry Blossom: An Interactive 3D Fractal Garden in WebGL

## 1. Project description

Cherry Blossom is an interactive 3D garden that runs in a web browser. It is written in plain JavaScript and WebGL 2, with no libraries and no build step. Users click the ground to plant a cherry blossom tree and watch it grow from a single trunk into a branching canopy whose outermost tips light up with glowing blossoms. Every tree follows the same recursive branching rule, but users shape each one by changing its branch angle and its number of branching levels. The scene opens with one tree already growing, so users can try the controls right away.

The project is inspired by Celestial Blossom, a VR experience co-authored by Prof. Zhu Wang in which hand-drawn strokes become evolving fractal art. Cherry Blossom brings that idea to the browser as a nighttime garden. A click decides where a tree grows, and a few parameters shape its fractal canopy, which shows how changing a simple rule changes a complex 3D form.

### 1.1 Trees and hierarchical modeling

- Every trunk and branch is drawn with one reusable tapered cylinder mesh, and every joint and blossom with one reusable sphere mesh.
- A recursive function gives every branch below the last level two child branches at its tip. Children are shorter and thinner than their parent, and their directions depend on the branch angle. The recursion stops at the selected depth, and each branch at the last level carries a blossom. A tree of depth 5 has 63 branches and 32 blossoms.
- The trunk is the root of the hierarchy. Each branch stores its attachment point and its rotation relative to its parent. Every frame, the program walks the hierarchy and multiplies each parent's world matrix by its child's local matrix, so when a branch rotates at its base, everything attached to it moves too.
- A branch's thickness and current length are applied to its mesh only when it is drawn. They are never passed on to its children.

### 1.2 Growth and wind animation

- `requestAnimationFrame` drives the animation, and all motion is computed from elapsed time.
- Each tree grows in stages: first the trunk, then each pair of child branches once their parent reaches full length. A branch grows from its base toward its tip by lengthening its mesh.
- Blossoms appear at the outermost tips once those branches finish growing, and they gradually brighten.
- Wind is a small time-varying rotation at each branch's base. Its amplitude and phase depend on the branching level, so the trunk barely moves and the outer branches sway the most. Because the rotation is part of each branch's local transform, a swaying branch carries its descendants, which add their own smaller sway. A wind strength slider scales the motion for the whole garden.

### 1.3 Camera and user interaction

- Dragging orbits the camera around the garden.
- A click is turned into a ray in world space with the inverse of the view-projection matrix. If the ray passes through a tree's bounding box, the nearest such tree is selected. Otherwise, the point where the ray meets the ground becomes the spot for a new tree.
- A small movement threshold tells clicks from drags, so orbiting never plants a tree by accident.
- The branch angle slider changes the selected tree's branch rotations in place. The depth slider rebuilds the selected tree's hierarchy at the same ground position, and the tree grows again from the trunk. New trees are planted with the current slider values.

### 1.4 Rendering

- The vertex shader transforms each vertex to clip space and passes its world-space normal to the fragment shader. The fragment shader combines ambient light with one directional "moonlight" diffuse light, so the branches read clearly against the dark sky.
- Blossoms use an emissive color whose brightness rises as they appear.
- A depth buffer makes branches and blossoms hide one another correctly from any camera angle.
- The garden uses a nighttime palette, a softly lit ground and warm cherry blossom colors.

### 1.5 Scope and deployment

- One garden scene, up to three trees, and at most five branching levels per tree.
- The team will publish the project on GitHub Pages. The link should open directly to the running scene.
- Live link pending. After the integrated garden passes the planting, selection, orbit and slider checks in section 9, Member 4 will add the verified URL here.

## 2. Team members and their files

The work is split into four parts of similar size. Each part centers on one graphics technique: hierarchical transforms, time-based animation, ray picking, or lighting and shading. Every file has exactly one owner, and only the owner edits it. README.md is the one shared file (section 6).

| Member | Name | Role | Files |
| --- | --- | --- | --- |
| Member 1 | (add name) | Geometry and hierarchy | transforms.js, models.js, tree.js |
| Member 2 | (add name) | Growth, wind and controls | animation.js, ui.js, main.js, index.html |
| Member 3 | (add name) | Camera and interaction | camera.js, picking.js, input.js |
| Member 4 | [@elliejeanjohn](https://github.com/elliejeanjohn) | Rendering and deployment | shaders.js, renderer.js, README.md |

What each file does (the scripts are listed in the order the page loads them):

| File | Owner | What it does |
| --- | --- | --- |
| index.html | Member 2 | The page: canvas, control panel, notice line, script tags |
| transforms.js | Member 1 | Matrix and vector math used by every file |
| models.js | Member 1 | The tapered cylinder and sphere meshes |
| tree.js | Member 1 | Recursive branch hierarchy and world matrices |
| animation.js | Member 2 | Growth timing, blossom brightness, wind sway |
| camera.js | Member 3 | Orbit camera, view and projection matrices |
| picking.js | Member 3 | Click rays, bounding boxes, ray tests |
| shaders.js | Member 4 | GLSL source of the vertex and fragment shaders |
| renderer.js | Member 4 | WebGL setup, and drawing the scene every frame |
| ui.js | Member 2 | Sliders, readouts, status line, notices |
| input.js | Member 3 | Mouse clicks and drags, planting, selecting |
| main.js | Member 2 | Shared state, startup, animation loop |
| README.md | Member 4 | This guide, later the final project README |

## 3. Responsibilities: high level

### Member 1: Geometry and hierarchy

Builds the trees themselves.

- The matrix and vector helpers that every file uses. Start from your homework versions.
- The two reusable meshes, a tapered cylinder and a sphere, with correct normals.
- Recursive tree generation: two children per branch, shorter and thinner at each level, directions set by the branch angle, and blossom branches at the last level.
- The traversal that computes every branch's world matrix from its parent's.
- Live changes: a new branch angle updates the rotations in place, and a new depth rebuilds the tree.

Done when: trees of depth 1 to 5 appear with the right number of branches (2^(d+1) - 1 for depth d), moving the angle slider reshapes the selected tree smoothly, and rotating a branch moves everything attached to it.

### Member 2: Growth, wind and controls

Makes the trees come alive and connects the controls.

- Growth timing: the trunk first, each pair of children once their parent is full length, and then blossoms that brighten.
- Wind sway at every branch's base, stronger and later for outer branches, scaled by the wind slider.
- The animation loop, the scene clock and the startup sequence in main.js.
- The page and the control panel: three sliders with readouts, the status line and short notices.

Done when: a new tree grows in visible stages with its blossoms brightening last, the wind slider goes from still (0%) to strong sway (100%) with the trunk moving least, and the angle and depth sliders change the selected tree.

### Member 3: Camera and interaction

Lets users look around the garden and act on it.

- The orbit camera: view and projection matrices, drag to orbit, and optionally scroll to zoom.
- Click picking: a pixel becomes a world-space ray through the inverse view-projection matrix, and the ray is tested against bounding boxes and the ground.
- Each tree's bounding box, kept up to date every frame.
- Mouse handling: telling clicks from drags, selecting the nearest tree, planting on the ground, and the three-tree limit.

Done when: dragging orbits smoothly and never plants a tree, clicking a tree selects it (the nearest one when trees overlap), clicking open ground plants a tree exactly there, and a fourth tree is refused with a message.

### Member 4: Rendering and deployment

Draws everything and publishes it.

- The shaders: the vertex shader (clip space and normals) and the fragment shader (ambient, diffuse and emissive light).
- WebGL setup: the context, the shader program, vertex buffers and vertex arrays for the meshes, and the depth test.
- Drawing: each branch with its draw-time scaling, rounded joints, glowing blossoms, the ground, a marker for the selected tree, and the night colors.
- Publishing on GitHub Pages, testing the live site, and turning this guide into the final README.

Done when: the branches are clearly lit from every camera angle, the blossoms glow and brighten, nearer branches hide farther ones, and the GitHub Pages link opens straight to the working scene.

## 4. Responsibilities: code level

The functions below define the interfaces between members' files. Keep the names and parameters, because other members call them. Each file's header comment also lists what the file provides and what it uses.

### Member 1: Geometry and hierarchy

**transforms.js** (loads first, and every file uses it)

- Matrices: `identity()`, `multiply(a, b)`, `translate(x, y, z)`, `scale(x, y, z)`, `rotateX(angle)`, `rotateY(angle)`, `rotateZ(angle)`, `rotateAxis(axis, angle)` and `transformPoint(m, p)`.
- Vectors: `add`, `subtract`, `scaleVector`, `dot`, `cross`, `vectorLength` and `normalize`.
- Numbers: `radians(degrees)` and `clamp(x, min, max)`.
- Matrices are column-major `Float32Array(16)`, and functions return new arrays instead of changing their inputs.

**models.js**

- `createTaperedCylinder(tipRadius, segments)` returns `{ positions, normals, indices }`: radius 1 at y = 0, `tipRadius` at y = 1, open at both ends, with normals tilted to match the taper.
- `createSphere(stacks, slices)` returns a unit sphere in the same format.
- renderer.js calls both once, in `initRenderer`.

**tree.js**

- `createTree(position, depth, branchAngle, time)` returns a new tree. input.js calls it when planting.
- `buildBranches(tree)` creates all the branches, then calls `scheduleGrowth(tree)` from animation.js.
- `createBranch(tree, parent, side)` creates one branch and, below the last level, its two children (side -1 and +1).
- `updateRotation(branch, branchAngle)` sets the rest rotation: bend away from the parent's axis by `side * branchAngle` (about Z), then turn by `twist` about the parent's axis (about Y).
- `setBranchAngle(tree, branchAngle)` updates every rotation in place. ui.js calls it.
- `setDepth(tree, depth, time)` rebuilds the tree, which then regrows from the trunk. ui.js calls it.
- `updateWorldMatrices(tree)` sets `branch.world = parent.world * translate(offset) * sway * rotation` for every branch, parents first. main.js calls it every frame.
- `getBranchTip(branch)` returns the world position of the branch's current tip. picking.js and renderer.js use it.
- tree.js writes the branch fields `level`, `side`, `length`, `radius`, `parent`, `children`, `offset`, `twist`, `rotation` and `world`. It reads `growth` and `sway`, which Member 2 writes.

### Member 2: Growth, wind and controls

**animation.js**

- `scheduleGrowth(tree)` sets each branch's `duration` (its length divided by `GROWTH_SPEED`) and `startTime` (0 for the trunk, otherwise the moment its parent finishes). tree.js calls it after building branches.
- `updateAnimation(tree, time, windStrength)` sets `growth`, `bloom` and `sway` on every branch from the tree's age, `time - tree.plantedAt`. main.js calls it every frame, before `updateWorldMatrices`.
- `windRotation(branch, time, windStrength)` returns the sway rotation in the parent's frame, with an amplitude and phase set by `branch.level`.

**ui.js**

- `initUI()` connects the sliders. The angle slider calls `setBranchAngle` and the depth slider calls `setDepth`, both on `garden.selected`. The wind slider sets `garden.windStrength`. main.js calls it at startup.
- `getUISettings()` returns `{ branchAngle, depth }` from the sliders, with the angle in radians. input.js calls it when planting.
- `showSelectedTree(tree)` moves the sliders to that tree's values and updates the status line. input.js calls it.
- `showNotice(message)` shows a short message for a few seconds. input.js calls it.

**main.js**

- Defines the shared `garden` object and runs the startup sequence (section 5.3).
- `frame(now)` advances `garden.time`, then calls `updateAnimation`, `updateWorldMatrices`, `updateBounds` and `drawScene` (section 5.4). The calls are already in place; Member 2 adds the clock.

**index.html**

- The canvas `#glcanvas`, the control panel with the ids that ui.js uses, the notice line, and the script tags in load order. Member 2 styles the page. Renaming an id or reordering the scripts needs the team's agreement.

### Member 3: Camera and interaction

**camera.js**

- The `camera` object holds `target`, `azimuth`, `elevation`, `distance`, `fov`, `near` and `far`.
- `perspective(fovy, aspect, near, far)` and `lookAt(eye, target, up)` build the projection and view matrices.
- `getCameraPosition()` returns the eye position from the orbit angles and the distance.
- `getViewProjection(aspect)` returns projection * view. renderer.js uses it every frame and input.js on every click, so drawing and picking always use the same camera.
- `orbitCamera(dx, dy)` and `zoomCamera(amount)` change the orbit. input.js calls them.

**picking.js**

- `invertMatrix(m)` is a general 4x4 matrix inverse.
- `screenToRay(x, y, width, height, viewProjection)` returns `{ origin, direction }`. It converts the pixel to normalized device coordinates, unprojects the near (z = -1) and far (z = 1) points, and divides by w.
- `intersectRayBox(ray, box)` returns the distance to where the ray enters the box, or null (slab method).
- `intersectRayGround(ray)` returns the hit point on the plane y = 0, or null for a click on the sky.
- `pickTree(ray, trees)` returns the tree whose box the ray enters first, or null.
- `updateBounds(tree)` rebuilds `tree.bounds = { min, max }` around the trunk's base and the current tips of the grown branches, plus a margin. main.js calls it every frame, after `updateWorldMatrices`.

**input.js**

- `initInput(canvas)` attaches the pointer listeners. A press that moves less than `DRAG_THRESHOLD` pixels is a click; a longer one is a drag that calls `orbitCamera`. main.js calls it at startup.
- `handleClick(x, y)` selects the nearest tree under the cursor, plants a tree on open ground inside `GARDEN_RADIUS`, or shows a notice when the garden is full or the click is outside it.
- `plantTree(position)` creates a tree with `createTree`, using the slider values from `getUISettings()` and `garden.time`. It gives the tree the next free id (1 to 3), adds it to `garden.trees` and selects it. main.js calls it once at startup.
- `selectTree(tree)` sets `garden.selected` and calls `showSelectedTree`.

### Member 4: Rendering and deployment

**shaders.js**

- `VERTEX_SHADER`: inputs `aPosition` (location 0) and `aNormal` (location 1); uniforms `uModel`, `uViewProjection` and `uNormalMatrix`. It passes the world-space normal and position to the fragment shader.
- `FRAGMENT_SHADER`: uniforms `uColor`, `uEmissive`, `uAmbient`, `uLightDirection` and `uLightColor`. The color is `uColor * (uAmbient + uLightColor * max(dot(N, L), 0)) + uEmissive`.

**renderer.js**

- `initRenderer(canvas)` gets the WebGL 2 context, builds the shader program (`compileShader`, `createProgram`), uploads the meshes (`createMesh` with `createTaperedCylinder(TREE_SETTINGS.radiusRatio, 16)`, `createSphere(12, 16)` and `createGroundMesh()`), enables the depth test and sets the light uniforms. main.js calls it at startup.
- `drawScene(garden, camera)` matches the drawing buffer to the canvas size and display density, clears color and depth, and gets the view-projection from `getViewProjection`. It draws the ground, every tree, and a narrow ring just above the selected tree's base. main.js calls it every frame.
- `drawTree(tree)` draws each growing branch's cylinder with `model = branch.world * scale(radius, length * growth, radius)` and places a joint sphere at `getBranchTip(branch)`. Leaves with positive `bloom` get a blossom there. Its radius and emitted light increase with `bloom`, using the tree's color from `BLOSSOM_COLORS[tree.id - 1]`.
- `normalMatrix(model)` returns the inverse transpose of the upper-left 3x3. It is needed because the cylinders are scaled non-uniformly.

**README.md and deployment**

- Publish the site on GitHub Pages (section 9), add the live link to section 1.5, and test the live site.

## 5. How the code connects

### 5.1 Load order

index.html loads the scripts in this order, and main.js must stay last:

1. transforms.js (Member 1)
2. models.js (Member 1)
3. tree.js (Member 1)
4. animation.js (Member 2)
5. camera.js (Member 3)
6. picking.js (Member 3)
7. shaders.js (Member 4)
8. renderer.js (Member 4)
9. ui.js (Member 2)
10. input.js (Member 3)
11. main.js (Member 2)

At their top level, files 1 to 10 only define constants and functions. Their functions call one another later, after every file has loaded. Only main.js calls other files' functions while the page loads, which is why it comes last.

### 5.2 Shared objects

The tree and branch objects are created in tree.js. The comments say which file writes each field; any file may read them.

```js
tree = {
  id,            // 1, 2 or 3, shown in the panel              input.js (Member 3)
  position,      // [x, 0, z], the trunk's base on the ground   tree.js (Member 1)
  depth,         // branching levels above the trunk, 1 to 5    tree.js
  branchAngle,   // radians                                     tree.js
  plantedAt,     // scene time when growth (re)started          tree.js
  root,          // the trunk branch                            tree.js
  branches,      // every branch, parents before children       tree.js
  bounds         // { min, max } box used for picking           picking.js (Member 3)
}

branch = {
  level, side,              // 0 = trunk; -1 or +1 = side of the fork     tree.js (Member 1)
  length, radius,           // full-grown size                            tree.js
  parent, children,         // links in the hierarchy                     tree.js
  offset, twist, rotation,  // local transform, relative to the parent    tree.js
  world,                    // world matrix, every frame, no scaling      tree.js
  startTime, duration,      // growth schedule, in seconds after planting animation.js (Member 2)
  growth,                   // 0 to 1, share of the length that is shown  animation.js
  bloom,                    // 0 to 1, blossom size and brightness        animation.js
  sway                      // wind rotation at the base                  animation.js
}

garden = {                  // defined in main.js (Member 2)
  trees,                    // planted trees; input.js adds them
  selected,                 // the selected tree or null; input.js sets it
  time,                     // scene clock in seconds; main.js advances it
  windStrength              // 0 to 1; ui.js sets it from the wind slider
}

camera = { target, azimuth, elevation, distance, fov, near, far }   // camera.js (Member 3)
```

Until animation.js is written, every branch defaults to growth 1, bloom 1 and no sway, so the other members can draw and click full-grown, motionless trees early.

### 5.3 Startup (main.js)

1. `initRenderer(canvas)`: the WebGL context, shaders and meshes (Member 4)
2. `initUI()`: the slider listeners (Member 2)
3. `initInput(canvas)`: the mouse listeners (Member 3)
4. `plantTree([0, 0, 0])`: the opening tree (Member 3). It calls `createTree` (Member 1), which calls `scheduleGrowth` (Member 2). Then `selectTree` calls `showSelectedTree` (Member 2).
5. `requestAnimationFrame(frame)`: starts the loop

### 5.4 Every frame (main.js)

```js
// advance garden.time by the real time since the last frame
for (const tree of garden.trees) {
  updateAnimation(tree, garden.time, garden.windStrength);  // Member 2: growth, bloom, sway
  updateWorldMatrices(tree);                                // Member 1: parent x local, no scaling
  updateBounds(tree);                                       // Member 3: box for picking
}
drawScene(garden, camera);                                  // Member 4
```

The order matters. The world matrices need this frame's sway, and the bounding boxes and the drawing need this frame's world matrices.

### 5.5 A click (input.js)

A press that ends without becoming a drag calls `handleClick(x, y)`:

1. `screenToRay(x, y, width, height, getViewProjection(width / height))` makes the ray (Member 3, using camera.js).
2. `pickTree(ray, garden.trees)` looks for the nearest tree whose box the ray enters. If it finds one, `selectTree(tree)` selects it and `showSelectedTree(tree)` (Member 2) updates the panel.
3. Otherwise, if three trees are already planted, `showNotice(...)` (Member 2) says the garden is full.
4. Otherwise, `intersectRayGround(ray)` finds the spot. Inside the garden, `plantTree(point)` calls `createTree(point, depth, branchAngle, garden.time)` (Member 1) with the values from `getUISettings()` (Member 2). Outside it, `showNotice(...)` asks for a click inside the garden.

### 5.6 Moving a slider (ui.js)

- Branch angle: `setBranchAngle(garden.selected, radians(value))` (Member 1) changes the rotations in place, and growth continues.
- Depth: `setDepth(garden.selected, value, garden.time)` (Member 1) rebuilds the branches, `scheduleGrowth` (Member 2) runs again, and the tree regrows from the trunk.
- Wind strength: `garden.windStrength = value / 100`, which `updateAnimation` uses on the next frame.
- New trees always use the current angle and depth, through `getUISettings()`.

### 5.7 Who calls what

| Function | Defined in | Called by |
| --- | --- | --- |
| createTree | tree.js (Member 1) | input.js: plantTree |
| setBranchAngle, setDepth | tree.js (Member 1) | ui.js: slider listeners |
| updateWorldMatrices | tree.js (Member 1) | main.js: frame |
| getBranchTip | tree.js (Member 1) | picking.js, renderer.js |
| createTaperedCylinder, createSphere | models.js (Member 1) | renderer.js: initRenderer |
| scheduleGrowth | animation.js (Member 2) | tree.js: buildBranches |
| updateAnimation | animation.js (Member 2) | main.js: frame |
| initUI | ui.js (Member 2) | main.js: startup |
| getUISettings, showSelectedTree, showNotice | ui.js (Member 2) | input.js |
| getViewProjection | camera.js (Member 3) | renderer.js, input.js |
| orbitCamera, zoomCamera | camera.js (Member 3) | input.js |
| screenToRay, pickTree, intersectRayGround | picking.js (Member 3) | input.js: handleClick |
| updateBounds | picking.js (Member 3) | main.js: frame |
| initInput, plantTree | input.js (Member 3) | main.js: startup |
| initRenderer, drawScene | renderer.js (Member 4) | main.js |
| VERTEX_SHADER, FRAGMENT_SHADER | shaders.js (Member 4) | renderer.js: initRenderer |

## 6. Team rules and conventions

- **Edit only your own files.** If you need a change in someone else's file, ask its owner. README.md is shared: each member keeps their own parts of sections 3 and 4 accurate, and Member 4 owns the rest.
- **Keep the shared names.** Other members call the functions and read the fields listed in this guide. To change one, agree with the team first, then update this README and the file headers.
- **Avoid name clashes.** Plain script tags share one set of top-level names across all files, so if two files both define a helper called `normalize`, one silently replaces the other. Shared math belongs in transforms.js. Keep your file's state in its own object (`garden`, `camera`, `inputState`, `renderer`), and give private helpers names that clearly belong to your file.
- **Don't call other files while loading.** Only main.js calls other files' functions at its top level (section 5.1).
- **Math conventions.** Matrices are column-major `Float32Array(16)`, points and vectors are `[x, y, z]` arrays, angles are in radians, and functions return new arrays instead of changing their inputs.
- **Keep the page working.** After every merge, the page should load with no errors in the browser console.

## 7. Milestones

1. **A trunk on screen.** Everyone has a piece: the math, the cylinder and a trunk-only tree (Member 1), the clock in the loop (Member 2), a fixed camera with `perspective` and `lookAt` (Member 3), and the shader program and `drawScene` (Member 4).
2. **One tree that grows, sways and responds to the sliders.** This is the first milestone in our proposal.
3. **Planting, selecting and orbiting** with up to three trees.
4. **Finishing:** cherry blossom colors, lighting polish, deployment to GitHub Pages, testing the live site, and the final README.

## 8. Running the project and working with Git

**Run it.** Open `index.html` in a browser with WebGL 2 enabled. No server or build step is needed. The page should load with the control panel and a clean browser console. A visible opening tree requires the geometry, transforms, camera and planting code to be integrated. The animation and UI code drive its growth and the sliders.

**Work on your part.** Use your own branch and your own GitHub account, so the repository's Insights → Contributors page shows everyone's work.

```
git clone <repository URL>
cd <repository folder>
git checkout -b member1-hierarchy        # your own branch name
# ...edit your files...
git add tree.js
git commit -m "Build the recursive branch hierarchy"
git push -u origin member1-hierarchy
```

Then open a pull request on GitHub. Another member reviews it before it is merged into main. Before starting new work, bring your branch up to date:

```
git checkout main
git pull
git checkout member1-hierarchy
git merge main
```

## 9. Deployment (Member 4)

1. On GitHub, open the repository's **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, select the **main** branch and the **/ (root)** folder, and save.
3. Wait for the Pages deployment to succeed. Open the URL shown in **Settings → Pages** in a fresh browser tab.
4. Watch the opening tree grow and its blossoms brighten. Plant two more trees, click to switch the selection ring, and confirm a fourth planting shows the limit notice. Orbit across overlapping branches to check lighting and depth. Dragging should leave the tree count unchanged.
5. Check each slider. Branch angle reshapes the selected tree, depth regrows it in place, and wind ranges from still to visible sway. Resize the window, pick a tree again, and check the console for errors. Add the verified URL to section 1.5 through a reviewed pull request.

On a free GitHub account, Pages needs a public repository.
