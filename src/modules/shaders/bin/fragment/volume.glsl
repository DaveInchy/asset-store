uniform vec3 u_size;
uniform int u_renderstyle;
uniform float u_renderthreshold;
uniform vec2 u_clim;

uniform sampler3D u_data;
uniform sampler2D u_cmdata;

varying vec3 v_position;
varying vec4 v_nearpos;
varying vec4 v_farpos;

// The maximum distance through our rendering volume
const float MAX_STEPS = 887.0;
const float STEP_SIZE = 0.005;
const float ALPHA_THRESHOLD = 0.95;

// Lighting
const float AMBIENT = 0.4;
const float DIFFUSE = 0.6;
const float SPEC_POWER = 3.0;

vec4 apply_colormap(float val) {
    val = (val - u_clim[0]) / (u_clim[1] - u_clim[0]);
    return texture2D(u_cmdata, vec2(val, 0.5));
}

void main() {
    // Calculate ray start and end positions
    vec3 farpos = v_farpos.xyz / v_farpos.w;
    vec3 nearpos = v_nearpos.xyz / v_nearpos.w;

    // Calculate unit vector and total distance
    vec3 dir = normalize(farpos - nearpos);
    float distance = length(farpos - nearpos);

    // Calculate step size and initial position
    float step_size = STEP_SIZE;
    vec3 pos = nearpos;

    // Initialize total value
    float total_value = 0.0;

    // Ray marching loop
    for (float i = 0.0; i < MAX_STEPS; i++) {
        // Break if we've gone too far
        if (distance < 0.0) break;

        // Get sample
        vec3 tex_pos = pos / u_size + vec3(0.5);
        float val = texture3D(u_data, tex_pos).r;

        // Accumulate value
        if (val > u_renderthreshold) {
            total_value += val;

            // Early exit if we've hit full opacity
            if (total_value > ALPHA_THRESHOLD) {
                gl_FragColor = apply_colormap(val);
                return;
            }
        }

        // Advance position and decrease distance
        pos = pos + dir * step_size;
        distance -= step_size;
    }

    // If we haven't hit anything, discard
    if (total_value < 0.05) {
        gl_FragColor = vec4(0.0);
        return;
    }

    // Output final color
    gl_FragColor = apply_colormap(total_value);
}