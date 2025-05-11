uniform float cameraNear;
uniform float cameraFar;
uniform float fogNear;
uniform float fogFar;
uniform bool onlyAO;
uniform vec2 size;
uniform float aoClamp;
uniform float lumInfluence;

uniform sampler2D tDepth;
uniform sampler2D tDiffuse;

varying vec2 vUv;

#define DL 2.399963229728653
#define EULER 2.718281828459045

const int samples = 8;
const float radius = 5.0;
const bool useNoise = true;
const float noiseAmount = 0.0003;
const float diffArea = 0.4;
const float gDisplace = 0.4;
const vec3 onlyAOColor = vec3(1.0, 0.7, 0.5);

float unpackDepth(const in vec4 rgba_depth) {
    return rgba_depth.r;
}

float getDepth(const in vec2 screenPosition) {
    return unpackDepth(texture2D(tDepth, screenPosition));
}

float readDepth(const in vec2 coord) {
    return (2.0 * cameraNear) / (cameraFar + cameraNear - unpackDepth(texture2D(tDepth, coord)) * (cameraFar - cameraNear));
}

float compareDepths(const in float depth1, const in float depth2, inout int far) {
    float garea = 2.0;
    float diff = (depth1 - depth2) * 100.0;
    if (diff < gDisplace) {
        garea = diffArea;
    } else {
        far = 1;
    }

    float dd = diff - gDisplace;
    float gauss = pow(EULER, -2.0 * dd * dd / (garea * garea));
    return gauss;
}

float calcAO(float depth, float dw, float dh) {
    float dd = radius - depth * radius;
    vec2 vv = vec2(dw, dh);
    vec2 coord1 = vUv + dd * vv;
    vec2 coord2 = vUv - dd * vv;

    float temp1 = 0.0;
    float temp2 = 0.0;
    int far = 0;
    temp1 = compareDepths(depth, readDepth(coord1), far);

    if (far > 0) {
        temp2 = compareDepths(readDepth(coord2), depth, far);
        temp1 += (1.0 - temp1) * temp2;
    }

    return temp1;
}

void main() {
    vec2 noise = vec2(0.0);
    if (useNoise) {
        noise.x = (rand(vUv * 96.0) - 0.5) * noiseAmount;
        noise.y = (rand(vUv * 96.0 + 0.1) - 0.5) * noiseAmount;
    }

    float depth = readDepth(vUv);
    float ao = 0.0;

    float dz = 1.0 / float(samples);
    float z = 1.0 - dz/2.0;
    float l = 0.0;

    for (int i = 0; i <= samples; i++) {
        float r = sqrt(1.0 - z) * radius;
        float pw = cos(l) * r;
        float ph = sin(l) * r;
        ao += calcAO(depth, pw * size.x + noise.x, ph * size.y + noise.y);
        z = z - dz;
        l = l + DL;
    }

    ao /= float(samples);
    ao = 1.0 - ao;

    if (onlyAO) {
        ao = mix(ao, 1.0, aoClamp);
        gl_FragColor = vec4(vec3(ao) * onlyAOColor, 1.0);
    } else {
        ao = mix(ao, 1.0, aoClamp);
        vec3 color = texture2D(tDiffuse, vUv).rgb;
        vec3 lumCoeff = vec3(0.299, 0.587, 0.114);
        float lum = dot(color.rgb, lumCoeff);
        vec3 luminance = vec3(lum);
        vec3 final = vec3(color * mix(vec3(ao), vec3(1.0), luminance * lumInfluence));
        gl_FragColor = vec4(final, 1.0);
    }
}