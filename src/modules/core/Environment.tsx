import Planet from "mods@components/Planet";
import React from "react";
import Sun from "mods@components/static/Sun";
import Window3D from "./Window3D";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei/web";
import { Vector3 } from "three";

// Scale multiplier to make scene viewable (AU to scene units)
const distanceScale = 10; // 1 AU = 10 units
const sizeScale = 2; // Size multiplier to make planets visible

export default function Environment({
    children,
}: {
    children?: React.ReactNode
}): JSX.Element {
    return (
        <div className={"min-w-[100vw] min-h-[100vh] p-0 m-0 fixed overflow-hidden"}>
            <Window3D usePhysics={false}>
                {/* Main Camera */}
                <PerspectiveCamera makeDefault position={[0, 100, 200]} />
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    maxDistance={1000}
                    minDistance={20}
                />

                {/* Lighting */}
                <ambientLight intensity={0.1} />
                <pointLight position={[0, 0, 0]} intensity={2} />

                {/* Sun (Center of System) */}
                <Sun
                    hasAtmosphere={true}
                    hasRings={false}
                    location={new Vector3(0, 0, 0)}
                    forwardRef={() => { }}
                />

                {/* Planets in order from Sun with real relative distances (AU) */}
                <Planet
                    name="mercury"
                    location={new Vector3(0.387 * distanceScale, 0, 0)}
                    scale={0.383 * sizeScale}
                    hasAtmosphere={false}
                    defaultAtmosphere={false}
                    hasRings={false}
                    defaultRings={false}
                    refCallback={() => { }}
                />
                <Planet
                    name="venus"
                    location={new Vector3(0.723 * distanceScale, 0, 0)}
                    scale={0.949 * sizeScale}
                    hasAtmosphere={true}
                    defaultAtmosphere={true}
                    hasRings={false}
                    defaultRings={false}
                    refCallback={() => { }}
                />
                <Planet
                    name="earth"
                    location={new Vector3(1.0 * distanceScale, 0, 0)}
                    scale={1.0 * sizeScale}
                    hasAtmosphere={true}
                    defaultAtmosphere={true}
                    hasRings={false}
                    defaultRings={false}
                    refCallback={() => { }}
                />
                <Planet
                    name="mars"
                    location={new Vector3(1.524 * distanceScale, 0, 0)}
                    scale={0.532 * sizeScale}
                    hasAtmosphere={true}
                    defaultAtmosphere={false}
                    hasRings={false}
                    defaultRings={false}
                    refCallback={() => { }}
                />
                <Planet
                    name="jupiter"
                    location={new Vector3(5.203 * distanceScale, 0, 0)}
                    scale={11.209 * sizeScale}
                    hasAtmosphere={true}
                    defaultAtmosphere={true}
                    hasRings={true}
                    defaultRings={true}
                    refCallback={() => { }}
                />
                <Planet
                    name="saturn"
                    location={new Vector3(9.537 * distanceScale, 0, 0)}
                    scale={9.449 * sizeScale}
                    hasAtmosphere={true}
                    defaultAtmosphere={true}
                    hasRings={true}
                    defaultRings={true}
                    refCallback={() => { }}
                />
                <Planet
                    name="uranus"
                    location={new Vector3(19.191 * distanceScale, 0, 0)}
                    scale={4.007 * sizeScale}
                    hasAtmosphere={true}
                    defaultAtmosphere={true}
                    hasRings={true}
                    defaultRings={true}
                    refCallback={() => { }}
                />
                <Planet
                    name="neptune"
                    location={new Vector3(30.069 * distanceScale, 0, 0)}
                    scale={3.883 * sizeScale}
                    hasAtmosphere={true}
                    defaultAtmosphere={true}
                    hasRings={true}
                    defaultRings={true}
                    refCallback={() => { }}
                />

                {children}
            </Window3D>
        </div>
    )
}