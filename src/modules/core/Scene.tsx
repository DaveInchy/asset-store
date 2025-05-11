import React, { Suspense } from "react";
import SunSystem from "mods@components/static/SunSystem";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics, RapierContext, useRapier } from "@react-three/rapier";

export default function Scene({
    children,
    props,
    usePhysics = false,
}: {
    children?: React.ReactNode
    props?: any
    usePhysics?: true | false,
}): JSX.Element {

    return (<>
        <Suspense fallback={<>Loading</>}>
            <Canvas shadows {...props} style={{ width: "100vw", height: "100vh", minWidth: "100vw", minHeight: "100vh" }} className={"w-[100vw] h-[100vh] p-0 m-0 relative"}>
                {/* Main Solar System Scene */}
                <SunSystem
                    scaleMultiplier={0.5} // Adjust scale to fit scene
                    distanceMultiplier={2} // Adjust orbital distances
                />

                {/* Optional physics children */}
                {usePhysics ?
                    <Physics gravity={[0, 0, 0]}>
                        {children}
                    </Physics>
                    : children
                }
            </Canvas>
        </Suspense>
    </>)
}