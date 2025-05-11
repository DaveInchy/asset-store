uniform sampler2D heightMap;
uniform float scale;

varying vec2 vUv;

void main() {
    vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y);

    // Read neighbor heights using a Sobel kernel
    float t0 = texture2D(heightMap, vUv + texel * vec2(-1, -1)).r;
    float t1 = texture2D(heightMap, vUv + texel * vec2( 0, -1)).r;
    float t2 = texture2D(heightMap, vUv + texel * vec2( 1, -1)).r;
    float t3 = texture2D(heightMap, vUv + texel * vec2(-1,  0)).r;
    float t4 = texture2D(heightMap, vUv + texel * vec2( 1,  0)).r;
    float t5 = texture2D(heightMap, vUv + texel * vec2(-1,  1)).r;
    float t6 = texture2D(heightMap, vUv + texel * vec2( 0,  1)).r;
    float t7 = texture2D(heightMap, vUv + texel * vec2( 1,  1)).r;

    // Sobel filter
    vec3 normal;
    normal.x = -(t2 + 2.0 * t4 + t7 - t0 - 2.0 * t3 - t5) / (8.0 * scale);
    normal.y = -(t5 + 2.0 * t6 + t7 - t0 - 2.0 * t1 - t2) / (8.0 * scale);
    normal.z = 1.0;
    normal = normalize(normal);

    // Convert from [-1,1] to [0,1]
    gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);
}