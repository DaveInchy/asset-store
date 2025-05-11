#include <common>
#include <packing>

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tMetalness;
uniform sampler2D tDepth;
uniform sampler2D tAccumulate;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;

uniform vec3 cameraPosition;
uniform vec2 resolution;
uniform float opacity;
uniform float maxDistance;
uniform float thickness;
uniform float stride;
uniform int steps;

varying vec2 vUv;

void main() {
    float metalness = texture2D(tMetalness, vUv).r;
    vec2 texSize = resolution;
    vec2 texelSize = 1.0 / texSize;

    float depth = texture2D(tDepth, vUv).r;
    vec3 normal = texture2D(tNormal, vUv).rgb * 2.0 - 1.0;

    // View space reconstruction
    vec4 projectedCoord = vec4(vUv.x * 2.0 - 1.0, vUv.y * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
    vec4 viewPosition = inverse(projectionMatrix) * projectedCoord;
    viewPosition /= viewPosition.w;

    vec3 viewNormal = normalize((viewMatrix * vec4(normal, 0.0)).xyz);
    vec3 viewDir = normalize(viewPosition.xyz);
    vec3 viewReflect = reflect(viewDir, viewNormal);

    // Ray marching
    vec3 rayStart = viewPosition.xyz;
    vec3 rayStep = viewReflect * stride;
    vec3 rayPos = rayStart;

    float rayLength = 0.0;
    float alpha = 0.0;
    vec2 hitPixel = vUv;

    for(int i = 0; i < steps; i++) {
        rayPos += rayStep;

        vec4 projectedCoord = projectionMatrix * vec4(rayPos, 1.0);
        projectedCoord.xyz /= projectedCoord.w;
        vec2 uv = projectedCoord.xy * 0.5 + 0.5;

        if(uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) break;

        float sampleDepth = texture2D(tDepth, uv).r;
        float linearSampleDepth = viewZToOrthographicDepth(sampleDepth, cameraNear, cameraFar);
        float linearRayDepth = viewZToOrthographicDepth(rayPos.z, cameraNear, cameraFar);

        float depthDiff = linearSampleDepth - linearRayDepth;

        if(depthDiff > 0.0 && depthDiff < thickness) {
            hitPixel = uv;
            float dist = distance(rayPos, rayStart);
            alpha = 1.0 - dist / maxDistance;
            alpha = smoothstep(0.0, 1.0, alpha);
            break;
        }

        rayLength += stride;
        if(rayLength > maxDistance) break;
    }

    vec4 color = texture2D(tDiffuse, hitPixel);
    vec4 accumColor = texture2D(tAccumulate, vUv);

    gl_FragColor = vec4(mix(accumColor.rgb, color.rgb, alpha * opacity * metalness), 1.0);
}