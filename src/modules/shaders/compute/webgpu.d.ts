export {};

declare global {
    interface GPUBufferUsage {
        STORAGE: number;
        COPY_DST: number;
        COPY_SRC: number;
        UNIFORM: number;
        VERTEX: number;
        INDEX: number;
    }

    interface GPUShaderStage {
        COMPUTE: number;
        VERTEX: number;
        FRAGMENT: number;
    }

    interface GPUDevice {
        createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
        createBindGroupLayout(descriptor: GPUBindGroupLayoutDescriptor): GPUBindGroupLayout;
        createPipelineLayout(descriptor: GPUPipelineLayoutDescriptor): GPUPipelineLayout;
        createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
        createComputePipelineAsync(descriptor: GPUComputePipelineDescriptor): Promise<GPUComputePipeline>;
        createCommandEncoder(): GPUCommandEncoder;
        queue: GPUQueue;
    }

    interface GPUBuffer {
        getMappedRange(): ArrayBuffer;
        unmap(): void;
    }

    interface GPUBindGroup {}
    interface GPUBindGroupLayout {}
    interface GPUPipelineLayout {}
    interface GPUShaderModule {}
    interface GPUComputePipeline {}

    interface GPUCommandEncoder {
        beginComputePass(): GPUComputePassEncoder;
        finish(): GPUCommandBuffer;
    }

    interface GPUComputePassEncoder {
        setPipeline(pipeline: GPUComputePipeline): void;
        setBindGroup(index: number, bindGroup: GPUBindGroup): void;
        dispatchWorkgroups(x: number, y?: number, z?: number): void;
        end(): void;
    }

    interface GPUQueue {
        submit(commandBuffers: GPUCommandBuffer[]): void;
    }

    interface GPUCommandBuffer {}

    interface GPUBufferDescriptor {
        size: number;
        usage: number;
        mappedAtCreation?: boolean;
    }

    interface GPUBindGroupLayoutDescriptor {
        entries: GPUBindGroupLayoutEntry[];
    }

    interface GPUBindGroupLayoutEntry {
        binding: number;
        visibility: number;
        buffer?: {
            type: GPUBufferBindingType;
        };
    }

    type GPUBufferBindingType = 'uniform' | 'storage' | 'read-only-storage';

    interface GPUPipelineLayoutDescriptor {
        bindGroupLayouts: GPUBindGroupLayout[];
    }

    interface GPUShaderModuleDescriptor {
        code: string;
    }

    interface GPUComputePipelineDescriptor {
        layout: GPUPipelineLayout;
        compute: {
            module: GPUShaderModule;
            entryPoint: string;
            constants?: {
                [key: string]: number;
            };
        };
    }
}

export type {
    GPUDevice,
    GPUBuffer,
    GPUBufferUsage,
    GPUShaderStage,
    GPUBindGroup,
    GPUBindGroupLayout,
    GPUPipelineLayout,
    GPUShaderModule,
    GPUComputePipeline,
    GPUCommandEncoder,
    GPUComputePassEncoder,
    GPUQueue,
    GPUCommandBuffer,
    GPUBufferDescriptor,
    GPUBindGroupLayoutDescriptor,
    GPUBindGroupLayoutEntry,
    GPUBufferBindingType,
    GPUPipelineLayoutDescriptor,
    GPUShaderModuleDescriptor,
    GPUComputePipelineDescriptor
};