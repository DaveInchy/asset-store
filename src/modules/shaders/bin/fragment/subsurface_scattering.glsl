#define USE_UV
#define USE_MAP
#define USE_NORMALMAP
#define SUBSURFACE

uniform sampler2D thicknessMap;
uniform sampler2D normalMap;
uniform vec2 resolution;
uniform vec3 color;
uniform float power;
uniform float scale;
uniform float distortion;
uniform float ambient;
uniform float attenuation;
uniform float translucency;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vec4 diffuseColor = vec4(color, 1.0);
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    #ifdef USE_NORMALMAP
        normal = normalize(texture2D(normalMap, vUv).xyz * 2.0 - 1.0);
    #endif

    float thickness = texture2D(thicknessMap, vUv).r;
    vec3 lightDir = normalize(vec3(0.0, 1.0, 0.0));
    vec3 lightColor = vec3(1.0);

    // Subsurface scattering
    vec3 H = normalize(lightDir + normal * distortion);
    float VdotH = pow(clamp(dot(viewDir, -H), 0.0, 1.0), power) * scale;
    vec3 subsurface = vec3(VdotH) * thickness * translucency * lightColor;

    // Diffuse
    float NdotL = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diffuseColor.rgb * lightColor * NdotL;

    // Ambient
    vec3 ambientColor = diffuseColor.rgb * ambient;

    // Final color
    vec3 finalColor = diffuse + subsurface + ambientColor;
    finalColor = pow(finalColor, vec3(1.0 / attenuation));

    gl_FragColor = vec4(finalColor, diffuseColor.a);
}