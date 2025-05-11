uniform sampler2D tDiffuse;
uniform vec2 lightPosition;
uniform float exposure;
uniform float decay;
uniform float density;
uniform float weight;
uniform float clampValue;
uniform int samples;

varying vec2 vUv;

void main() {
    vec2 deltaTextCoord = vec2(vUv - lightPosition.xy);
    vec2 texCoord = vUv;
    deltaTextCoord *= 1.0 / float(samples) * density;

    float illuminationDecay = 1.0;
    vec4 color = vec4(0.0);

    for(int i=0; i < samples; i++) {
        texCoord -= deltaTextCoord;
        vec4 sample = texture2D(tDiffuse, texCoord);
        sample *= illuminationDecay * weight;
        color += sample;
        illuminationDecay *= decay;
    }

    color *= exposure;
    color = clamp(color, 0.0, clampValue);

    gl_FragColor = color;
}