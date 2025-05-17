import type { GPU, GPUCanvasContext, GPURenderPassColorAttachment, GPURenderPassEncoder, GPUTextureFormat } from "@webgpu/types";
import { BufferUsageFlags, ComputePipeline, GBuffer, GraphicsAdapter, RenderPipeline, ShaderModule, ShaderSources } from "./GraphicsAdapter";

declare global {
    interface Navigator {
        gpu: GPU;
    }
}

// e:/Website/asset-store/src/graphics/WebGPUAdapter.ts

export class WebGPUAdapter implements GraphicsAdapter {
    public readonly type = 'webgpu';
    public device: GPUDevice | null = null;
    private context: GPUCanvasContext | null = null;
    private presentationFormat: GPUTextureFormat = 'bgra8unorm'; // A common default
    private currentCommandEncoder: GPUCommandEncoder | null = null;
    private currentRenderPassEncoder: GPURenderPassEncoder | null = null;
    private currentComputePassEncoder: GPUComputePassEncoder | null = null;

    async init(canvas: HTMLCanvasElement): Promise<boolean> {
        if (typeof navigator === 'undefined' || !navigator.gpu) {
            console.error("WebGPU not supported by this browser/environment.");
            return false;
        }
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                console.error("Failed to get WebGPU adapter. Your browser might support WebGPU, but no compatible GPU was found.");
                return false;
            }
            this.device = await adapter.requestDevice();
            if (!this.device) {
                console.error("Failed to get WebGPU device.");
                return false;
            }

            this.device.lost.then((info) => {
                console.error(`WebGPU device lost: ${info.message}`);
                // Implement recovery logic or notify the user
                this.device = null; // Mark device as lost
            });

            this.context = canvas.getContext('webgpu');
            if (!this.context) {
                console.error("Failed to get WebGPU canvas context.");
                this.device.destroy(); // Clean up allocated device
                this.device = null;
                return false;
            }

