import { ComputeShaderManager } from "../ComputeShaderManager";

/// <reference path="../webgpu.d.ts" />


export class ClothSimulationExample {
    private computeManager: ComputeShaderManager;
    private width: number;
    private height: number;

    constructor(device: GPUDevice, width: number = 64, height: number = 64) {
        this.computeManager = new ComputeShaderManager(device);
        this.width = width;
        this.height = height;
    }

    async init() {
        await this.computeManager.initClothSimulation(this.width, this.height);
    }

    update() {
        // Calculate workgroup counts based on local size of 32x32
        const workgroupCountX = Math.ceil(this.width / 32);
        const workgroupCountY = Math.ceil(this.height / 32);
        this.computeManager.dispatch('clothSimulation', workgroupCountX, workgroupCountY);
    }

    getVertexBuffer(): GPUBuffer | undefined {
        return this.computeManager.getBuffer('vertices');
    }

    getConstraintBuffer(): GPUBuffer | undefined {
        return this.computeManager.getBuffer('constraints');
    }

    // Helper method to create initial cloth mesh
    createClothMesh() {
        const vertices = new Float32Array(this.width * this.height * 14); // 14 floats per vertex
        const constraints = new Float32Array(
            ((this.width - 1) * this.height + this.width * (this.height - 1)) * 3
        ); // 3 floats per constraint

        let vertexIndex = 0;
        let constraintIndex = 0;

        // Create vertices
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const i = (y * this.width + x) * 14;

                // Position
                vertices[i] = x / (this.width - 1) - 0.5;
                vertices[i + 1] = 0.5;
                vertices[i + 2] = y / (this.height - 1) - 0.5;
                vertices[i + 3] = 1.0;

                // Old position (same as current position initially)
                vertices[i + 4] = vertices[i];
                vertices[i + 5] = vertices[i + 1];
                vertices[i + 6] = vertices[i + 2];
                vertices[i + 7] = 1.0;

                // Normal
                vertices[i + 8] = 0.0;
                vertices[i + 9] = 1.0;
                vertices[i + 10] = 0.0;
                vertices[i + 11] = 0.0;

                // UV
                vertices[i + 12] = x / (this.width - 1);
                vertices[i + 13] = y / (this.height - 1);

                vertexIndex = y * this.width + x;

                // Create horizontal constraints
                if (x < this.width - 1) {
                    const j = constraintIndex * 3;
                    constraints[j] = vertexIndex;
                    constraints[j + 1] = vertexIndex + 1;
                    constraints[j + 2] = 1.0 / (this.width - 1); // rest length
                    constraintIndex++;
                }

                // Create vertical constraints
                if (y < this.height - 1) {
                    const j = constraintIndex * 3;
                    constraints[j] = vertexIndex;
                    constraints[j + 1] = vertexIndex + this.width;
                    constraints[j + 2] = 1.0 / (this.height - 1); // rest length
                    constraintIndex++;
                }
            }
        }

        return {
            vertices,
            constraints
        };
    }
}