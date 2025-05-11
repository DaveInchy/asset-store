declare module '*.glsl' {
    const value: string;
    export default value;
}

declare module '*.ffx' {
    const value: string;
    export default value;
}

declare module '*.vfx' {
    const value: string;
    export default value;
}

declare module '*.comp' {
    const value: string;
    export default value;
}

// Shader types
export interface ComputeShaderConfig {
    source: string;
    workgroupSize: [number, number, number];
    bindGroups: BindGroupLayout[];
}

export interface BindGroupLayout {
    binding: number;
    visibility: number;
    type: string;
}

export interface ShaderBuffer {
    size: number;
    usage: number;
    data?: ArrayBuffer;
}