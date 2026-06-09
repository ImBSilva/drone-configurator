import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { Center } from '@react-three/drei'
import { Button } from '../components/ui/Button'
import { Shield, Sprout, Map, Eye, Crosshair, Plus, Check, FolderPlus, X } from 'lucide-react'
import { DroneCardModel } from '../components/canvas/DroneCardModel'
import { useDroneStore } from '../store/droneStore'

const CATEGORY_MISSION_MAP = {
  vigilancia: 'vigilancia',
  agricultura: 'agricultura',
  geo: 'mapeamento',
  industrial: 'industrial',
}

const drones = [
  {
    id: 'sx1',
    code: 'SX-1',
    tag: 'Vigilância',
    name: 'Sentinel X1',
    desc: 'Drone de vigilância tática com câmera térmica FLIR, transmissão criptografada e autonomia estendida. Ideal para segurança patrimonial e operações noturnas.',
    specs: [
      { lbl: 'Autonomia', val: '360 min' },
      { lbl: 'Alcance', val: '18 km' },
      { lbl: 'Peso', val: '2.1 kg' },
      { lbl: 'Carga', val: '1.5 kg' },
    ],
    price: '$2,449',
    icon: Eye,
    categories: ['vigilancia'],
  },
  {
    id: 'ag1',
    code: 'AG-1',
    tag: 'Agricultura',
    name: 'AgriScan A1',
    desc: 'Drone agrícola com sensor multiespectral NDVI, mapeamento de campo automatizado e pulverização de precisão. Cobre até 40 hectares por hora.',
    specs: [
      { lbl: 'Autonomia', val: '240 min' },
      { lbl: 'Alcance', val: '12 km' },
      { lbl: 'Peso', val: '3.8 kg' },
      { lbl: 'Carga', val: '2.5 kg' },
    ],
    price: '$3,899',
    icon: Sprout,
    categories: ['agricultura'],
  },
  {
    id: 'gp1',
    code: 'GP-1',
    tag: 'Geoespacial',
    name: 'GeoPro GP1',
    desc: 'Drone de mapeamento LiDAR com precisão de 2 cm, fotogrametria de alta resolução e processamento onboard. Para topografia, obras e inspeção.',
    specs: [
      { lbl: 'Autonomia', val: '180 min' },
      { lbl: 'Alcance', val: '15 km' },
      { lbl: 'Peso', val: '3.2 kg' },
      { lbl: 'Precisão', val: '2 cm' },
    ],
    price: '$5,299',
    icon: Map,
    categories: ['geo'],
  },
  {
    id: 'nx1',
    code: 'NX-1',
    tag: 'Vigilância',
    name: 'NightX N1',
    desc: 'Drone noturno com câmera termal de alta sensibilidade (0.05°C), farol IR e transmissão por rádio encriptado. Para operações noturnas e defesa.',
    specs: [
      { lbl: 'Autonomia', val: '300 min' },
      { lbl: 'Alcance', val: '22 km' },
      { lbl: 'Peso', val: '2.8 kg' },
      { lbl: 'Sensibilidade', val: '0.05°C' },
    ],
    price: '$7,899',
    icon: Shield,
    categories: ['vigilancia'],
  },
  {
    id: 'sp1',
    code: 'SP-1',
    tag: 'Multi-uso',
    name: 'Surveyor SP1',
    desc: 'Drone versátil para reconhecimento aéreo e inspeção. Câmera 4K 60fps com gimbal de 3 eixos, ideal para monitoramento de obras e perímetros.',
    specs: [
      { lbl: 'Autonomia', val: '150 min' },
      { lbl: 'Alcance', val: '15 km' },
      { lbl: 'Peso', val: '1.9 kg' },
      { lbl: 'Câmera', val: '4K 60fps' },
    ],
    price: '$1,899',
    icon: Eye,
    categories: ['agricultura', 'industrial'],
  },
  {
    id: 'cx1',
    code: 'CX-1',
    tag: 'Geoespacial',
    name: 'CartoX CX1',
    desc: 'Drone cartográfico com RTK integrado e precisão centimétrica. Geração de ortofotos, modelos 3D e curvas de nível em tempo real.',
    specs: [
      { lbl: 'Autonomia', val: '120 min' },
      { lbl: 'Alcance', val: '10 km' },
      { lbl: 'Precisão', val: '1 cm' },
      { lbl: 'RTK', val: 'integrado' },
    ],
    price: '$8,499',
    icon: Crosshair,
    categories: ['geo'],
  },
]

const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'vigilancia', label: 'Vigilância' },
  { key: 'agricultura', label: 'Agricultura' },
  { key: 'geo', label: 'Geoespacial' },
  { key: 'industrial', label: 'Industrial' },
]

