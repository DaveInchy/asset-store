export interface ShaderSources {
    /** WebGPU Shading Language source code. */
    wgsl?: string;
    /** GLSL source codes. */
    glsl?: {
        vertex: string;
        fragment: string;
        /** Optional: GLSL compute shader source. */
        compute?: string;
    };
    /** Optional: A unique key or name for this shader set, useful for caching or debugging. */
    key?: string;
}

export type BufferUsageFlags = number; // GPUBufferUsageFlags (WebGPU) or GLenum (WebGL)
export type ShaderModule = any; // GPUShaderModule (WebGPU) or { program: WebGLProgram, vertexShader: WebGLShader, fragmentShader: WebGLShader } (WebGL)
export type RenderPipeline = any; // GPURenderPipeline (WebGPU) or WebGLProgram (WebGL)
export type ComputePipeline = any; // GPUComputePipeline (WebGPU) or WebGLProgram (WebGL)
export type GBuffer = any; // GPUBuffer (WebGPU) or WebGLBuffer (WebGL)

export interface GraphicsAdapter {
    readonly type: 'webgpu' | 'webgl';
    readonly device: GPUDevice | WebGL2RenderingContext | null; // Expose for advanced direct access if needed

    init(canvas: HTMLCanvasElement): Promise<boolean>;

    createBuffer(data: ArrayBufferView, usage: BufferUsageFlags, label?: string): GBuffer | null;
    createShaderModule(sources: ShaderSources): ShaderModule | null;

    createRenderPipeline(
        shaderModule: ShaderModule,
        // Add more parameters as needed: vertex layout, blend states, depth/stencil, etc.
        label?: string
    ): RenderPipeline | null;

    createComputePipeline?(
        shaderModule: ShaderModule,
        label?: string
    ): ComputePipeline | null;

    // Simplified render pass, expand as needed
    beginRenderPass(
        clearColor?: { r: number; g: number; b: number; a: number },
        // Add depth/stencil clear options
    ): any; // GPURenderPassEncoder or this (WebGLAdapter)

    setPipeline(passEncoder: any, pipeline: RenderPipeline): void;
    setVertexBuffer(passEncoder: any, slot: number, buffer: GBuffer, offset?: number, size?: number): void;
    // setIndexBuffer, setBindGroup etc. would go here

    draw(passEncoder: any, vertexCount: number, instanceCount?: number, firstVertex?: number, firstInstance?: number): void;
    drawIndexed?(passEncoder: any, indexCount: number, instanceCount?: number, firstIndex?: number, baseVertex?: number, firstInstance?: number): void;

    endRenderPass(passEncoder: any): void;

    // Simplified compute pass
    beginComputePass?(): any; // GPUComputePassEncoder or this (WebGLAdapter)
    setComputePipeline?(passEncoder: any, pipeline: ComputePipeline): void;
    dispatchWorkgroups?(passEncoder: any, x: number, y?: number, z?: number): void;
    endComputePass?(passEncoder: any): void;

    submit?(): void; // Primarily for WebGPU's command queue submission
    destroy(): void;
}