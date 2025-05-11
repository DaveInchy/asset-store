varying vec4 v_nearpos;
varying vec4 v_farpos;
varying vec3 v_position;

void main() {
    // Set position
    vec4 position4 = vec4(position, 1.0);
    v_position = position;

    // Project near and far positions
    v_nearpos = position4;
    v_farpos = position4;

    // Project the position
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * position4;
}