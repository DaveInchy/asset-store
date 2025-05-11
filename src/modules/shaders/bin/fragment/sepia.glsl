uniform sampler2D tDiffuse;
uniform float amount;

varying vec2 vUv;

void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec3 sepia = vec3(
        dot(color.rgb, vec3(0.393, 0.769, 0.189)),
        dot(color.rgb, vec3(0.349, 0.686, 0.168)),
        dot(color.rgb, vec3(0.272, 0.534, 0.131))
    );
    gl_FragColor = vec4(mix(color.rgb, sepia, amount), color.a);
}