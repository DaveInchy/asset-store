#include <common>

uniform sampler2D tDepth;
uniform sampler2D tNormal;
uniform vec2 size;
uniform vec2 cameraNearFar;

uniform float intensity;
uniform float scale;
uniform float bias;
uniform float kernelRadius;
uniform float minResolution;
uniform float randomSeed;

varying vec2 vUv;

float getDepth(const in vec2 screenPosition) {
    return texture2D(tDepth, screenPosition).x;
}

float getViewZ(const in float depth) {
    return perspectiveDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);
}

vec3 getViewPosition(const in vec2 screenPosition, const in float depth, const in float viewZ) {
    float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];
    vec4 clipPosition = vec4((vec3(screenPosition, depth) - 0.5) * 2.0, 1.0);
    clipPosition *= clipW;
    return (viewMatrix * clipPosition).xyz;
}

vec3 getViewNormal(const in vec2 screenPosition) {
    return unpackRGBToNormal(texture2D(tNormal, screenPosition).xyz);
}

float getOcclusion(const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition) {
    vec3 viewDelta = sampleViewPosition - centerViewPosition;
    float viewDistance = length(viewDelta);
    float scaledDistance = viewDistance / scale;
    return max(0.0, (dot(centerViewNormal, viewDelta) - minResolution) / scaledDistance - bias) / (1.0 + pow2(scaledDistance));
}

const float ANGLE_STEP = PI2 * 5.0;
const float INV_NUM_SAMPLES = 1.0 / ANGLE_STEP;

float getAmbientOcclusion(const in vec3 centerViewPosition) {
    float ambientOcclusion = 0.0;
    float width = size.x;
    float height = size.y;
    float radius = kernelRadius;

    for (float angle = 0.0; angle < PI2; angle += ANGLE_STEP) {
        vec2 sampleDirection = vec2(cos(angle), sin(angle));
        float sampleDirectionLength = length(sampleDirection);
        sampleDirection = sampleDirection / sampleDirectionLength * radius;

        vec2 samplePosition = vUv + sampleDirection * INV_NUM_SAMPLES;

        float occluderDepth = getDepth(samplePosition);
        float viewZ = getViewZ(occluderDepth);

        if (abs(centerViewPosition.z - viewZ) < radius) {
            vec3 sampleViewPosition = getViewPosition(samplePosition, occluderDepth, viewZ);
            ambientOcclusion += getOcclusion(centerViewPosition, getViewNormal(vUv), sampleViewPosition);
        }
    }

    return ambientOcclusion;
}

void main() {
    float centerDepth = getDepth(vUv);
    float viewZ = getViewZ(centerDepth);
    vec3 viewPosition = getViewPosition(vUv, centerDepth, viewZ);

    float ambientOcclusion = getAmbientOcclusion(viewPosition);

    gl_FragColor.r = clamp(1.0 - ambientOcclusion * intensity, 0.0, 1.0);
    gl_FragColor.g = gl_FragColor.r;
    gl_FragColor.b = gl_FragColor.r;
    gl_FragColor.a = 1.0;
}