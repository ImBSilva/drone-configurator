# Arquitetura 3D — DRØNE Configurator

## Stack

React Three Fiber v9 + Drei v10 + Three.js 0.184.

## Status atual

| Componente | Abordagem | Situação |
|-----------|-----------|----------|
| `DroneModel.jsx` | Geometria procedural (primitivas) | ✅ Funcional, mas sem variação visual |
| `DroneCardModel.jsx` | Geometria procedural (primitivas) | ✅ Funcional, 6 variantes por código |
| `DroneModelGLTF.jsx` | `.glb` com encaixe por Empties | ❌ Não existe — **pendente** |
| Modelos `.glb` em `public/` | — | ❌ Não existem — **pendente** |

## Arquivos atuais

| Arquivo | Função |
|---------|--------|
| `client/src/components/canvas/DroneCanvas.jsx` | Container `<Canvas>` com iluminação, chão, OrbitControls |
| `client/src/components/canvas/DroneModel.jsx` | Drone 3D principal (Configurador + LandingPage) — geometria procedural, só muda cor e escala |
| `client/src/components/canvas/DroneCardModel.jsx` | Versão simplificada com 6 variantes visuais para Catálogo |

## Limitação atual

Trocar peças no Configurador **não altera a forma 3D**. Câmera "4K 60fps" e "Térmica + 4K" são visualmente idênticas. Resolução: migrar para `.glb`.

## Roteiro de migração para .glb

### Pendências (por fazer)

- [ ] Modelar frames no Blender com Empties de encaixe
- [ ] Modelar partes (motor, bateria, câmera, hélices)
- [ ] Exportar como `.glb` para `client/public/frames/` e `client/public/parts/`
- [ ] Criar `DroneModelGLTF.jsx` com `useGLTF` + lógica de encaixe
- [ ] Trocar `DroneModel` por `DroneModelGLTF` no `DroneCanvas.jsx`
- [ ] (Opcional) Upload de textura personalizada com `TextureLoader`

### Estrutura de arquivos (destino)

```
client/public/
├── frames/
│   ├── drone-carbon.glb
│   ├── drone-nano.glb
│   ├── drone-race.glb
│   ├── drone-sx1.glb
│   ├── drone-ag1.glb
│   └── drone-gp1.glb
│
├── parts/
│   ├── motor.glb
│   ├── prop-5.glb
│   ├── prop-7.glb
│   ├── battery-6s.glb
│   ├── battery-4s.glb
│   ├── camera-4k.glb
│   ├── camera-thermal.glb
│   ├── camera-6k.glb
│   └── camera-1080p.glb
```

### Hierarquia dentro de cada frame .glb

```
drone-carbon.glb
├── Hub (Mesh)
├── Arm_FR (Mesh)
├── Arm_FL (Mesh)
├── Arm_BR (Mesh)
├── Arm_BL (Mesh)
├── Landing_Gear (Group)
│   ├── Leg_FR (Mesh)
│   ├── Leg_FL (Mesh)
│   ├── Skid_F (Mesh)
│   └── Skid_B (Mesh)
│
├── attach_motor_FR (Empty)    ← posição exata do motor
├── attach_motor_FL (Empty)
├── attach_motor_BR (Empty)
├── attach_motor_BL (Empty)
├── attach_battery (Empty)     ← posição da bateria
├── attach_camera (Empty)      ← posição da câmera
│
└── pivot_prop_FR (Empty)      ← centro de rotação da hélice
    └── pivot_prop_FL (Empty)
    └── pivot_prop_BR (Empty)
    └── pivot_prop_BL (Empty)
```

Os **Empties** são a chave da modularidade: o código lê a `position` de cada Empty e instancia a peça ali. Nomes **idênticos** em todos os frames.

### Lógica no código (genérica)

