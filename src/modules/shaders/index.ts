import atmosFrag from "./bin/fragment/atmosphere.glsl";
import atmosVert from "./bin/vertex/atmosphere.glsl";
import clothCompute from "./bin/compute/cloth_simulation.comp";
import cloudsFrag from "./bin/fragment/clouds.glsl";
import cloudsVert from "./bin/vertex/clouds.glsl";
import fluidCompute from "./bin/compute/fluid_simulation.comp";
import gammaCorrectionFrag from "./bin/fragment/gamma_correction.glsl";
import gammaCorrectionVert from "./bin/vertex/gamma_correction.glsl";
import globeFrag from "./bin/fragment/globe.glsl";
import globeVert from "./bin/vertex/globe.glsl";
import godRaysFrag from "./bin/fragment/god_rays.glsl";
import godRaysVert from "./bin/vertex/god_rays.glsl";
import halftoneFrag from "./bin/fragment/halftone.glsl";
import halftoneVert from "./bin/vertex/halftone.glsl";
import horizontalBlurFrag from "./bin/fragment/horizontal_blur.glsl";
import horizontalBlurVert from "./bin/vertex/horizontal_blur.glsl";
import horizontalTiltShiftFrag from "./bin/fragment/horizontal_tilt_shift.glsl";
import horizontalTiltShiftVert from "./bin/vertex/horizontal_tilt_shift.glsl";
import hueSaturationFrag from "./bin/fragment/hue_saturation.glsl";
import hueSaturationVert from "./bin/vertex/hue_saturation.glsl";
import kaleidoFrag from "./bin/fragment/kaleido.glsl";
import kaleidoVert from "./bin/vertex/kaleido.glsl";
import luminosityFrag from "./bin/fragment/luminosity.glsl";
import luminosityHighPassFrag from "./bin/fragment/luminosity_high_pass.glsl";
import luminosityHighPassVert from "./bin/vertex/luminosity_high_pass.glsl";
import luminosityVert from "./bin/vertex/luminosity.glsl";
import mirrorFrag from "./bin/fragment/mirror.glsl";
import mirrorVert from "./bin/vertex/mirror.glsl";
import noiseFrag from "./bin/noise.ffx";
import normalMapFrag from "./bin/fragment/normal_map.glsl";
import normalMapVert from "./bin/vertex/normal_map.glsl";
import normalVert from "./bin/normalized.vfx";
import outputFrag from "./bin/fragment/output.glsl";
import outputVert from "./bin/vertex/output.glsl";
import particleCompute from "./bin/compute/particle_system.comp";
import raymarching from "./compute/shaders/raymarching.comp";
import rgbShiftFrag from "./bin/fragment/rgb_shift.glsl";
import rgbShiftVert from "./bin/vertex/rgb_shift.glsl";
import saoFrag from "./bin/fragment/sao.glsl";
import saoVert from "./bin/vertex/sao.glsl";
import smaaFrag from "./bin/fragment/smaa.glsl";
import smaaVert from "./bin/vertex/smaa.glsl";
import ssaoFrag from "./bin/fragment/ssao.glsl";
import ssaoVert from "./bin/vertex/ssao.glsl";
import ssrFrag from "./bin/fragment/ssr.glsl";
import ssrVert from "./bin/vertex/ssr.glsl";
import sunFrag from "./bin/fragment/sun.glsl";
import sunVert from "./bin/vertex/sun.glsl";
import triangleBlurFrag from "./bin/fragment/triangle_blur.glsl";
import triangleBlurVert from "./bin/vertex/triangle_blur.glsl";
import velocityFrag from "./bin/fragment/velocity.glsl";
import velocityVert from "./bin/vertex/velocity.glsl";
import verticalTiltShiftFrag from "./bin/fragment/vertical_tilt_shift.glsl";
import verticalTiltShiftVert from "./bin/vertex/vertical_tilt_shift.glsl";
import vignetteFrag from "./bin/fragment/vignette.glsl";
import vignetteVert from "./bin/vertex/vignette.glsl";
import volumeFrag from "./bin/fragment/volume.glsl";
import volumeVert from "./bin/vertex/volume.glsl";
import waterRefractionFrag from "./bin/fragment/water_refraction.glsl";
import waterRefractionVert from "./bin/vertex/water_refraction.glsl";

const ShaderLib = ({
    Compute: {
        ParticleSystem: particleCompute,
        FluidSimulation: fluidCompute,
        ClothSimulation: clothCompute,
        Raymarching: raymarching
    },
    Vertex: {
        normalized: normalVert,
    },
    Fragment: {
        randomNoise: noiseFrag,
    },
    Atmosphere: {
        vert: atmosVert,
        frag: atmosFrag,
    },
    Sun: {
        vert: sunVert,
        frag: sunFrag,
    },
    Globe: {
        vert: globeVert,
        frag: globeFrag,
    },
    Clouds: {
        vert: cloudsVert,
        frag: cloudsFrag,
    },
    WaterRefraction: {
        vert: waterRefractionVert,
        frag: waterRefractionFrag,
    },
    Volume: {
        vert: volumeVert,
        frag: volumeFrag,
    },
    Vignette: {
        vert: vignetteVert,
        frag: vignetteFrag,
    },
    VerticalTiltShift: {
        vert: verticalTiltShiftVert,
        frag: verticalTiltShiftFrag,
    },
    Velocity: {
        vert: velocityVert,
        frag: velocityFrag,
    },
    TriangleBlur: {
        vert: triangleBlurVert,
        frag: triangleBlurFrag,
    },
    GammaCorrection: {
        vert: gammaCorrectionVert,
        frag: gammaCorrectionFrag,
    },
    GodRays: {
        vert: godRaysVert,
        frag: godRaysFrag,
    },
    Halftone: {
        vert: halftoneVert,
        frag: halftoneFrag,
    },
    HorizontalBlur: {
        vert: horizontalBlurVert,
        frag: horizontalBlurFrag,
    },
    HorizontalTiltShift: {
        vert: horizontalTiltShiftVert,
        frag: horizontalTiltShiftFrag,
    },
    HueSaturation: {
        vert: hueSaturationVert,
        frag: hueSaturationFrag,
    },
    Kaleido: {
        vert: kaleidoVert,
        frag: kaleidoFrag,
    },
    Luminosity: {
        vert: luminosityVert,
        frag: luminosityFrag,
    },
    LuminosityHighPass: {
        vert: luminosityHighPassVert,
        frag: luminosityHighPassFrag,
    },
    Mirror: {
        vert: mirrorVert,
        frag: mirrorFrag,
    },
    NormalMap: {
        vert: normalMapVert,
        frag: normalMapFrag,
    },
    Output: {
        vert: outputVert,
        frag: outputFrag,
    },
    RGBShift: {
        vert: rgbShiftVert,
        frag: rgbShiftFrag,
    },
    SAO: {
        vert: saoVert,
        frag: saoFrag,
    },
    SMAA: {
        vert: smaaVert,
        frag: smaaFrag,
    },
    SSAO: {
        vert: ssaoVert,
        frag: ssaoFrag,
    },
    SSR: {
        vert: ssrVert,
        frag: ssrFrag,
    }
});

export default ShaderLib;