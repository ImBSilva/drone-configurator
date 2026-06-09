import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDroneState } from '../hooks/useDroneState'
import { useDroneStore } from '../store/droneStore'
import { DroneCanvas } from '../components/canvas/DroneCanvas'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SummaryModal } from '../components/SummaryModal'
import {
  Save, Share2, ShieldCheck, FileText,
  RotateCw, RotateCcw, Box,
  FolderPlus, Plus, Check, X
} from 'lucide-react'

// Options data matching reference exactly
const OPTIONS = {
  frame: [
    { name: 'X8 Carbon', price: 199, weight: 220, desc: '220g · braços de 5mm' },
    { name: 'X8 Carbon Pro', price: 249, weight: 195, desc: '195g · braços de 6mm' },
    { name: 'Nano Carbon', price: 149, weight: 80, desc: '80g · braços de 3mm' },
    { name: 'Race X5', price: 179, weight: 140, desc: '140g · braços de 4mm' },
  ],
  battery: [
  { name: '6S 5200mAh', price: 89, weight: 380, flight: 360, desc: '380g · ~360 min voo' },
  { name: '6S 4200mAh', price: 69, weight: 320, flight: 240, desc: '320g · ~240 min voo' },
  { name: '4S 2200mAh', price: 49, weight: 190, flight: 150, desc: '190g · ~150 min voo' },
  { name: '4S 1800mAh', price: 39, weight: 160, flight: 90,  desc: '160g · ~90 min voo' },
  ],
  camera: [
    { name: '4K 60fps', price: 149, weight: 85, desc: 'Sensor 1/1.7" · estabilizado' },
    { name: '6K Cinema', price: 399, weight: 140, desc: 'Sensor S35 · 10-bit' },
    { name: '1080p 120fps', price: 79, weight: 45, desc: 'Sensor 1/3" · leve' },
    { name: 'Térmica + 4K', price: 549, weight: 210, desc: 'FLIR core · câmera dupla' },
  ],
  motor: [
    { name: 'R-Link 2207', price: 120, weight: 128, desc: '1850KV · 32g cada' },
    { name: 'Pro 2208', price: 160, weight: 144, desc: '1750KV · 36g cada' },
    { name: 'Sprint 2306', price: 80, weight: 120, desc: '2450KV · 30g cada' },
    { name: 'Cruise 2806', price: 90, weight: 160, desc: '1350KV · 40g cada' },
  ],
  props: [
    { name: '5" Freestyle', price: 19, weight: 28, desc: 'Policarbonato · 4 unidades' },
    { name: '7" Endurance', price: 29, weight: 36, desc: 'Fibra de carbono · 4 unid.' },
    { name: 'Dobráveis', price: 24, weight: 32, desc: 'Quick-fold · 4 unidades' },
    { name: '3" Racing', price: 15, weight: 20, desc: 'Ultra-leves · 4 unidades' },
  ],
  colorsFrame: [
    { id: 'carbon', name: 'Carbon', color: '#2a2a2a' },
    { id: 'white', name: 'Branco', color: '#e8e8e8' },
    { id: 'orange', name: 'Safety', color: '#ff5500' },
    { id: 'blue', name: 'Azul', color: '#2563eb' },
    { id: 'olive', name: 'Oliva', color: '#4a5d23' },
    { id: 'desert', name: 'Desert', color: '#c4a46c' },
  ],
  colorsAccent: [
    { id: 'orange', name: 'Laranja', color: '#ff5500' },
    { id: 'cyan', name: 'Ciano', color: '#06b6d4' },
    { id: 'green', name: 'Verde', color: '#22c55e' },
    { id: 'red', name: 'Vermelho', color: '#ef4444' },
    { id: 'yellow', name: 'Amarelo', color: '#eab308' },
  ]
}

const MISSION_TYPES = [
  { id: 'vigilancia', label: 'Vigilância', desc: 'Patrulhamento e monitoramento' },
  { id: 'agricultura', label: 'Agricultura', desc: 'Pulverização e análise NDVI' },
  { id: 'mapeamento', label: 'Mapeamento', desc: 'Fotogrametria e LiDAR' },
  { id: 'seguranca', label: 'Segurança', desc: 'Operações táticas e busca' },
  { id: 'industrial', label: 'Industrial', desc: 'Inspeção de ativos' },
  { id: 'outro', label: 'Outro', desc: 'Missão personalizada' },
]

