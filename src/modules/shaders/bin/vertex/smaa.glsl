uniform vec2 resolution;

varying vec2 vUv;
varying vec4 vOffset[3];

void SMAANeighborhoodBlending(vec2 texCoord, out vec4 offset[3]) {
    offset[0] = vec4(texCoord.xyxy + resolution.xyxy * vec4(-1.0, 0.0, 0.0, -1.0));
    offset[1] = vec4(texCoord.xyxy + resolution.xyxy * vec4(1.0, 0.0, 0.0, 1.0));
    offset[2] = vec4(texCoord.xyxy + resolution.xyxy * vec4(-2.0, 0.0, 0.0, -2.0));
}

void main() {
    vUv = uv;
    SMAANeighborhoodBlending(vUv, vOffset);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}