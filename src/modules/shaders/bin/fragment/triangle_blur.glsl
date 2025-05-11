uniform sampler2D texture;
uniform vec2 delta;

varying vec2 vUv;

void main() {
    vec4 texel = texture2D(texture, vUv);
    vec3 color = texel.rgb;

    // Sample neighboring pixels in a triangle pattern
    color += texture2D(texture, vUv + delta).rgb;
    color += texture2D(texture, vUv - delta).rgb;
    color += texture2D(texture, vUv + vec2(delta.x, -delta.y)).rgb;
    color += texture2D(texture, vUv + vec2(-delta.x, delta.y)).rgb;

    // Average the samples
    gl_FragColor = vec4(color * 0.2, texel.a);
}