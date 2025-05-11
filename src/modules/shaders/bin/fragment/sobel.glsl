uniform sampler2D tDiffuse;
uniform vec2 resolution;

varying vec2 vUv;

void main() {
    vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y);

    // Define Sobel kernels
    float kernel_x[9];
    kernel_x[0] = -1.0; kernel_x[1] = 0.0; kernel_x[2] = 1.0;
    kernel_x[3] = -2.0; kernel_x[4] = 0.0; kernel_x[5] = 2.0;
    kernel_x[6] = -1.0; kernel_x[7] = 0.0; kernel_x[8] = 1.0;

    float kernel_y[9];
    kernel_y[0] = -1.0; kernel_y[1] = -2.0; kernel_y[2] = -1.0;
    kernel_y[3] = 0.0;  kernel_y[4] = 0.0;  kernel_y[5] = 0.0;
    kernel_y[6] = 1.0;  kernel_y[7] = 2.0;  kernel_y[8] = 1.0;

    vec2 offset[9];
    offset[0] = vec2(-texel.x, -texel.y);
    offset[1] = vec2(0.0, -texel.y);
    offset[2] = vec2(texel.x, -texel.y);
    offset[3] = vec2(-texel.x, 0.0);
    offset[4] = vec2(0.0, 0.0);
    offset[5] = vec2(texel.x, 0.0);
    offset[6] = vec2(-texel.x, texel.y);
    offset[7] = vec2(0.0, texel.y);
    offset[8] = vec2(texel.x, texel.y);

    vec3 gx = vec3(0.0);
    vec3 gy = vec3(0.0);

    for (int i = 0; i < 9; i++) {
        vec4 color = texture2D(tDiffuse, vUv + offset[i]);
        gx += color.rgb * kernel_x[i];
        gy += color.rgb * kernel_y[i];
    }

    float g = sqrt(dot(gx, gx) + dot(gy, gy));
    gl_FragColor = vec4(vec3(g), 1.0);
}