// =============================================================================
// shaders.js
// Owner: Member 4 (Rendering and deployment)
// -----------------------------------------------------------------------------
// What this file does:
//   Holds the GLSL ES 3.00 source code of the shader programs as JavaScript
//   strings. renderer.js compiles and links them. The attribute and uniform
//   names below are the ones renderer.js looks up, so keep the two files in
//   sync.
//
// Vertex shader
//   inputs:   aPosition (vec3, attribute location 0)
//             aNormal   (vec3, attribute location 1)
//   uniforms: uModel (mat4)           object space -> world space, including the mesh scaling
//             uViewProjection (mat4)  world space -> clip space, from camera.js
//             uNormalMatrix (mat3)    inverse transpose of uModel's upper-left 3x3
//   outputs:  vNormal                 world-space normal, for lighting
//             vPosition               world-space position (optional, e.g. to fade the ground)
//   gl_Position = uViewProjection * uModel * vec4(aPosition, 1.0)
//
// Fragment shader
//   uniforms: uColor (vec3)           base color of the surface
//             uEmissive (vec3)        light the surface gives off by itself:
//                                     0 for branches, blossom color * bloom for blossoms
//             uAmbient (vec3)         ambient light color
//             uLightDirection (vec3)  unit vector pointing toward the light (the moon)
//             uLightColor (vec3)      color of the directional light
//   color = uColor * (uAmbient + uLightColor * max(dot(N, L), 0.0)) + uEmissive
//
// Provides: VERTEX_SHADER, FRAGMENT_SHADER (to renderer.js)
// Uses:     nothing.
// =============================================================================

const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uViewProjection;
uniform mat3 uNormalMatrix;

out vec3 vPosition;
out vec3 vNormal;

void main() {
  vec4 worldPosition = uModel * vec4(aPosition, 1.0);
  vPosition = worldPosition.xyz;
  vNormal = normalize(uNormalMatrix * aNormal);
  gl_Position = uViewProjection * worldPosition;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec3 vPosition;
in vec3 vNormal;

uniform vec3 uColor;
uniform vec3 uEmissive;
uniform vec3 uAmbient;
uniform vec3 uLightDirection;
uniform vec3 uLightColor;

out vec4 fragColor;

void main() {
  float diffuse = max(dot(normalize(vNormal), uLightDirection), 0.0);
  vec3 litColor = uColor * (uAmbient + uLightColor * diffuse);
  fragColor = vec4(litColor + uEmissive, 1.0);
}
`;
