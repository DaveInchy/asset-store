uniform sampler2D tDiffuse;
uniform vec2 center;
uniform float angle;
uniform float scale;
uniform vec2 tSize;

varying vec2 vUv;

float pattern() {
    float s = sin(angle), c = cos(angle);
    vec2 tex = vUv * tSize - center;
    vec2 point = vec2(
        c * tex.x - s * tex.y,
        s * tex.x + c * tex.y
    ) * scale;
    return (sin(point.x) * sin(point.y)) * 4.0;
}

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec3 cmy = 1.0 - color.rgb;
    float k = min(cmy.x, min(cmy.y, cmy.z));
    cmy = (cmy - k) / (1.0 - k);
    cmy = clamp(cmy, 0.0, 1.0);
    float c = cmy.x;
    float m = cmy.y;
    float y = cmy.z;

    float pat = pattern();

    vec4 cmyk = vec4(0.0);
    cmyk.r = c * (1.0 - pat);
    cmyk.g = m * (1.0 - pat);
    cmyk.b = y * (1.0 - pat);
    cmyk.a = 1.0 - k;

    gl_FragColor = cmyk;
}