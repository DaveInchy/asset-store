uniform sampler2D tDiffuse;
uniform float gamma;

varying vec2 vUv;

void main() {
    vec4 texture = texture2D(tDiffuse, vUv);
    vec3 color = texture.rgb;

    color = pow(color, vec3(1.0 / gamma));

    gl_FragColor = vec4(color, texture.a);
}