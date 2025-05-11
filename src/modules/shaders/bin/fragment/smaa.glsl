#define SMAA_THRESHOLD 0.1
#define SMAA_LOCAL_CONTRAST_ADAPTATION_FACTOR 2.0

uniform sampler2D tDiffuse;
uniform vec2 resolution;

varying vec2 vUv;
varying vec4 vOffset[3];

float SMAAColorEdgeDetectionPS(vec2 texcoord, vec4 offset[3], sampler2D colorTex) {
    vec2 threshold = vec2(SMAA_THRESHOLD, SMAA_THRESHOLD);

    // Calculate color deltas
    vec4 delta;
    vec3 C = texture2D(colorTex, texcoord).rgb;

    vec3 Cleft = texture2D(colorTex, offset[0].xy).rgb;
    vec3 t = abs(C - Cleft);
    delta.x = max(max(t.r, t.g), t.b);

    vec3 Ctop = texture2D(colorTex, offset[0].zw).rgb;
    t = abs(C - Ctop);
    delta.y = max(max(t.r, t.g), t.b);

    // Local contrast adaptation
    vec2 edges = step(threshold, delta.xy);

    if (dot(edges, vec2(1.0, 1.0)) == 0.0)
        discard;

    return edges.x + 2.0 * edges.y;
}

void main() {
    vec4 offset[3];
    offset[0] = vOffset[0];
    offset[1] = vOffset[1];
    offset[2] = vOffset[2];

    float edge = SMAAColorEdgeDetectionPS(vUv, offset, tDiffuse);
    gl_FragColor = vec4(edge, 0.0, 0.0, 1.0);
}