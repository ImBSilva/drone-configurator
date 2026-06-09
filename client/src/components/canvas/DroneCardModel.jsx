import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const VARIANTS = {
  'sx1': {
    frame: '#1a1a2e',
    accent: '#ff5500',
    arms: 0.55,
    scale: 0.7,
    payload: 'gimbal',
  },
  'ag1': {
    frame: '#4a5d23',
    accent: '#22c55e',
    arms: 0.65,
    scale: 0.85,
    payload: 'multispectral',
  },
  'gp1': {
    frame: '#1e3a5f',
    accent: '#06b6d4',
    arms: 0.6,
    scale: 0.8,
    payload: 'lidar',
  },
  'nx1': {
    frame: '#0a0a0a',
    accent: '#ef4444',
    arms: 0.5,
    scale: 0.75,
    payload: 'thermal',
  },
  'sp1': {
    frame: '#c4a46c',
    accent: '#2563eb',
    arms: 0.5,
    scale: 0.65,
    payload: 'gimbal',
  },
  'cx1': {
    frame: '#2d2d3d',
    accent: '#eab308',
    arms: 0.58,
    scale: 0.8,
    payload: 'rtk',
  },
}

export function DroneCardModel({ variant = 'sx1', rotate = false }) {
  const groupRef = useRef()
  const propRefs = [useRef(), useRef(), useRef(), useRef()]
  const config = VARIANTS[variant] || VARIANTS.sx1

  useFrame((_, delta) => {
    if (rotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 1.2
    }
    propRefs.forEach(ref => {
      if (ref.current) {
        ref.current.rotation.y += delta * 20
      }
    })
  })

  const a = config.arms

  const ArmConfig = [
    { rot: Math.PI / 4, x: a * 0.55, z: a * 0.55 },
    { rot: -Math.PI / 4, x: -a * 0.55, z: a * 0.55 },
    { rot: (3 * Math.PI) / 4, x: a * 0.55, z: -a * 0.55 },
    { rot: -(3 * Math.PI) / 4, x: -a * 0.55, z: -a * 0.55 },
  ]

  return (
    <group ref={groupRef} scale={[config.scale, config.scale, config.scale]} dispose={null}>
      <mesh castShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.5]} />
        <meshStandardMaterial color={config.frame} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[0.46, 0.02, 0.46]} />
        <meshStandardMaterial color={config.accent} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.131, 0.1]}>
        <boxGeometry args={[0.15, 0.002, 0.08]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {ArmConfig.map((arm, i) => (
        <group key={i} position={[0, 0.05, 0]} rotation={[0, arm.rot, 0]}>
          <mesh castShadow position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, a]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.12]} />
            <meshStandardMaterial color={config.accent} roughness={0.3} metalness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.04, 0.5]}>
            <cylinderGeometry args={[0.06, 0.06, 0.06]} />
            <meshStandardMaterial color="#333" roughness={0.4} metalness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.08, 0.5]}>
            <cylinderGeometry args={[0.045, 0.045, 0.03]} />
            <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0.11, 0.5]}>
            <cylinderGeometry args={[0.02, 0.02, 0.03]} />
            <meshStandardMaterial color={config.accent} />
          </mesh>
          <group ref={propRefs[i]} position={[0, 0.125, 0.5]}>
            <mesh castShadow position={[0, 0, 0.18]}>
              <boxGeometry args={[0.03, 0.005, 0.35]} />
              <meshStandardMaterial color="#0c0c0c" transparent opacity={0.85} roughness={0.1} />
            </mesh>
            <mesh castShadow position={[0, 0, -0.18]}>
              <boxGeometry args={[0.03, 0.005, 0.35]} />
              <meshStandardMaterial color="#0c0c0c" transparent opacity={0.85} roughness={0.1} />
            </mesh>
            <mesh castShadow>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial color="#111" />
            </mesh>
          </group>
        </group>
      ))}

      {/* Battery */}
      <mesh castShadow position={[0, 0.17, -0.05]}>
        <boxGeometry args={[0.16, 0.1, 0.28]} />
        <meshStandardMaterial color="#2e2e3a" roughness={0.6} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.17, -0.05]} scale={[1.02, 1.02, 0.5]}>
        <boxGeometry args={[0.16, 0.1, 0.1]} />
        <meshStandardMaterial color={config.accent} />
      </mesh>

      {/* Payload based on variant */}
      {config.payload === 'gimbal' && (
        <group position={[0, -0.1, 0.2]}>
          <mesh castShadow position={[0, 0.05, -0.05]}>
            <boxGeometry args={[0.04, 0.1, 0.04]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh castShadow position={[0, 0, -0.05]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.08]} />
            <meshStandardMaterial color={config.accent} />
          </mesh>
          <group position={[0, -0.04, 0.02]}>
            <mesh castShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color="#222" roughness={0.3} metalness={0.7} />
            </mesh>
            <mesh position={[0, 0, 0.055]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.03, 0.04, 0.04]} />
              <meshStandardMaterial color="#050505" roughness={0} metalness={1} />
            </mesh>
            <mesh position={[0, 0, 0.076]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.002]} />
              <meshBasicMaterial color="#00f0ff" opacity={0.6} transparent />
            </mesh>
          </group>
        </group>
      )}

      {config.payload === 'multispectral' && (
        <group position={[0, -0.1, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.08, 0.08]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {[0, 1, 2, 3].map(j => (
            <mesh key={j} position={[-0.04 + j * 0.027, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.02]} />
              <meshStandardMaterial color={['#22c55e', '#eab308', '#ef4444', '#06b6d4'][j]} />
            </mesh>
          ))}
        </group>
      )}

      {config.payload === 'lidar' && (
        <group position={[0, -0.1, 0.2]}>
          <mesh castShadow position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.08]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0.09, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.015]} />
            <meshStandardMaterial color="#06b6d4" />
          </mesh>
          <mesh position={[0, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.06]} />
            <meshBasicMaterial color="#00f0ff" opacity={0.4} transparent />
          </mesh>
        </group>
      )}

      {config.payload === 'thermal' && (
        <group position={[0, -0.1, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.06, 0.06]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.035, 0.03]} />
            <meshStandardMaterial color="#111" roughness={0} metalness={1} />
          </mesh>
          <mesh position={[0, 0, 0.061]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.015, 0.03, 32]} />
            <meshBasicMaterial color="#ef4444" opacity={0.8} transparent side={2} />
          </mesh>
        </group>
      )}

      {config.payload === 'rtk' && (
        <group position={[0, -0.1, 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.06, 0.08]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.06]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[0, 0.11, 0]}>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
        </group>
      )}

      {/* Landing Gear */}
      {[
        { x: 0.15, side: 1 },
        { x: -0.15, side: -1 },
      ].map((skid, idx) => (
        <group key={`skid-${idx}`} position={[skid.x, -0.1, 0]}>
          <mesh castShadow position={[0, 0, 0]} rotation={[0.2, 0, skid.side * 0.1]}>
            <cylinderGeometry args={[0.015, 0.015, 0.28]} />
            <meshStandardMaterial color="#151515" />
          </mesh>
          <mesh castShadow position={[0, 0, -0.1]} rotation={[-0.2, 0, skid.side * 0.1]}>
            <cylinderGeometry args={[0.015, 0.015, 0.28]} />
            <meshStandardMaterial color="#151515" />
          </mesh>
          <mesh castShadow position={[0, -0.14, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.016, 0.48]} />
            <meshStandardMaterial color={config.frame} />
          </mesh>
          <mesh castShadow position={[0, -0.14, 0.24]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={config.accent} />
          </mesh>
          <mesh castShadow position={[0, -0.14, -0.24]}>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshStandardMaterial color={config.accent} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
