varying vec3 vViewPosition;
varying vec4 clipPositionCurrent;
varying vec4 clipPositionPrevious;

uniform mat4 previousProjectionViewMatrix;
uniform mat4 currentProjectionViewMatrix;
uniform mat4 modelMatrixPrev;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;

    vec4 worldPositionCurrent = modelMatrix * vec4(position, 1.0);
    vec4 worldPositionPrevious = modelMatrixPrev * vec4(position, 1.0);

    clipPositionCurrent = currentProjectionViewMatrix * worldPositionCurrent;
    clipPositionPrevious = previousProjectionViewMatrix * worldPositionPrevious;

    gl_Position = projectionMatrix * mvPosition;
}