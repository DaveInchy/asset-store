const GRAPHICS_API_PREFERENCE_KEY = 'userGraphicsAPIPreference'; // e.g., 'webgpu', 'webgl'

export async function supportsWebGPU(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            return !!adapter; // True if an adapter is successfully obtained
        } catch (e) {
            console.warn("WebGPU adapter request failed:", e);
            return false;
        }
    }
    return false;
}

export function getUserGraphicsPreference(): 'webgpu' | 'webgl' | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(GRAPHICS_API_PREFERENCE_KEY) as 'webgpu' | 'webgl' | null;
    }
    return null;
}

export function setUserGraphicsPreference(preference: 'webgpu' | 'webgl'): void {
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(GRAPHICS_API_PREFERENCE_KEY, preference);
        } catch (e) {
            console.warn("Could not save graphics preference to localStorage:", e);
        }
    }
}