```jsx
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useDroneState } from '../../hooks/useDroneState'

export function DroneModel({ wireframe, rotate }) {
  const { parts, colors } = useDroneState()
  const groupRef = useRef()

  const { scene: frameScene } = useGLTF(`/frames/drone-${parts.frame.modelId}.glb`)
  const { scene: motorScene } = useGLTF('/parts/motor.glb')
  const { scene: propScene } = useGLTF(`/parts/prop-${parts.props.propId}.glb`)
  const { scene: batteryScene } = useGLTF(`/parts/battery-${parts.battery.batteryId}.glb`)
  const { scene: cameraScene } = useGLTF(`/parts/camera-${parts.camera.cameraId}.glb`)

  useEffect(() => {
    frameScene.traverse((child) => {
      if (child.isMesh) {
        if (child.material.name === 'Material_Frame')
          child.material.color.set(COLOR_MAPS[colors.frame])
        if (child.material.name === 'Material_Accent')
          child.material.color.set(COLOR_MAPS[colors.accent])
      }
    })
  }, [colors, frameScene])

  useFrame((_, delta) => {
    ;['FR', 'FL', 'BR', 'BL'].forEach(side => {
      const pivot = frameScene.getObjectByName(`pivot_prop_${side}`)
      if (pivot) pivot.rotation.y += delta * 25
    })
    if (rotate && groupRef.current) groupRef.current.rotation.y += delta * 0.5
  })

  return (
    <group ref={groupRef}>
      <primitive object={frameScene} />
      {['FR', 'FL', 'BR', 'BL'].map(side => {
        const a = frameScene.getObjectByName(`attach_motor_${side}`)
        return <primitive key={side} object={motorScene.clone()} position={a?.position} />
      })}
      {['FR', 'FL', 'BR', 'BL'].map(side => {
        const p = frameScene.getObjectByName(`pivot_prop_${side}`)
        return <primitive key={`prop-${side}`} object={propScene.clone()} position={p?.position} />
      })}
      {(() => {
        const b = frameScene.getObjectByName('attach_battery')
        return <primitive object={batteryScene} position={b?.position} />
      })()}
      {(() => {
        const c = frameScene.getObjectByName('attach_camera')
        return <primitive object={cameraScene} position={c?.position} />
      })()}
    </group>
  )
}
```

### Hélices — pivot no centro do motor

```
Prop_FR (Group) — pivot em (0,0,0) = centro do motor
├── Blade_1 (Mesh) — position: [0.18, 0, 0]
└── Blade_2 (Mesh) — position: [-0.18, 0, 0]
```

Rotaciona o **grupo**, não as pás individualmente.

## Materiais — nomenclatura no Blender

| Nome do material | Função | Mapa dinâmico? |
|-----------------|--------|----------------|
| `Material_Frame` | Hub + braços + trem | Cor via `material.color.set()` |
| `Material_Accent` | Detalhes decorativos | Cor via `material.color.set()` |
| `Material_Motor` | Motores (cor fixa) | Não |
| `Material_Prop` | Hélices (preto fumê) | Não |
| `Material_Battery` | Bateria | Opcional |
| `Material_Camera` | Corpo da câmera | Opcional |

## Mapas de textura

| Mapa | Precisa? | Uso |
|------|----------|-----|
| Base Color | **Sim** | Textura principal (substituível por upload) |
| Normal | **Recomendo** | Relevo (fibra de carbono, parafusos) |
| Roughness | **Recomendo** | Brilho diferencial |
| Metalness | **Recomendo** | Metal vs. não-metal |
| Opacity | **Hélices e lentes** | Transparência |
| Emissive | **LEDs** | Pontos de luz coloridos |
| Displacement | **Não** — prefira Normal | Muito caro |

## Pintura customizada (upload de imagem)

```jsx
import { useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'

const texture = useLoader(TextureLoader, imageUrl)
// Aplica via scene.traverse:
// child.material.map = texture
// child.material.needsUpdate = true
```

**Pré-requisito:** UV unwrap no Blender nas meshes que receberão textura.

## Checklist de implementação

### Blender (modelagem)

- [ ] **1.** Modelar cada frame com **Empties de encaixe** (`attach_motor_*`, `attach_battery`, `attach_camera`, `pivot_prop_*`)
- [ ] **2.** Fazer UV unwrap nas meshes que receberão textura
- [ ] **3.** Nomear materiais conforme tabela abaixo (`Material_Frame`, `Material_Accent`, etc.)
- [ ] **4.** Exportar como `.glb` com texturas embutidas
- [ ] **5.** Modelar partes avulsas (motor, bateria, câmera, hélices) e exportar como `.glb`

### Código (React)

- [ ] **6.** Criar `client/src/components/canvas/DroneModelGLTF.jsx` com `useGLTF` + lógica de encaixe por `getObjectByName`
- [ ] **7.** Trocar `DroneModel` por `DroneModelGLTF` no `DroneCanvas.jsx`
- [ ] **8.** (Opcional) Adicionar upload de imagem + `TextureLoader` para pintura customizada
