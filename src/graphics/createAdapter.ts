import { GraphicsAdapter } from "./GraphicsAdapter";
import { WebGLAdapter } from "./WebGLAdapter";
import { WebGPUAdapter } from "./WebGPUAdapter";
import { getUserGraphicsPreference, setUserGraphicsPreference, supportsWebGPU } from "./utils";

/**
 * Creates and initializes the most suitable graphics adapter.
 * It respects user preference, checks for WebGPU support, and falls back to WebGL.
 * @param canvas The HTMLCanvasElement to render to.
 * @param preferredApi Optional: Force a specific API ('webgpu' or 'webgl').
 *                     If not provided, it uses stored user preference or auto-detects.
 * @returns A promise that resolves to an initialized GraphicsAdapter or null if none could be initialized.
 */
export async function createGraphicsAdapter(
    canvas: HTMLCanvasElement,
    preferredApi?: 'webgpu' | 'webgl'
): Promise<GraphicsAdapter | null> {
    let targetApi = preferredApi || getUserGraphicsPreference();
    let adapter: GraphicsAdapter | null = null;

    console.log(`Attempting to initialize graphics adapter. User preference: ${targetApi || 'auto'}`);

    // Try WebGPU if preferred or no preference and supported
    if (targetApi === 'webgpu' || (!targetApi && await supportsWebGPU())) {
        if (await supportsWebGPU()) {
            console.log("WebGPU is supported. Attempting to initialize WebGPUAdapter...");
            adapter = new WebGPUAdapter();
            if (await adapter.init(canvas)) {
                console.log("WebGPUAdapter initialized successfully.");
                setUserGraphicsPreference('webgpu'); // Save successful choice
                return adapter;
            } else {
                console.warn("WebGPUAdapter initialization failed. Will attempt WebGL fallback.");
                adapter = null; // Reset adapter if init failed
                // If user explicitly chose WebGPU and it failed, we fall back.
                // No need to clear preference here, as supportsWebGPU might be true but init failed for other reasons.
            }
        } else {
            console.log("WebGPU explicitly preferred or auto-selected, but not supported by the browser.");
            if (targetApi === 'webgpu') { // If user *insisted* on WebGPU and it's not supported
                setUserGraphicsPreference('webgl'); // Update preference to reflect reality
            }
        }
    }

    // Fallback to WebGL or if WebGL was the preference
    console.log("Attempting to initialize WebGLAdapter...");
    adapter = new WebGLAdapter();
    if (await adapter.init(canvas)) {
        console.log("WebGLAdapter initialized successfully.");
        setUserGraphicsPreference('webgl'); // Save successful choice (or fallback choice)
        return adapter;
    }

    console.error("FATAL: Failed to initialize any graphics adapter.");
    return null;
}