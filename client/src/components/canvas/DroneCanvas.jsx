import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Center } from '@react-three/drei'
import { DroneModel } from './DroneModel'

export function DroneCanvas({ wireframe = false, rotate = false }) {
  return (
    <div className="w-full h-full min-h-[350px] relative bg-industrial-bg rounded border border-industrial-border overflow-hidden">
      {/* Blueprint grid layout backdrop */}
      <div className="absolute inset-0 bg-blueprint pointer-events-none opacity-20 z-0"></div>
      
      {/* 3D R3F Canvas */}
      <Canvas
        shadows
        camera={{ position: [1.8, 1.2, 1.8], fov: 45 }}
        className="relative z-10 w-full h-full"
      >
        <color attach="background" args={['#141416']} />
        
        {/* Soft atmospheric lighting */}
        <ambientLight intensity={0.5} />
        
        <directionalLight
          castShadow
          position={[5, 10, 5]}
          intensity={1.5}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-2}
          shadow-camera-right={2}
          shadow-camera-top={2}
          shadow-camera-bottom={-2}
        />
        
        <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#00d2ff" />
        
        {/* Ground grid shadow helper */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.4} />
        </mesh>

        <Suspense fallback={null}>
          <Center>
            <DroneModel wireframe={wireframe} rotate={rotate} />
          </Center>
        </Suspense>

        {/* Orbit Controls for viewer interaction */}
        <OrbitControls 
          enableDamping
          dampingFactor={0.05}
          minDistance={1.0}
          maxDistance={4.0}
          maxPolarAngle={Math.PI / 1.8} // Prevent looking completely under the floor
        />
      </Canvas>

      {/* Control Instruction Overlay */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none font-mono text-[9px] text-industrial-muted uppercase tracking-wider bg-industrial-bg/80 px-2 py-1 border border-industrial-border/50 rounded">
        Drag: Orbit · Scroll: Zoom
      </div>
    </div>
  )
}
