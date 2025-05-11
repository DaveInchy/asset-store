import { ComputeShaderManager } from "../ComputeShaderManager";

/// <reference path="../webgpu.d.ts" />


export class ParticleSystemExample {
    private computeManager: ComputeShaderManager;
    private numParticles: number;

    constructor(device: GPUDevice, numParticles: number = 10000) {
        this.computeManager = new ComputeShaderManager(device);
        this.numParticles = numParticles;
    }

    async init() {
        await this.computeManager.initParticleSystem(this.numParticles);
    }

    update() {
        // Calculate workgroup count based on local size of 256
        const workgroupCount = Math.ceil(this.numParticles / 256);
        this.computeManager.dispatch('particleSystem', workgroupCount);
    }

    getParticleBuffer(): GPUBuffer | undefined {
        return this.computeManager.getBuffer('particles');
    }
}