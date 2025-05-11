import ShaderLib from "../index";
import { BindGroupLayout, ComputeShaderConfig, ShaderBuffer } from "../types";

export class ComputeShaderManager {
    private device: GPUDevice;
    private computePipelines: Map<string, GPUComputePipeline> = new Map();
    private bindGroups: Map<string, GPUBindGroup> = new Map();
    private buffers: Map<string, GPUBuffer> = new Map();

    constructor(device: GPUDevice) {
        this.device = device;
    }

    async initParticleSystem(numParticles: number) {
        const particleBufferSize = numParticles * 48; // size of Particle struct
        const particleBuffer = this.createBuffer('particles', {
            size: particleBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type: 'storage' }
                }
            ]
        });

        await this.createComputePipeline('particleSystem', {
            source: ShaderLib.Compute.ParticleSystem,
            workgroupSize: [256, 1, 1],
            bindGroups: [{
                binding: 0,
                visibility: GPUShaderStage.COMPUTE,
                type: 'storage'
            }]
        });
    }

    async initFluidSimulation(width: number, height: number) {
        const size = width * height;
        const velocityBuffer = this.createBuffer('velocity', {
            size: size * 8, // vec2 array
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const pressureBuffer = this.createBuffer('pressure', {
            size: size * 4, // float array
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const densityBuffer = this.createBuffer('density', {
            size: size * 4, // float array
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        await this.createComputePipeline('fluidSimulation', {
            source: ShaderLib.Compute.FluidSimulation,
            workgroupSize: [8, 8, 1],
            bindGroups: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    type: 'storage'
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    type: 'storage'
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    type: 'storage'
                }
            ]
        });
    }

    async initClothSimulation(width: number, height: number) {
        const numVertices = width * height;
        const numConstraints = (width - 1) * height + width * (height - 1);

        const vertexBuffer = this.createBuffer('vertices', {
            size: numVertices * 56, // size of Vertex struct
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const constraintBuffer = this.createBuffer('constraints', {
            size: numConstraints * 12, // size of Constraint struct
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        await this.createComputePipeline('clothSimulation', {
            source: ShaderLib.Compute.ClothSimulation,
            workgroupSize: [32, 32, 1],
            bindGroups: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    type: 'storage'
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    type: 'storage'
                }
            ]
        });
    }

    async initRaymarching(
        width: number,
        height: number,
        maxSteps: number,
        maxDistance: number,
        epsilon: number,
        config: {
            aoStrength?: number;
            aoStepSize?: number;
            shadowSoftness?: number;
            reflectionStrength?: number;
            refractionIndex?: number;
        } = {}
    ) {
        const outputBufferSize = width * height * 4; // RGBA32Float
        const outputBuffer = this.createBuffer('output', {
            size: outputBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        });

        const uniformBufferSize = 32; // Camera data: position(4), direction(4), up(4)
        const uniformBuffer = this.createBuffer('camera', {
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const configBuffer = this.createBuffer('config', {
            size: 32, // maxSteps(4), maxDistance(4), epsilon(4), aoStrength(4), aoStepSize(4), shadowSoftness(4), reflectionStrength(4), refractionIndex(4)
            usage: GPUBufferUsage.UNIFORM,
            data: new Float32Array([
                maxSteps,
                maxDistance,
                epsilon,
                config.aoStrength ?? 1.0,
                config.aoStepSize ?? 0.2,
                config.shadowSoftness ?? 16.0,
                config.reflectionStrength ?? 0.5,
                config.refractionIndex ?? 1.5
            ]).buffer
        });

        await this.createComputePipeline('raymarching', {
            source: ShaderLib.Compute.Raymarching,
            workgroupSize: [8, 8, 1],
            bindGroups: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    type: 'storage'
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    type: 'uniform'
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    type: 'uniform'
                }
            ]
        });
    }

    private async createComputePipeline(name: string, config: ComputeShaderConfig) {
        const bindGroupLayout = this.device.createBindGroupLayout({
            entries: config.bindGroups.map((layout, index) => ({
                binding: layout.binding,
                visibility: GPUShaderStage.COMPUTE,
                buffer: { type: layout.type as GPUBufferBindingType }
            }))
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayout]
        });

        const pipeline = await this.device.createComputePipelineAsync({
            layout: pipelineLayout,
            compute: {
                module: this.device.createShaderModule({
                    code: config.source
                }),
                entryPoint: 'main',
                constants: {
                    workgroupSizeX: config.workgroupSize[0],
                    workgroupSizeY: config.workgroupSize[1],
                    workgroupSizeZ: config.workgroupSize[2]
                }
            }
        });

        this.computePipelines.set(name, pipeline);
    }

    private createBuffer(name: string, config: ShaderBuffer): GPUBuffer {
        const buffer = this.device.createBuffer({
            size: config.size,
            usage: config.usage,
            mappedAtCreation: config.data !== undefined
        });

        if (config.data) {
            new Float32Array(buffer.getMappedRange()).set(new Float32Array(config.data));
            buffer.unmap();
        }

        this.buffers.set(name, buffer);
        return buffer;
    }

    dispatch(name: string, workgroupCountX: number, workgroupCountY: number = 1, workgroupCountZ: number = 1) {
        const pipeline = this.computePipelines.get(name);
        const bindGroup = this.bindGroups.get(name);

        if (!pipeline || !bindGroup) {
            throw new Error(`Compute pipeline or bind group not found for ${name}`);
        }

        const commandEncoder = this.device.createCommandEncoder();
        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(pipeline);
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY, workgroupCountZ);
        passEncoder.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }

    getBuffer(name: string): GPUBuffer | undefined {
        return this.buffers.get(name);
    }

    updateBuffer(name: string, data: Float32Array) {
        const buffer = this.buffers.get(name);
        if (buffer) {
            this.device.queue.writeBuffer(buffer, 0, data);
        }
    }

    resizeBuffers(name: string, width: number, height: number) {
        if (name === 'raymarching') {
            const outputBufferSize = width * height * 4;
            const newOutputBuffer = this.createBuffer('output', {
                size: outputBufferSize,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
            });
            this.buffers.set('output', newOutputBuffer);
        }
    }
}