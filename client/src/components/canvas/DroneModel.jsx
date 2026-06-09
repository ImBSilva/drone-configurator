import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useDroneState } from '../../hooks/useDroneState'

const COLOR_MAPS = {
  // Frame colors
  carbon: '#222222',
  white: '#e8e8e8',
  orange: '#ff5500',
  blue: '#2563eb',
  olive: '#4a5d23',
  desert: '#c4a46c',
  // Accent colors
  cyan: '#06b6d4',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
}

export function DroneModel({ wireframe = false, rotate = false }) {
  const { colors, parts } = useDroneState()
  
  // Refs for rotating propellers
  const propRefs = [useRef(), useRef(), useRef(), useRef()]
  const droneGroupRef = useRef()

  // Frame color hex
  const frameColor = COLOR_MAPS[colors.frame] || '#222222'
  // Accent color hex
  const accentColor = COLOR_MAPS[colors.accent] || '#ff5500'

  // Animate propellers and overall rotation
  useFrame((state, delta) => {
    // Spin propellers
    propRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.rotation.y += delta * 25
      }
    })

    // Auto rotate the whole drone if enabled
    if (rotate && droneGroupRef.current) {
      droneGroupRef.current.rotation.y += delta * 0.5
    }
  })

  // Determine geometry sizes based on selected frame/parts
  const frameScale = parts.frame.name.includes('Nano') ? 0.6 : parts.frame.name.includes('Pro') ? 1.1 : 1.0

  return (
    <group ref={droneGroupRef} scale={[frameScale, frameScale, frameScale]} dispose={null}>
      {/* Central Hub / Main Body */}
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.5]} />
        <meshStandardMaterial 
          color={frameColor} 
          roughness={0.2} 
          metalness={0.8}
          wireframe={wireframe}
        />
      </mesh>

      {/* Main Body Upper Plate */}
      <mesh castShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[0.46, 0.02, 0.46]} />
        <meshStandardMaterial 
          color={accentColor} 
          roughness={0.3} 
          metalness={0.5}
          wireframe={wireframe}
        />
      </mesh>

      {/* Brand logo/technical decal plate on top */}
      <mesh position={[0, 0.131, 0.1]}>
        <boxGeometry args={[0.15, 0.002, 0.08]} />
        <meshStandardMaterial color="#111111" wireframe={wireframe} />
      </mesh>

      {/* Arms (Quad X configuration) */}
      {[
        { rot: Math.PI / 4, x: 0.35, z: 0.35 },    // Front Right
        { rot: -Math.PI / 4, x: -0.35, z: 0.35 },  // Front Left
        { rot: (3 * Math.PI) / 4, x: 0.35, z: -0.35 }, // Back Right
        { rot: -(3 * Math.PI) / 4, x: -0.35, z: -0.35 } // Back Left
      ].map((arm, index) => (
        <group key={index} position={[0, 0.05, 0]} rotation={[0, arm.rot, 0]}>
          {/* Main carbon fiber arm rod */}
          <mesh castShadow position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.55]} />
            <meshStandardMaterial 
              color="#1a1a1a" 
              roughness={0.5} 
              metalness={0.9} 
              wireframe={wireframe}
            />
          </mesh>

          {/* Accent sleeve on arm */}
          <mesh castShadow position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.12]} />
            <meshStandardMaterial 
              color={accentColor} 
              roughness={0.3} 
              metalness={0.7} 
              wireframe={wireframe}
            />
          </mesh>

          {/* Motor Mount at the end of the arm */}
          <mesh castShadow position={[0, 0.04, 0.5]} receiveShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial 
              color="#333333" 
              roughness={0.4} 
              metalness={0.8}
              wireframe={wireframe}
            />
          </mesh>

          {/* Motor Coil (copper/gold inner detail) */}
          <mesh castShadow position={[0, 0.08, 0.5]}>
            <cylinderGeometry args={[0.045, 0.045, 0.03]} />
            <meshStandardMaterial 
              color="#d4af37" 
              roughness={0.2} 
              metalness={0.9}
              wireframe={wireframe}
            />
          </mesh>

          {/* Propeller Mount Cap */}
          <mesh castShadow position={[0, 0.11, 0.5]}>
            <cylinderGeometry args={[0.02, 0.02, 0.03]} />
            <meshStandardMaterial 
              color={accentColor} 
              wireframe={wireframe}
            />
          </mesh>

          {/* Spinning Propeller Blades */}
          <group ref={propRefs[index]} position={[0, 0.125, 0.5]}>
            {/* Blade 1 */}
            <mesh castShadow position={[0, 0, 0.18]}>
              <boxGeometry args={[0.03, 0.005, 0.35]} />
              <meshStandardMaterial 
                color="#0c0c0c" 
                transparent 
                opacity={0.85} 
                roughness={0.1}
                wireframe={wireframe}
              />
            </mesh>
            {/* Blade 2 */}
            <mesh castShadow position={[0, 0, -0.18]}>
              <boxGeometry args={[0.03, 0.005, 0.35]} />
              <meshStandardMaterial 
                color="#0c0c0c" 
                transparent 
                opacity={0.85} 
                roughness={0.1}
                wireframe={wireframe}
              />
            </mesh>
            {/* Center Cap */}
            <mesh castShadow>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#111" wireframe={wireframe} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Battery (Payload bottom or top) */}
      <mesh castShadow position={[0, 0.17, -0.05]}>
        <boxGeometry args={[0.16, 0.1, 0.28]} />
        <meshStandardMaterial 
          color="#2e2e3a" 
          roughness={0.6} 
          metalness={0.1}
          wireframe={wireframe}
        />
      </mesh>

      {/* Battery strap */}
      <mesh position={[0, 0.17, -0.05]} scale={[1.02, 1.02, 0.5]}>
        <boxGeometry args={[0.16, 0.1, 0.1]} />
        <meshStandardMaterial color="#ff5500" wireframe={wireframe} />
      </mesh>

      {/* Camera Gimbal on Bottom Front */}
      {parts.camera && (
        <group position={[0, -0.1, 0.2]}>
          {/* Gimbal Mount Arm */}
          <mesh castShadow position={[0, 0.05, -0.05]}>
            <boxGeometry args={[0.04, 0.1, 0.04]} />
            <meshStandardMaterial color="#1a1a1a" wireframe={wireframe} />
          </mesh>

          {/* Gimbal Pivot Joint */}
          <mesh castShadow position={[0, 0.0, -0.05]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08]} />
            <meshStandardMaterial color={accentColor} wireframe={wireframe} />
          </mesh>

          {/* Camera Payload Box/Cylinder */}
          <group position={[0, -0.04, 0.02]}>
            <mesh castShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial 
                color="#222" 
                roughness={0.3} 
                metalness={0.7}
                wireframe={wireframe}
              />
            </mesh>
            {/* Camera Lens */}
            <mesh position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.04, 0.04]} />
              <meshStandardMaterial 
                color="#050505" 
                roughness={0.0} 
                metalness={1.0}
                wireframe={wireframe}
              />
            </mesh>
            {/* Glass Lens reflection */}
            <mesh position={[0, 0, 0.076]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.002]} />
              <meshBasicMaterial color="#00f0ff" opacity={0.6} transparent />
            </mesh>
          </group>
        </group>
      )}

      {/* Landing Gear Skids */}
      {[
        { x: 0.15, side: 1 },
        { x: -0.15, side: -1 }
      ].map((skid, idx) => (
        <group key={idx} position={[skid.x, -0.1, 0]}>
          {/* Vertical leg strut */}
          <mesh castShadow position={[0, 0, 0]} rotation={[0.2, 0, skid.side * 0.1]}>
            <cylinderGeometry args={[0.015, 0.015, 0.28]} />
            <meshStandardMaterial color="#151515" wireframe={wireframe} />
          </mesh>
          <mesh castShadow position={[0, 0, -0.1]} rotation={[-0.2, 0, skid.side * 0.1]}>
            <cylinderGeometry args={[0.015, 0.015, 0.28]} />
            <meshStandardMaterial color="#151515" wireframe={wireframe} />
          </mesh>
          {/* Horizontal Skid bar */}
          <mesh castShadow position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.48]} />
            <meshStandardMaterial color={frameColor} wireframe={wireframe} />
          </mesh>
          {/* Safety accent cap on landing gear skid tip */}
          <mesh castShadow position={[0, -0.14, 0.24]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={accentColor} wireframe={wireframe} />
          </mesh>
          <mesh castShadow position={[0, -0.14, -0.24]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={accentColor} wireframe={wireframe} />
          </mesh>
        </group>
      ))}

      {/* Safety indicator glowing LED status lights */}
      <pointLight position={[0.2, 0.1, 0.2]} color={accentColor} intensity={0.4} distance={0.5} />
      <pointLight position={[-0.2, 0.1, 0.2]} color={accentColor} intensity={0.4} distance={0.5} />
      <pointLight position={[0.2, 0.1, -0.2]} color="#ff0000" intensity={0.4} distance={0.5} />
      <pointLight position={[-0.2, 0.1, -0.2]} color="#ff0000" intensity={0.4} distance={0.5} />
    </group>
  )
}