function FleetSelector({ drone, onClose }) {
  const { fleets, createFleet, addCatalogToFleet } = useDroneStore()
  const [newFleetName, setNewFleetName] = useState('')
  const [showNew, setShowNew] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (showNew && inputRef.current) inputRef.current.focus()
  }, [showNew])

  const handleAdd = (fleetId) => {
    addCatalogToFleet(drone, fleetId)
    onClose()
  }

  const handleCreateAndAdd = () => {
    const name = newFleetName.trim()
    if (!name) return
    const fleet = createFleet(name)
    addCatalogToFleet(drone, fleet.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-industrial-bg border border-industrial-border p-6 w-80 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-tight">Adicionar à Frota</h3>
          <button onClick={onClose} className="text-industrial-muted hover:text-industrial-fg cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <p className="text-xs text-industrial-fg-secondary mb-4">
          Selecione a frota para <strong>{drone.name}</strong>:
        </p>

        {fleets.length === 0 && !showNew && (
          <p className="text-xs text-industrial-muted mb-4 italic">Nenhuma frota criada ainda.</p>
        )}

        <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
          {fleets.map(f => (
            <button
              key={f.id}
              onClick={() => handleAdd(f.id)}
              className="w-full text-left px-3 py-2 border border-industrial-border hover:border-industrial-accent/40 text-xs font-mono text-industrial-fg-secondary hover:text-industrial-fg cursor-pointer transition-colors flex items-center gap-2"
            >
              <FolderPlus size={14} className="text-industrial-accent shrink-0" />
              {f.name}
            </button>
          ))}
        </div>

        {showNew ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newFleetName}
              onChange={e => setNewFleetName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateAndAdd()}
              placeholder="Nome da nova frota"
              className="flex-1 bg-zinc-950 border border-industrial-border px-2 py-1.5 text-xs text-industrial-fg font-mono focus:outline-none focus:border-industrial-accent"
            />
            <Button size="sm" variant="primary" onClick={handleCreateAndAdd} className="text-[10px] font-mono px-2">
              <Check size={12} />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setShowNew(true)}
            className="w-full text-left px-3 py-2 border border-dashed border-industrial-border hover:border-industrial-accent/40 text-xs font-mono text-industrial-accent cursor-pointer transition-colors flex items-center gap-2"
          >
            <Plus size={14} /> Nova Frota
          </button>
        )}
      </div>
    </div>
  )
}

export function Catalog() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [hoveredCard, setHoveredCard] = useState(null)
  const [selectorDrone, setSelectorDrone] = useState(null)
  const navigate = useNavigate()
  const setMissionType = useDroneStore((s) => s.setMissionType)
  const setBuildName = useDroneStore((s) => s.setBuildName)
  const resetEditing = useDroneStore((s) => s.resetEditing)

  const handleCustomize = (drone) => {
    resetEditing()
    const mission = drone.categories
      .map((c) => CATEGORY_MISSION_MAP[c])
      .find(Boolean) || 'outro'
    setMissionType(mission)
    setBuildName(drone.name)
    navigate('/configurator')
  }

  const filtered = activeFilter === 'all'
    ? drones
    : drones.filter(d => d.categories.includes(activeFilter))

  return (
    <div className="flex flex-col min-h-screen bg-industrial-bg text-industrial-fg animate-in">
      
      <div className="pt-16 pb-4 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">
          Catálogo de Drones
        </h1>
        <p className="text-xs sm:text-sm text-industrial-fg-secondary mt-1">
          Modelos prontos para qualquer missão. Escolha o seu e customize completamente.
        </p>
      </div>

      <div className="pb-16 px-6 md:px-12 max-w-7xl mx-auto w-full">
        
        <div className="flex gap-2 flex-wrap mb-8">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 border font-mono text-[10px] uppercase tracking-widest cursor-pointer transition-all duration-150 ${
                activeFilter === f.key
                  ? 'bg-industrial-accent border-industrial-accent text-white'
                  : 'border-industrial-border bg-transparent text-industrial-fg-secondary hover:border-industrial-accent/40 hover:text-industrial-fg'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(drone => (
            <div
              key={drone.id}
              className="border border-industrial-border p-6 flex flex-col bg-industrial-bg"
              onMouseEnter={() => setHoveredCard(drone.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="aspect-[16/10] border border-industrial-border bg-zinc-950/80 mb-4 overflow-hidden">
                <Canvas
                  shadows={false}
                  camera={{ position: [1.6, 1.0, 1.6], fov: 40 }}
                  gl={{ antialias: false }}
                  style={{ pointerEvents: 'none' }}
                >
                  <color attach="background" args={['#0a0a0c']} />
                  <ambientLight intensity={0.6} />
                  <directionalLight position={[3, 6, 3]} intensity={1.2} />
                  <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#00d2ff" />
                  <Center>
                    <DroneCardModel variant={drone.id} rotate={hoveredCard === drone.id} />
                  </Center>
                </Canvas>
              </div>

              <div className="font-mono text-[9px] text-industrial-accent uppercase tracking-[0.12em] mb-1">
                {drone.tag}
              </div>

              <h3 className="text-base font-semibold mb-1">
                {drone.name}
              </h3>

              <p className="text-xs text-industrial-fg-secondary leading-relaxed mb-4 flex-1">
                {drone.desc}
              </p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
                {drone.specs.map((spec, i) => (
                  <div key={i} className="font-mono text-[10px]">
                    <span className="text-industrial-muted">{spec.lbl}</span>{' '}
                    <span className="text-industrial-fg font-semibold">{spec.val}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center py-3 mb-4 border-t border-industrial-border">
                <span className="text-[10px] font-mono text-industrial-muted">Aluguel/mês</span>
                <span className="font-mono text-lg font-bold text-industrial-accent">{drone.price}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-center text-[10px] font-mono"
                  onClick={() => handleCustomize(drone)}
                >
                  Customizar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-[10px] font-mono"
                  onClick={() => setSelectorDrone(drone)}
                >
                  <Plus size={12} /> Adicionar à Frota
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectorDrone && (
        <FleetSelector drone={selectorDrone} onClose={() => setSelectorDrone(null)} />
      )}
    </div>
  )
}

export default Catalog
