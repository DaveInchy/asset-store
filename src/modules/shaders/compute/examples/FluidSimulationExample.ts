import { ComputeShaderManager } from "../ComputeShaderManager";

/// <reference path="../webgpu.d.ts" />


export class FluidSimulationExample {
    private computeManager: ComputeShaderManager;
    private width: number;
    private height: number;

    constructor(device: GPUDevice, width: number = 256, height: number = 256) {
        this.computeManager = new ComputeShaderManager(device);
        this.width = width;
        this.height = height;
    }

    async init() {
        await this.computeManager.initFluidSimulation(this.width, this.height);
    }

    update() {
        // Calculate workgroup counts based on local size of 8x8
        const workgroupCountX = Math.ceil(this.width / 8);
        const workgroupCountY = Math.ceil(this.height / 8);
        this.computeManager.dispatch('fluidSimulation', workgroupCountX, workgroupCountY);
    }

    getVelocityBuffer(): GPUBuffer | undefined {
        return this.computeManager.getBuffer('velocity');
    }

    getPressureBuffer(): GPUBuffer | undefined {
        return this.computeManager.getBuffer('pressure');
    }

    getDensityBuffer(): GPUBuffer | undefined {
        return this.computeManager.getBuffer('density');
    }
}