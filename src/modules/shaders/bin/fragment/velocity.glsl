uniform float opacity;

varying vec4 clipPositionCurrent;
varying vec4 clipPositionPrevious;

void main() {
    // Calculate velocity vector in clip space
    vec2 a = (clipPositionCurrent.xy / clipPositionCurrent.w) * 0.5 + 0.5;
    vec2 b = (clipPositionPrevious.xy / clipPositionPrevious.w) * 0.5 + 0.5;

    vec2 v1 = a;
    vec2 v2 = b - a;

    gl_FragColor = vec4(v1.x, v1.y, v2.x, v2.y);
}