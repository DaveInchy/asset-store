import { BufferUsageFlags, ComputePipeline, GBuffer, GraphicsAdapter, RenderPipeline, ShaderModule, ShaderSources } from "./GraphicsAdapter";

export class WebGLAdapter implements GraphicsAdapter {
    public readonly type = 'webgl';
    public device: WebGL2RenderingContext | null = null;
    public gl: WebGL2RenderingContext | null = null;

    async init(canvas: HTMLCanvasElement): Promise<boolean> {
        try {
            const gl = canvas.getContext('webgl2');
            if (!gl) {
                console.error('Unable to initialize WebGL2. Your browser or machine may not support it.');
                return false;
            }

            this.gl = gl;
            this.device = gl; // For WebGL, the context acts as the device

            // Basic WebGL setup
            gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
            gl.enable(gl.DEPTH_TEST);           // Enable depth testing
            gl.depthFunc(gl.LEQUAL);              // Near things obscure far things
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color and depth buffer.

            return true;
        } catch (e: any) {
            console.error('Failed to initialize WebGL2:', e.message || e);
            return false;
        }
    }

    createBuffer(data: ArrayBufferView, usage: BufferUsageFlags, label?: string): GBuffer {
        if (!this.gl) {
            throw new Error("WebGL context not initialized. Call init() first.");
        }
        const gl = this.gl;
        const buffer = gl.createBuffer();
        if (!buffer) {
            throw new Error("Failed to create buffer.");
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

        // TODO: Map BufferUsageFlags to appropriate WebGL usage hint (gl.STATIC_DRAW, gl.DYNAMIC_DRAW, gl.STREAM_DRAW)
        // For now, defaulting to STATIC_DRAW as in the proposal.
        // Example:
        // let webGLUsage = gl.STATIC_DRAW;
        // if (usage & BufferUsageFlags.MapWrite || usage & BufferUsageFlags.CopyDst) { // Assuming frequent updates
        //     webGLUsage = gl.DYNAMIC_DRAW;
        // }
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // Unbind buffer

        return buffer as GBuffer; // Assuming GBuffer is compatible with WebGLBuffer
    }

    createShaderModule(sources: ShaderSources): ShaderModule {
        if (!this.gl) {
            throw new Error("WebGL context not initialized. Call init() first.");
        }
        const gl = this.gl;

        const compileShader = (source: string, type: GLenum): WebGLShader => {
            const shader = gl.createShader(type);
            if (!shader) {
                throw new Error(`Failed to create shader (type: ${type})`);
            }
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                const info = gl.getShaderInfoLog(shader);
                gl.deleteShader(shader);
                throw new Error(`Shader compilation failed (type: ${type}): ${info}`);
            }
            return shader;
        };

        const vertexShader = compileShader(sources.glsl?.vertex || "", gl.VERTEX_SHADER);
        const fragmentShader = compileShader(sources.glsl?.fragment || "", gl.FRAGMENT_SHADER);

        // The ShaderModule interface likely expects WebGLShader objects or similar handles.
        // Adjust if ShaderModule has a different structure.
        return { vertex: vertexShader, fragment: fragmentShader } as ShaderModule;
    }