            this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();
            this.context.configure({
                device: this.device,
                format: this.presentationFormat,
                alphaMode: 'opaque', // Common choices: 'opaque', 'premultiplied'
            });
            console.log("WebGPU Adapter initialized successfully.");
            return true;
        } catch (e) {
            console.error("Error initializing WebGPU adapter:", e);
            if (this.device) {
                this.device.destroy();
                this.device = null;
            }
            return false;
        }
    }

    createBuffer(data: ArrayBufferView, usage: BufferUsageFlags, label?: string): GBuffer | null {
        if (!this.device) {
            console.error("WebGPUAdapter.createBuffer: Device not initialized.");
            return null;
        }
        try {
            const buffer = this.device.createBuffer({
                label,
                size: data.byteLength,
                usage,
                mappedAtCreation: true, // Map at creation for easy initial data upload
            });
            // Get the mapped range and copy the data
            new (data.constructor as any)(buffer.getMappedRange()).set(data);
            buffer.unmap();
            return buffer;
        } catch (e) {
            console.error(`Error creating WebGPU buffer (label: ${label}):`, e);
            return null;
        }
    }

    createShaderModule(sources: ShaderSources): ShaderModule | null {
        if (!this.device) {
            console.error("WebGPUAdapter.createShaderModule: Device not initialized.");
            return null;
        }
        if (!sources.wgsl) {
            console.warn(`WebGPUAdapter: WGSL source missing for shader (key: '${sources.key || 'unknown'}'). Cannot create shader module.`);
            return null;
        }
        try {
            return this.device.createShaderModule({ label: sources.key || 'ShaderModule', code: sources.wgsl });
        } catch (e) {
            console.error(`Error creating WGSL shader module (key: '${sources.key || 'unknown'}'):`, e);
            return null;
        }
    }

    createRenderPipeline(shaderModule: GPUShaderModule, label?: string): RenderPipeline | null {
        if (!this.device || !shaderModule) {
            console.error("WebGPUAdapter.createRenderPipeline: Device or shaderModule not available.");
            return null;
        }
        // This is a VERY simplified render pipeline.
        // A real one needs vertex buffer layouts, primitive topology, depth/stencil, blend states, etc.
        try {
            return this.device.createRenderPipeline({
                label: label || shaderModule.label || "RenderPipeline",
                layout: 'auto', // Or a specific GPUPipelineLayout
                vertex: {
                    module: shaderModule,
                    entryPoint: 'vertexMain', // Convention, make configurable
                    // buffers: [/* GPUVertexBufferLayout[] */]
                },
                fragment: {
                    module: shaderModule,
                    entryPoint: 'fragmentMain', // Convention, make configurable
                    targets: [{ format: this.presentationFormat }],
                    // blend: { /* GPUBlendState */ }
                },
                // primitive: { /* GPUPrimitiveState */ },
                // depthStencil: { /* GPUDepthStencilState */ },
                // multisample: { /* GPUMultisampleState */ },
            });
        } catch (e) {
            console.error(`Error creating WebGPU render pipeline (label: '${label || shaderModule.label}'):`, e);
            return null;
        }
    }

    async createComputePipeline(shaderModule: GPUShaderModule, label?: string): Promise<ComputePipeline | null> {
        if (!this.device || !shaderModule) {
            console.error("WebGPUAdapter.createComputePipeline: Device or shaderModule not available.");
            return null;
        }
        try {
            return await this.device.createComputePipelineAsync({
                layout: this.device.createPipelineLayout({ bindGroupLayouts: [] }),
                compute: {
                    module: shaderModule,
                    entryPoint: 'computeMain', // Convention, make configurable
                },
            });
        } catch (e) {
            console.error(`Error creating WebGPU compute pipeline (label: '${label || shaderModule.label}'):`, e);
            return null;
        }
    }

    beginRenderPass(clearColorValue?: { r: number; g: number; b: number; a: number }): GPURenderPassEncoder | null {
        if (!this.device || !this.context) {
            console.error("WebGPUAdapter.beginRenderPass: Device or context not initialized.");
            return null;
        }

        if (!this.currentCommandEncoder) {
            this.currentCommandEncoder = this.device.createCommandEncoder();
        }

        const colorAttachment: GPURenderPassColorAttachment = {
            view: this.context.getCurrentTexture().createView(), // Get the view for the current swap chain texture
            resolveTarget: undefined, // For MSAA, not used here
            loadOp: clearColorValue ? 'clear' : 'load',
            storeOp: 'store',
            clearValue: clearColorValue || { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }, // Default clear color
        };

        const renderPassDescriptor: GPURenderPassDescriptor = {
            label: "MainRenderPass",
            colorAttachments: [colorAttachment],
            // depthStencilAttachment: (if you have a depth texture)
        };

        this.currentRenderPassEncoder = this.currentCommandEncoder.beginRenderPass(renderPassDescriptor);
        return this.currentRenderPassEncoder;
    }

    setPipeline(passEncoder: GPURenderPassEncoder | GPUComputePassEncoder, pipeline: GPURenderPipeline | GPUComputePipeline): void {
        if (!passEncoder || !pipeline) {
            console.warn("WebGPUAdapter.setPipeline: Invalid passEncoder or pipeline.");
            return;
        }
        // The type system should ensure the correct pipeline type is passed for the encoder type.
        // However, a runtime check or more specific methods might be safer in a larger system.
        passEncoder.setPipeline(pipeline as any); // Using 'as any' for simplicity here, but refine if needed.
    }

    setVertexBuffer(passEncoder: GPURenderPassEncoder, slot: number, buffer: GBuffer, offset: number = 0, size?: number): void {
        if (!passEncoder || !buffer) {
            console.warn("WebGPUAdapter.setVertexBuffer: Invalid passEncoder or buffer.");
            return;
        }
        passEncoder.setVertexBuffer(slot, buffer as GPUBuffer, offset, size);
    }

    draw(passEncoder: GPURenderPassEncoder, vertexCount: number, instanceCount: number = 1, firstVertex: number = 0, firstInstance: number = 0): void {
        if (!passEncoder) return;
        passEncoder.draw(vertexCount, instanceCount, firstVertex, firstInstance);
    }

    drawIndexed(passEncoder: GPURenderPassEncoder, indexCount: number, instanceCount: number = 1, firstIndex: number = 0, baseVertex: number = 0, firstInstance: number = 0): void {
        if (!passEncoder) return;
        // Assumes an index buffer has been set on the passEncoder via passEncoder.setIndexBuffer(...)
        passEncoder.drawIndexed(indexCount, instanceCount, firstIndex, baseVertex, firstInstance);
    }

    endRenderPass(passEncoder: GPURenderPassEncoder): void {
        if (!passEncoder) return;
        if (passEncoder === this.currentRenderPassEncoder) {
            passEncoder.end();
            this.currentRenderPassEncoder = null;
        } else {
            console.warn("WebGPUAdapter.endRenderPass: Attempted to end a render pass that is not the current one or is invalid.");
        }
    }

    beginComputePass(): GPUComputePassEncoder | null {
        if (!this.device) {
            console.error("WebGPUAdapter.beginComputePass: Device not initialized.");
            return null;
        }
        if (!this.currentCommandEncoder) {
            this.currentCommandEncoder = this.device.createCommandEncoder({ label: "MainCommandEncoder" });
        }
        this.currentComputePassEncoder = this.currentCommandEncoder.beginComputePass();
        return this.currentComputePassEncoder;
    }

    setComputePipeline(passEncoder: GPUComputePassEncoder, pipeline: ComputePipeline): void {
        this.setPipeline(passEncoder, pipeline as GPUComputePipeline); // Reuses the generic setPipeline
    }

    dispatchWorkgroups(passEncoder: GPUComputePassEncoder, x: number, y: number = 1, z: number = 1): void {
        if (!passEncoder) return;
        passEncoder.dispatchWorkgroups(x, y, z);
    }

    endComputePass(passEncoder: GPUComputePassEncoder): void {
        if (!passEncoder) return;
        if (passEncoder === this.currentComputePassEncoder) {
            passEncoder.end();
            this.currentComputePassEncoder = null;
        } else {
            console.warn("WebGPUAdapter.endComputePass: Attempted to end a compute pass that is not the current one or is invalid.");
        }
    }

    submit(): void {
        if (this.currentCommandEncoder && this.device) {
            try {
                this.device.queue.submit([this.currentCommandEncoder.finish()]);
            } catch (e) {
                console.error("Error submitting WebGPU command queue:", e);
                // Potentially handle device loss or other submission errors
            } finally {
                this.currentCommandEncoder = null; // Reset for next frame/batch
            }
        } else if (this.currentCommandEncoder) {
            console.warn("WebGPUAdapter.submit: Command encoder exists but WebGPU device is not available for submission.");
            this.currentCommandEncoder = null;
        }
    }

    destroy(): void {
        // Ensure all ongoing passes are ended? (Might be too late if device is already lost)
        if (this.currentRenderPassEncoder) {
            try { this.currentRenderPassEncoder.end(); } catch (e) { /* ignore */ }
            this.currentRenderPassEncoder = null;
        }
        if (this.currentComputePassEncoder) {
            try { this.currentComputePassEncoder.end(); } catch (e) { /* ignore */ }
            this.currentComputePassEncoder = null;
        }
        if (this.currentCommandEncoder) {
            // It's unusual to have an encoder without submitting, but try to finish if it exists.
            try { this.currentCommandEncoder.finish(); } catch (e) { /* ignore */ }
            this.currentCommandEncoder = null;
        }

        this.device?.destroy(); // This is the main cleanup for WebGPU resources
        this.device = null;
        this.context = null;
        console.log("WebGPU Adapter destroyed.");
    }
}