uniform float opacity;
uniform sampler2D tDiffuse;

varying vec2 vUv;

#include <packing>

void main() {
    float depth = unpackRGBAToDepth(texture2D(tDiffuse, vUv));
    gl_FragColor = vec4(vec3(depth), opacity);
}