    createRenderPipeline(shaderModule: ShaderModule, label?: string): RenderPipeline {
        if (!this.gl) {
            throw new Error("WebGL context not initialized. Call init() first.");
        }
        const gl = this.gl;

        // Assuming shaderModule contains compiled WebGLShader objects
        const sm = shaderModule as { vertex: WebGLShader, fragment: WebGLShader };

        const program = gl.createProgram();
        if (!program) {
            throw new Error('Failed to create program');
        }
        gl.attachShader(program, sm.vertex);
        gl.attachShader(program, sm.fragment);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program); // Clean up on failure
            // It's also good practice to detach and delete shaders if the program link fails and they are no longer needed.
            // gl.detachShader(program, sm.vertex);
            // gl.detachShader(program, sm.fragment);
            // gl.deleteShader(sm.vertex); // If they are not managed elsewhere
            // gl.deleteShader(sm.fragment);
            throw new Error(`Program linking failed: ${info}`);
        }

        // TODO: Consider validating the program after linking (gl.validateProgram) for more robust error checking, especially during development.

        return program as RenderPipeline; // Assuming RenderPipeline is compatible with WebGLProgram
    }

    beginRenderPass(clearColor?: { r: number; g: number; b: number; a: number; }): WebGL2RenderingContext {
        if (!this.gl) {
            throw new Error("WebGL context not initialized. Call init() first.");
        }
        const gl = this.gl;
        if (clearColor) {
            gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
        }
        // Assuming depth buffer should always be cleared if depth testing is enabled.
        // The GraphicsAdapter interface might need to specify clear flags.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // In WebGL, the context itself acts as the "pass encoder".
        return gl;
    }

    setPipeline(passEncoder: WebGL2RenderingContext, pipeline: RenderPipeline): void {
        // passEncoder is expected to be this.gl
        if (!this.gl || passEncoder !== this.gl) {
            throw new Error("Invalid pass encoder or WebGL context not initialized.");
        }
        this.gl.useProgram(pipeline as WebGLProgram);
    }

    setVertexBuffer(
        passEncoder: WebGL2RenderingContext,
        slot: number, // Corresponds to attribute location
        buffer: GBuffer,
        offset: number = 0,
        // Parameters for vertexAttribPointer that are often part of a vertex layout/descriptor:
        // size (number of components per attribute, e.g., 2 for vec2, 3 for vec3)
        // type (e.g., gl.FLOAT, gl.UNSIGNED_BYTE)
        // normalized (boolean)
        // stride (bytes between consecutive attributes)
        // These are currently hardcoded or have simple defaults below.
        // For a more flexible adapter, these should be configurable.
        componentCount: number = 3, // Default to 3 components (e.g., vec3)
        componentType: GLenum = WebGL2RenderingContext.FLOAT, // Default to FLOAT
        normalized: boolean = false,
        stride: number = 0 // 0 means attributes are tightly packed
    ): void {
        if (!this.gl || passEncoder !== this.gl) {
            throw new Error("Invalid pass encoder or WebGL context not initialized.");
        }
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer as WebGLBuffer);
        gl.enableVertexAttribArray(slot);
        // componentCount: number of components per vertex attribute (1-4)
        // componentType: data type of each component (e.g., gl.FLOAT, gl.UNSIGNED_BYTE)
        // normalized: whether non-float data should be normalized
        // stride: byte offset between consecutive generic vertex attributes
        // offset: byte offset of the first component
        gl.vertexAttribPointer(slot, componentCount, componentType, normalized, stride, offset);
        // Consider unbinding ARRAY_BUFFER after setting up attributes if not immediately drawing,
        // though often it's fine to leave it bound if the next operation uses it.
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    draw(
        passEncoder: WebGL2RenderingContext,
        vertexCount: number,
        instanceCount: number = 1,
        firstVertex: number = 0,
        firstInstance: number = 0 // WebGL drawArrays doesn't use firstInstance directly
    ): void {
        if (!this.gl || passEncoder !== this.gl) {
            throw new Error("Invalid pass encoder or WebGL context not initialized.");
        }
        const gl = this.gl;
        // TODO: The primitive type (e.g., gl.TRIANGLES) should ideally be part of the RenderPipeline state.
        // Hardcoding to TRIANGLES for now.
        const mode = gl.TRIANGLES;

        if (instanceCount > 1) {
            // WebGL2 supports instanced drawing
            gl.drawArraysInstanced(mode, firstVertex, vertexCount, instanceCount);
        } else {
            gl.drawArrays(mode, firstVertex, vertexCount);
        }
    }

    drawIndexed(
        passEncoder: WebGL2RenderingContext,
        indexCount: number,
        instanceCount: number = 1,
        firstIndex: number = 0, // Byte offset into the element array buffer
        baseVertex: number = 0,
        firstInstance: number = 0 // WebGL drawElementsInstanced doesn't use firstInstance directly
    ): void {
        if (!this.gl || passEncoder !== this.gl) {
            throw new Error("Invalid pass encoder or WebGL context not initialized.");
        }
        const gl = this.gl;
        // TODO: Primitive type (e.g., gl.TRIANGLES) should be part of RenderPipeline state.
        // TODO: Index type (e.g., gl.UNSIGNED_SHORT, gl.UNSIGNED_INT) should be specified,
        // often associated with the index buffer itself or pipeline state.
        // Hardcoding to TRIANGLES and UNSIGNED_SHORT for now.
        const mode = gl.TRIANGLES;
        const indexType = gl.UNSIGNED_SHORT; // Common default, but WebGL2 supports gl.UNSIGNED_INT.

        // Note: `firstIndex` in drawElements is a byte offset.
        // If your `GraphicsAdapter` API means it as an element offset, conversion is needed:
        // const byteOffset = firstIndex * (indexType === gl.UNSIGNED_SHORT ? 2 : 4);

        if (instanceCount > 1) {
            if (baseVertex !== 0) {
                // drawElementsInstancedBaseVertexBaseInstance is an extension in WebGL2,
                // and may not be directly available on the context type.
                // We need to check for its existence before calling it.
                if ((gl as any).drawElementsInstancedBaseVertexBaseInstance)
                    (gl as any).drawElementsInstancedBaseVertexBaseInstance(mode, indexCount, indexType, firstIndex, instanceCount, baseVertex, 0);
                // and may not be directly available on the context type.
                // We need to check for its existence before calling it.
                if ((gl as any).drawElementsInstancedBaseVertexBaseInstance)
                    (gl as any).drawElementsInstancedBaseVertexBaseInstance(mode, indexCount, indexType, firstIndex, instanceCount, baseVertex, 0);
            } else {
                gl.drawElementsInstanced(mode, indexCount, indexType, firstIndex, instanceCount);
            }
        } else {
            if (baseVertex !== 0) {
                // drawElementsBaseVertex is an extension in WebGL2,
                // and may not be directly available on the context type.
                // We need to check for its existence before calling it.
                if ((gl as any).drawElementsBaseVertex)
                    (gl as any).drawElementsBaseVertex(mode, indexCount, indexType, firstIndex, baseVertex);
            } else {
                gl.drawElements(mode, indexCount, indexType, firstIndex);
            }
        }
    }

    endRenderPass(passEncoder: WebGL2RenderingContext): void {
        // In WebGL, render passes are not explicitly ended in the same way as WebGPU.
        // State is managed directly on the context.
        // Unbinding resources or restoring states could happen here if necessary.
        if (!this.gl || passEncoder !== this.gl) {
            // Allow if gl is null (already destroyed)
            if (this.gl) throw new Error("Invalid pass encoder or WebGL context not initialized.");
            return;
        }
        // Example: unbind vertex array object if you use them, or reset some states.
    }

    submit(): void {
        // In WebGL, commands are typically executed immediately or queued by the browser.
        // A `gl.flush()` or `gl.finish()` could be called here if explicit synchronization is needed,
        // but it's often not necessary and can impact performance.
        // `gl.flush()` commands the GPU to start processing, `gl.finish()` blocks until complete.
        if (!this.gl) {
             // Allow if gl is null (already destroyed)
            return;
        }
        // this.gl.flush(); // Optional: if you want to ensure commands are sent.
    }

    destroy(): void {
        // TODO: Implement comprehensive cleanup of all created WebGL resources
        // (buffers, shaders, programs, textures, framebuffers, VAOs etc.)
        // For example, if you track created programs:
        // this.createdPrograms.forEach(p => this.gl?.deleteProgram(p));
        // this.createdBuffers.forEach(b => this.gl?.deleteBuffer(b));
        // this.createdShaders.forEach(s => this.gl?.deleteShader(s));

        this.gl = null;
        this.device = null;
        // Any other cleanup specific to the adapter
    }

    // --- Compute Pass Methods (Not supported in WebGL2 core like WebGPU) ---
    beginComputePass?() {
        throw new Error("Compute passes are not supported in WebGL");
    }

    setComputePipeline?(passEncoder: any, pipeline: ComputePipeline): void {
        throw new Error("Compute pipelines are not supported in WebGL");
    }

    dispatchWorkgroups?(passEncoder: any, x: number, y?: number, z?: number): void {
        throw new Error("Compute workgroups are not supported in WebGL");
    }

    endComputePass?(passEncoder: any): void {
        throw new Error("Compute passes are not supported in WebGL");
    }
}
