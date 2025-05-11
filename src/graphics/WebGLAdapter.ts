import { BufferUsageFlags, ComputePipeline, GBuffer, GraphicsAdapter, RenderPipeline, ShaderModule, ShaderSources } from "./GraphicsAdapter";

export class WebGLAdapter implements GraphicsAdapter {
    public readonly type = 'webgl';
    public device: WebGL2RenderingContext | null = null; // Alias for gl
    public gl: WebGL2RenderingContext | null = null;

    async init(canvas: HTMLCanvasElement): Promise<boolean> {
        this.gl = canvas.getContext('webgl2');
        if (!this.gl) {
            console.warn("WebGL2 not supported, trying WebGL1.");
            // @ts-ignore
            this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        }

        if (!this.gl) {
            console.error("WebGL is not supported by this browser.");
            return false;
        }
        this.device = this.gl;
        console.log(`WebGL Adapter initialized successfully (Version: ${this.gl.getParameter(this.gl.VERSION)}).`);
        // Default clear color
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        return true;
    }

    private compileGLShader(type: number, source: string, key?: string): WebGLShader | null {
        if (!this.gl) return null;
        const shader = this.gl.createShader(type);
        if (!shader) {
            console.error(`WebGL: Failed to create shader object (key: ${key})`);
            return null;
        }
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const shaderName = type === this.gl.VERTEX_SHADER ? 'Vertex' : 'Fragment';
            console.error(
                `WebGL: Error compiling ${shaderName} shader (key: ${key}):\n${this.gl.getShaderInfoLog(shader)}`
            );
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createBuffer(data: ArrayBufferView, usage: BufferUsageFlags, label?: string): GBuffer | null {
        if (!this.gl) return null;
        const buffer = this.gl.createBuffer();
        if (!buffer) {
            console.error(`WebGL: Failed to create buffer (label: ${label})`);
            return null;
        }
        // WebGL buffer usage is simpler, often just STATIC_DRAW, DYNAMIC_DRAW, STREAM_DRAW
        // We'll use usage to determine the target (ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER)
        // This needs a more robust mapping from GPUBufferUsageFlags or a different parameter
        const target = (usage === this.gl.ELEMENT_ARRAY_BUFFER) ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER;
        this.gl.bindBuffer(target, buffer);
        this.gl.bufferData(target, data, this.gl.STATIC_DRAW); // Defaulting to STATIC_DRAW
        this.gl.bindBuffer(target, null); // Unbind
        // WebGL doesn't have labels in the same way, but you could store it if needed.
        return buffer;
    }

    createShaderModule(sources: ShaderSources): ShaderModule | null {
        if (!this.gl) return null;
        if (!sources.glsl || !sources.glsl.vertex || !sources.glsl.fragment) {
            console.warn(`WebGLAdapter: GLSL vertex or fragment source missing for shader key '${sources.key || 'unknown'}'. Cannot create shader program.`);
            return null;
        }

        const vertexShader = this.compileGLShader(this.gl.VERTEX_SHADER, sources.glsl.vertex, sources.key);
        const fragmentShader = this.compileGLShader(this.gl.FRAGMENT_SHADER, sources.glsl.fragment, sources.key);

        if (!vertexShader || !fragmentShader) {
            if (vertexShader) this.gl.deleteShader(vertexShader);
            if (fragmentShader) this.gl.deleteShader(fragmentShader);
            return null;
        }

        const program = this.gl.createProgram();
        if (!program) {
            console.error(`WebGL: Failed to create program (key: ${sources.key})`);
            this.gl.deleteShader(vertexShader);
            this.gl.deleteShader(fragmentShader);
            return null;
        }

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error(
                `WebGL: Error linking program (key: ${sources.key}):\n${this.gl.getProgramInfoLog(program)}`
            );
            this.gl.deleteProgram(program);
            this.gl.deleteShader(vertexShader);
            this.gl.deleteShader(fragmentShader);
            return null;
        }
        // Shaders can be detached and deleted after successful linking if not needed for introspection
        // this.gl.detachShader(program, vertexShader);
        // this.gl.detachShader(program, fragmentShader);
        // this.gl.deleteShader(vertexShader);
        // this.gl.deleteShader(fragmentShader);

        return { program, vertexShader, fragmentShader }; // Store shaders for potential later use/cleanup
    }

    createRenderPipeline(shaderModule: ShaderModule, label?: string): RenderPipeline | null {
        // For WebGL, the "render pipeline" is essentially just the WebGLProgram.
        // The shaderModule already contains the program.
        if (!this.gl || !shaderModule || !shaderModule.program) return null;
        return shaderModule.program;
    }

    // Implement other methods (beginRenderPass, draw, destroy, etc.)
    // For WebGL, many operations are more direct on the `gl` context.
    // `submit` is a no-op for WebGL as commands are typically executed immediately.
    submit(): void { /* No-op for WebGL */ }

    destroy(): void {
        // Clean up all WebGL resources (programs, shaders, buffers, textures)
        // This requires tracking created resources.
        this.gl = null;
        this.device = null;
        console.log("WebGL Adapter destroyed.");
    }

    // ... (Rest of the methods from GraphicsAdapter to be implemented)
}