const FACTS = [
  'Drones podem carregar cargas úteis de até 70% do seu próprio peso.',
  'Drones agrícolas podem pulverizar até 40 hectares por hora.',
  'A autonomia média de um drone enterprise é de 90–360 minutos.',
  'LiDAR de drone mapeia o solo com precisão de 2 cm.',
  'Drones com câmera térmica detectam variações de 0,05°C.',
  'Sensores NDVI em drones identificam estresse hídrico em plantas.'
]

export function Configurator() {
  const {
    parts, colors, buildName, buildType, missionType,
    setPart, setColors, setBuildName, setMissionType, loadBuild
  } = useDroneState()
  const { fleets, createFleet, saveCurrentBuild, resetEditing } = useDroneStore()

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Tabs and view controller
  const [activeTab, setActiveTab] = useState('estrutura')
  const [wireframe, setWireframe] = useState(false)
  const [rotate3d, setRotate3d] = useState(false)

  // Summary modal
  const [showSummary, setShowSummary] = useState(false)

  // Fleet selector on save
  const [showFleetPicker, setShowFleetPicker] = useState(false)
  const [newFleetName, setNewFleetName] = useState('')
  const [showNewFleet, setShowNewFleet] = useState(false)
  const fleetInputRef = useRef(null)

  // Loading Preloader state
  const [loading, setLoading] = useState(true)
  const [loadingPercent, setLoadingPercent] = useState(0)
  const [loadingFact, setLoadingFact] = useState(FACTS[0])

  // Process project loading from URL search query if exists
  useEffect(() => {
    const loadId = searchParams.get('load')
    if (loadId) {
      loadBuild(loadId)
    } else {
      resetEditing()
    }
  }, [searchParams, loadBuild, resetEditing])

  // Preloader simulation
  useEffect(() => {
    let interval
    let factInterval

    const tick = () => {
      setLoadingPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          clearInterval(factInterval)
          setTimeout(() => setLoading(false), 200)
          return 100
        }
        return prev + Math.floor(Math.random() * 8) + 4
      })
    }

    interval = setInterval(tick, 80)
    factInterval = setInterval(() => {
      setLoadingFact(FACTS[Math.floor(Math.random() * FACTS.length)])
    }, 2000)

    return () => {
      clearInterval(interval)
      clearInterval(factInterval)
    }
  }, [])

  // State values selectors
  const totalWeight = Object.values(parts).reduce((sum, p) => sum + (p.weight || 0), 0)
  const totalCost = Object.values(parts).reduce((sum, p) => sum + (p.price || 0), 0)
  const autonomy = parts.battery?.flight || 90

  const handleSaveToFleet = async (fleetId) => {
    await saveCurrentBuild(fleetId)
    setShowFleetPicker(false)
    navigate('/dashboard')
  }

  const handleCreateAndSave = async () => {
    const name = newFleetName.trim()
    if (!name) return
    const fleet = createFleet(name)
    await handleSaveToFleet(fleet.id)
  }

  const handleSave = () => {
    setShowFleetPicker(true)
    setShowNewFleet(false)
    setNewFleetName('')
  }

  const handleShare = () => {
    const shareText = `DRØNE — ${buildName}\n` +
      `Estrutura: ${parts.frame.name} ($${parts.frame.price})\n` +
      `Bateria: ${parts.battery.name} ($${parts.battery.price})\n` +
      `Câmera: ${parts.camera.name} ($${parts.camera.price})\n` +
      `Motores: ${parts.motor.name} ($${parts.motor.price})\n` +
      `Hélices: ${parts.props.name} ($${parts.props.price})\n` +
      `Custo Total: $${totalCost} | Peso: ${(totalWeight / 1000).toFixed(1)}kg`
      
    navigator.clipboard.writeText(shareText)
      .then(() => alert('Projeto copiado para a área de transferência!'))
      .catch(() => alert('Falha ao copiar especificações.'))
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-industrial-bg">
        <div className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tighter text-industrial-fg mb-8">
          DRØ<span className="text-industrial-accent">NE</span>
        </div>
        <div className="w-64 sm:w-96 h-[2px] bg-industrial-border relative overflow-hidden rounded">
          <div 
            className="h-full bg-industrial-accent transition-all duration-300 ease-out" 
            style={{ width: `${Math.min(loadingPercent, 100)}%` }}
          ></div>
        </div>
        <div className="font-mono text-[10px] tracking-wider text-industrial-muted uppercase mt-4">
          CARREGANDO MÓDULOS 3D ... {Math.min(loadingPercent, 100)}%
        </div>
        <div className="font-mono text-xs text-industrial-fg-secondary mt-8 text-center max-w-sm px-4 italic leading-relaxed">
          "{loadingFact}"
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-industrial-bg text-industrial-fg animate-in">
      
      {/* Top telemetry performance strip */}
      <section className="grid grid-cols-3 border-b border-industrial-border bg-zinc-950/40">
        <div className="py-4 text-center border-r border-industrial-border">
          <div className="font-mono text-[9px] text-industrial-muted uppercase tracking-wider">
            Peso Estimado
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold mt-1 text-industrial-fg">
            {(totalWeight / 1000).toFixed(2)} kg
          </div>
          <div className="font-mono text-[9px] text-industrial-muted mt-0.5">
            Carga Útil Limite: 3.2 kg
          </div>
        </div>

        <div className="py-4 text-center border-r border-industrial-border">
          <div className="font-mono text-[9px] text-industrial-muted uppercase tracking-wider">
            Autonomia de Voo
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold mt-1 text-emerald-400">
            {autonomy} min
          </div>
          <div className="font-mono text-[9px] text-industrial-muted mt-0.5">
            Configuração Quad-X
          </div>
        </div>

        <div className="py-4 text-center">
          <div className="font-mono text-[9px] text-industrial-muted uppercase tracking-wider">
            Custo Total
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold mt-1 text-industrial-accent">
            ${totalCost}
          </div>
          <div className="font-mono text-[9px] text-industrial-muted mt-0.5">
            Peças + Integração
          </div>
        </div>
      </section>

      {/* Main Grid: left 3D viewport, right parameter controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        
        {/* Left Column - 3D Engine Frame */}
        <div className="lg:col-span-7 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-industrial-border flex flex-col justify-between bg-zinc-950/20">
          <div className="flex justify-between items-center mb-4">
            <div className="font-mono text-[10px] text-industrial-fg-secondary uppercase tracking-widest flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-industrial-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-industrial-accent"></span>
              </span>
              Visualização Espacial 3D
            </div>
            <Badge variant="accent">Procedural Render</Badge>
          </div>

          <div className="flex-1 min-h-[400px] h-[55vh] rounded overflow-hidden">
            <DroneCanvas wireframe={wireframe} rotate={rotate3d} />
          </div>

          {/* Interactive controls */}
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button 
              size="sm" 
              variant={rotate3d ? 'primary' : 'secondary'}
              onClick={() => setRotate3d(!rotate3d)}
              className="flex-1 font-mono text-[10px]"
            >
              <RotateCw size={12} className={rotate3d ? 'animate-spin' : ''} /> AUTOROTATE
            </Button>
            <Button 
              size="sm" 
              variant={wireframe ? 'primary' : 'secondary'}
              onClick={() => setWireframe(!wireframe)}
              className="flex-1 font-mono text-[10px]"
            >
              <Box size={12} /> WIREFRAME
            </Button>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => { setRotate3d(false); setWireframe(false); }}
              className="flex-1 font-mono text-[10px]"
            >
              <RotateCcw size={12} /> RESET VIEW
            </Button>
          </div>
        </div>

        {/* Right Column - Parameters Panels */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between bg-industrial-bg">
          
          <div>
            {/* Project Naming */}
            <div className="mb-6 pb-6 border-b border-industrial-border">
              <label className="font-mono text-[10px] uppercase text-industrial-muted mb-2 tracking-widest block">
                Identificação do Projeto
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={buildName}
                  onChange={(e) => setBuildName(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-industrial-border rounded-sm px-3 py-2 text-sm text-industrial-fg font-body focus:outline-none focus:border-industrial-accent"
                  placeholder="Ex: Drone Mapeamento R1"
                />
              </div>
              <p className="text-[10px] text-industrial-muted mt-2 font-mono italic">
                Active Category: {buildType}
              </p>
            </div>

            {/* Mission Type Selector */}
            <div className="mb-4 pb-4 border-b border-industrial-border">
              <label className="font-mono text-[10px] uppercase text-industrial-muted mb-2 tracking-widest block">
                Tipo de Missão
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {MISSION_TYPES.map((mt) => (
                  <button
                    key={mt.id}
                    onClick={() => setMissionType(mt.id)}
                    className={`px-2 py-1.5 text-[9px] font-mono uppercase tracking-wider border text-left transition-all ${
                      missionType === mt.id
                        ? 'border-industrial-accent bg-industrial-accent/5 text-industrial-accent font-bold'
                        : 'border-industrial-border bg-industrial-surface/20 text-industrial-fg-secondary hover:border-industrial-border-strong'
                    }`}
                    title={mt.desc}
                  >
                    {mt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Tabs Navigation */}
            <div className="flex border-b border-industrial-border mb-6">
              {[
                { id: 'estrutura', label: 'Chassis' },
                { id: 'energia', label: 'Payload/Energia' },
                { id: 'propulsao', label: 'Propulsão' },
                { id: 'pintura', label: 'Estética' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 pb-3 text-[10px] font-mono uppercase tracking-widest border-b-2 font-semibold transition-all ${
                    activeTab === tab.id 
                      ? 'border-industrial-accent text-industrial-accent' 
                      : 'border-transparent text-industrial-muted hover:text-industrial-fg'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Chassis (Estrutura) */}
            {activeTab === 'estrutura' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-industrial-fg-secondary">
                    Chassis Fibra de Carbono
                  </h3>
                  <span className="font-mono text-[9px] text-industrial-muted">
                    {OPTIONS.frame.length} opções
                  </span>
                </div>
                
                {OPTIONS.frame.map((item) => (
                  <div
                    key={item.name}
                    onClick={() => setPart('frame', item)}
                    className={`p-3 border transition-all cursor-pointer flex justify-between items-center rounded-sm ${
                      parts.frame.name === item.name
                        ? 'border-industrial-accent bg-industrial-accent/5'
                        : 'border-industrial-border bg-industrial-surface/20 hover:border-industrial-border-strong'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-semibold uppercase tracking-tight ${parts.frame.name === item.name ? 'text-industrial-accent' : 'text-industrial-fg'}`}>
                        {item.name}
                      </div>
                      <div className="text-[10px] font-mono text-industrial-muted mt-1">
                        {item.desc}
                      </div>
                    </div>
                    <div className={`font-mono text-xs ${parts.frame.name === item.name ? 'text-industrial-accent font-bold' : 'text-industrial-fg-secondary'}`}>
                      ${item.price}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Energia & Câmera */}
            {activeTab === 'energia' && (
              <div className="space-y-6">
                
                {/* Batteries */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-industrial-fg-secondary">
                      Bateria LiPo Integrada
                    </h3>
                  </div>
                  
                  {OPTIONS.battery.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setPart('battery', item)}
                      className={`p-3 border transition-all cursor-pointer flex justify-between items-center rounded-sm ${
                        parts.battery.name === item.name
                          ? 'border-industrial-accent bg-industrial-accent/5'
                          : 'border-industrial-border bg-industrial-surface/20 hover:border-industrial-border-strong'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-tight ${parts.battery.name === item.name ? 'text-industrial-accent' : 'text-industrial-fg'}`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-industrial-muted mt-1">
                          {item.desc}
                        </div>
                      </div>
                      <div className={`font-mono text-xs ${parts.battery.name === item.name ? 'text-industrial-accent font-bold' : 'text-industrial-fg-secondary'}`}>
                        ${item.price}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cameras */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-industrial-fg-secondary">
                      Payload Câmera & Sensores
                    </h3>
                  </div>
                  
                  {OPTIONS.camera.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setPart('camera', item)}
                      className={`p-3 border transition-all cursor-pointer flex justify-between items-center rounded-sm ${
                        parts.camera.name === item.name
                          ? 'border-industrial-accent bg-industrial-accent/5'
                          : 'border-industrial-border bg-industrial-surface/20 hover:border-industrial-border-strong'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-tight ${parts.camera.name === item.name ? 'text-industrial-accent' : 'text-industrial-fg'}`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-industrial-muted mt-1">
                          {item.desc}
                        </div>
                      </div>
                      <div className={`font-mono text-xs ${parts.camera.name === item.name ? 'text-industrial-accent font-bold' : 'text-industrial-fg-secondary'}`}>
                        ${item.price}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Tab: Propulsão */}
            {activeTab === 'propulsao' && (
              <div className="space-y-6">
                
                {/* Motors */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-industrial-fg-secondary">
                      Motores Brushless (Set x4)
                    </h3>
                  </div>
                  
                  {OPTIONS.motor.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setPart('motor', item)}
                      className={`p-3 border transition-all cursor-pointer flex justify-between items-center rounded-sm ${
                        parts.motor.name === item.name
                          ? 'border-industrial-accent bg-industrial-accent/5'
                          : 'border-industrial-border bg-industrial-surface/20 hover:border-industrial-border-strong'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-tight ${parts.motor.name === item.name ? 'text-industrial-accent' : 'text-industrial-fg'}`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-industrial-muted mt-1">
                          {item.desc}
                        </div>
                      </div>
                      <div className={`font-mono text-xs ${parts.motor.name === item.name ? 'text-industrial-accent font-bold' : 'text-industrial-fg-secondary'}`}>
                        ${item.price}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Props */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-mono text-[10px] uppercase tracking-wider text-industrial-fg-secondary">
                      Hélices Esportivas / Endurance
                    </h3>
                  </div>
                  
                  {OPTIONS.props.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => setPart('props', item)}
                      className={`p-3 border transition-all cursor-pointer flex justify-between items-center rounded-sm ${
                        parts.props.name === item.name
                          ? 'border-industrial-accent bg-industrial-accent/5'
                          : 'border-industrial-border bg-industrial-surface/20 hover:border-industrial-border-strong'
                      }`}
                    >
                      <div>
                        <div className={`text-xs font-semibold uppercase tracking-tight ${parts.props.name === item.name ? 'text-industrial-accent' : 'text-industrial-fg'}`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] font-mono text-industrial-muted mt-1">
                          {item.desc}
                        </div>
                      </div>
                      <div className={`font-mono text-xs ${parts.props.name === item.name ? 'text-industrial-accent font-bold' : 'text-industrial-fg-secondary'}`}>
                        ${item.price}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Tab: Pintura */}
            {activeTab === 'pintura' && (
              <div className="space-y-6">
                
                {/* Frame Color */}
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-industrial-fg-secondary mb-3">
                    Pintura da Estrutura
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {OPTIONS.colorsFrame.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setColors('frame', item.id)}
                        className={`p-2 border rounded-sm text-center cursor-pointer transition-all ${
                          colors.frame === item.id 
                            ? 'border-industrial-accent bg-zinc-900' 
                            : 'border-industrial-border bg-industrial-surface/20 hover:border-industrial-border-strong'
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full mx-auto mb-1 border border-industrial-border" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-mono text-[8px] text-industrial-muted uppercase">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accent details Color */}
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-industrial-fg-secondary mb-3">
                    Cor dos Detalhes (Acento / LED)
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {OPTIONS.colorsAccent.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setColors('accent', item.id)}
                        className={`p-2 border rounded-sm text-center cursor-pointer transition-all ${
                          colors.accent === item.id 
                            ? 'border-industrial-accent bg-zinc-900' 
                            : 'border-industrial-border bg-industrial-surface/20 hover:border-industrial-border-strong'
                        }`}
                      >
                        <div 
                          className="w-6 h-6 rounded-full mx-auto mb-1 border border-industrial-border" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-mono text-[8px] text-industrial-muted uppercase">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Action buttons footer */}
          <div className="mt-8 pt-6 border-t border-industrial-border">
            {/* Price list sum summary */}
            <div className="space-y-2 mb-6 font-mono text-[10px] text-industrial-fg-secondary">
              <div className="flex justify-between">
                <span>Estrutura ({parts.frame.name})</span>
                <span>${parts.frame.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Motores ({parts.motor.name})</span>
                <span>${parts.motor.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Bateria ({parts.battery.name})</span>
                <span>${parts.battery.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Payload ({parts.camera.name})</span>
                <span>${parts.camera.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Hélices ({parts.props.name})</span>
                <span>${parts.props.price}</span>
              </div>
              <div className="flex justify-between border-t border-industrial-border pt-2 text-xs font-bold text-industrial-accent">
                <span>TOTAL</span>
                <span>${totalCost}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                variant="primary" 
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-1.5 uppercase font-mono text-[10px] font-bold tracking-wider"
              >
                <Save size={14} /> Salvar Projeto
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setShowSummary(true)}
                className="w-full flex items-center justify-center gap-1.5 uppercase font-mono text-[10px]"
              >
                <FileText size={14} /> Resumo Técnico
              </Button>
            </div>
            <div className="mt-3">
              <Button 
                variant="secondary" 
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-1.5 uppercase font-mono text-[10px]"
              >
                <Share2 size={14} /> Compartilhar
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 mt-4 text-[9px] font-mono text-emerald-400 bg-zinc-950 p-2 border border-emerald-500/10 rounded-sm">
              <ShieldCheck size={12} /> SECURE CRYPTO CHECKSUM READY
            </div>
          </div>

        </div>

      </div>

      {/* Summary Modal */}
      {showSummary && (
        <SummaryModal onClose={() => setShowSummary(false)} />
      )}

      {/* Fleet Selector Overlay */}
      {showFleetPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-industrial-bg border border-industrial-border p-6 w-80 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-tight">Salvar em Frota</h3>
              <button onClick={() => setShowFleetPicker(false)} className="text-industrial-muted hover:text-industrial-fg cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-industrial-fg-secondary mb-4">
              Selecione a frota para <strong>{buildName}</strong>:
            </p>

            {fleets.length === 0 && !showNewFleet && (
              <p className="text-xs text-industrial-muted mb-4 italic">Nenhuma frota criada ainda.</p>
            )}

            <div className="space-y-1 max-h-48 overflow-y-auto mb-4">
              {fleets.map(f => (
                <button
                  key={f.id}
                  onClick={() => handleSaveToFleet(f.id)}
                  className="w-full text-left px-3 py-2 border border-industrial-border hover:border-industrial-accent/40 text-xs font-mono text-industrial-fg-secondary hover:text-industrial-fg cursor-pointer transition-colors flex items-center gap-2"
                >
                  <FolderPlus size={14} className="text-industrial-accent shrink-0" />
                  {f.name}
                </button>
              ))}
            </div>

            {showNewFleet ? (
              <div className="flex gap-2">
                <input
                  ref={fleetInputRef}
                  type="text"
                  value={newFleetName}
                  onChange={e => setNewFleetName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateAndSave()}
                  placeholder="Nome da nova frota"
                  className="flex-1 bg-zinc-950 border border-industrial-border px-2 py-1.5 text-xs text-industrial-fg font-mono focus:outline-none focus:border-industrial-accent"
                />
                <Button size="sm" variant="primary" onClick={handleCreateAndSave} className="text-[10px] font-mono px-2">
                  <Check size={12} />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => { setShowNewFleet(true); setTimeout(() => fleetInputRef.current?.focus(), 50) }}
                className="w-full text-left px-3 py-2 border border-dashed border-industrial-border hover:border-industrial-accent/40 text-xs font-mono text-industrial-accent cursor-pointer transition-colors flex items-center gap-2"
              >
                <Plus size={14} /> Nova Frota
              </button>
            )}

            <div className="mt-4 pt-3 border-t border-industrial-border">
              <button
                onClick={() => handleSaveToFleet(null)}
                className="w-full text-center text-[10px] font-mono text-industrial-muted hover:text-industrial-fg cursor-pointer transition-colors"
              >
                Salvar sem frota
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
export default Configurator
