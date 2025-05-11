import { ComputeShaderManager } from "../ComputeShaderManager";

/// <reference path="../webgpu.d.ts" />

export interface RaymarchingConfig {
    maxSteps?: number;
    maxDistance?: number;
    epsilon?: number;
    aoStrength?: number;
    aoStepSize?: number;
    shadowSoftness?: number;
    reflectionStrength?: number;
    refractionIndex?: number;
}

export class RaymarchingExample {
    private computeManager: ComputeShaderManager;
    private width: number;
    private height: number;
    private config: Required<RaymarchingConfig>;

    constructor(
        device: GPUDevice,
        width: number = window.innerWidth,
        height: number = window.innerHeight,
        config: RaymarchingConfig = {}
    ) {
        this.computeManager = new ComputeShaderManager(device);
        this.width = width;
        this.height = height;
        this.config = {
            maxSteps: config.maxSteps ?? 100,
            maxDistance: config.maxDistance ?? 100.0,
            epsilon: config.epsilon ?? 0.001,
            aoStrength: config.aoStrength ?? 1.0,
            aoStepSize: config.aoStepSize ?? 0.2,
            shadowSoftness: config.shadowSoftness ?? 16.0,
            reflectionStrength: config.reflectionStrength ?? 0.5,
            refractionIndex: config.refractionIndex ?? 1.5
        };
    }

    async init() {
        await this.computeManager.initRaymarching(
            this.width,
            this.height,
            this.config.maxSteps,
            this.config.maxDistance,
            this.config.epsilon,
            {
                aoStrength: this.config.aoStrength,
                aoStepSize: this.config.aoStepSize,
                shadowSoftness: this.config.shadowSoftness,
                reflectionStrength: this.config.reflectionStrength,
                refractionIndex: this.config.refractionIndex
            }
        );
    }

    update(camera: { position: Float32Array; direction: Float32Array; up: Float32Array }) {
        // Calculate workgroup counts based on local size of 8x8
        const workgroupCountX = Math.ceil(this.width / 8);
        const workgroupCountY = Math.ceil(this.height / 8);

        // Update camera uniform buffer before dispatch
        const cameraBuffer = this.computeManager.getBuffer('camera');
        if (cameraBuffer) {
            this.computeManager.updateBuffer('camera', new Float32Array([
                ...camera.position,
                ...camera.direction,
                ...camera.up
            ]));
        }

        this.computeManager.dispatch('raymarching', workgroupCountX, workgroupCountY);
    }

    getOutputBuffer(): GPUBuffer | undefined {
        return this.computeManager.getBuffer('output');
    }

    resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.computeManager.resizeBuffers('raymarching', width, height);
    }

    updateConfig(config: Partial<RaymarchingConfig>) {
        this.config = {
            ...this.config,
            ...config
        };

        const configBuffer = this.computeManager.getBuffer('config');
        if (configBuffer) {
            this.computeManager.updateBuffer('config', new Float32Array([
                this.config.maxSteps,
                this.config.maxDistance,
                this.config.epsilon,
                this.config.aoStrength,
                this.config.aoStepSize,
                this.config.shadowSoftness,
                this.config.reflectionStrength,
                this.config.refractionIndex
            ]));
        }
    }
}