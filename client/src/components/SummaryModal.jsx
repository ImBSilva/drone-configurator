import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDroneState } from '../hooks/useDroneState'
import { DroneCanvas } from './canvas/DroneCanvas'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import {
  Printer, Copy, ChevronLeft,
  Calendar, Weight, Clock, DollarSign,
  Cpu, Layers, Shield, X
} from 'lucide-react'

const MISSION_LABELS = {
  vigilancia: 'Vigilância',
  agricultura: 'Agricultura',
  mapeamento: 'Mapeamento',
  seguranca: 'Segurança',
  industrial: 'Industrial',
  outro: 'Outro',
}

const COLOR_NAMES = {
  carbon: '#2a2a2a', white: '#e8e8e8', orange: '#ff5500',
  blue: '#2563eb', olive: '#4a5d23', desert: '#c4a46c',
  cyan: '#06b6d4', green: '#22c55e', red: '#ef4444',
  yellow: '#eab308',
}

const WEIGHT_MAP = {
  frame: { 'X8 Carbon': 220, 'X8 Carbon Pro': 195, 'Nano Carbon': 80, 'Race X5': 140 },
  battery: { '6S 5200mAh': 380, '6S 4200mAh': 320, '4S 2200mAh': 190, '4S 1800mAh': 160 },
  camera: { '4K 60fps': 85, '6K Cinema': 140, '1080p 120fps': 45, 'Térmica + 4K': 210 },
  motor: { 'R-Link 2207': 128, 'Pro 2208': 144, 'Sprint 2306': 120, 'Cruise 2806': 160 },
  props: { '5" Freestyle': 28, '7" Endurance': 36, 'Dobráveis': 32, '3" Racing': 20 },
}

const FLIGHT_MAP = {
  '6S 5200mAh': 360, '6S 4200mAh': 240, '4S 2200mAh': 150, '4S 1800mAh': 90,
}

function useBuildData(build) {
  const current = useDroneState()

  return useMemo(() => {
    if (!build) return current

    const parts = {}
    Object.keys(build.parts || {}).forEach((category) => {
      const name = build.parts[category]
      const price = build.prices?.[category] || 0
      const weight = WEIGHT_MAP[category]?.[name] || 0
      const flight = category === 'battery' ? (FLIGHT_MAP[name] || 90) : undefined
      parts[category] = { name, price, weight, flight }
    })

    const missingCategories = ['frame', 'battery', 'camera', 'motor', 'props'].filter(
      (c) => !parts[c]
    )
    missingCategories.forEach((c) => {
      parts[c] = current.parts[c] || { name: '—', price: 0, weight: 0 }
    })

    const totalWeight = Object.values(parts).reduce((sum, p) => sum + (p.weight || 0), 0)
    const totalPrice = Object.values(parts).reduce((sum, p) => sum + (p.price || 0), 0)
    const flightTime = parts.battery?.flight || 90
    const dailyRate = Math.round(totalPrice * 0.08)

    return {
      parts,
      colors: build.colors || current.colors,
      buildName: build.name || current.buildName,
      missionType: build.missionType || current.missionType,
      calcs: {
        totalWeightGrams: totalWeight,
        totalWeightKg: (totalWeight / 1000).toFixed(1),
        totalPrice,
        dailyRate,
        flightTime,
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [build])
}

export function SummaryModal({ build, onClose }) {
  const navigate = useNavigate()
  const { parts, colors, buildName, missionType, calcs } = useBuildData(build)

  const specs = useMemo(() => [
    { label: 'Peso Total', value: `${calcs.totalWeightKg} kg`, icon: <Weight size={14} /> },
    { label: 'Autonomia', value: `${calcs.flightTime} min`, icon: <Clock size={14} /> },
    { label: 'Custo Total', value: `$${calcs.totalPrice}`, icon: <DollarSign size={14} /> },
    { label: 'Diária Estimada', value: `$${calcs.dailyRate}/dia`, icon: <Calendar size={14} /> },
  ], [calcs])

  const dimensions = [
    { label: 'Envergadura', value: '680 mm (diagonal)' },
    { label: 'Altura', value: '210 mm' },
    { label: 'Configuração', value: 'Quadricóptero X' },
    { label: 'Motores', value: '4 × Brushless' },
  ]

  const handlePrint = () => window.print()
  const handleCopySpecs = () => {
    const lines = [
      `DRØNE — Resumo Técnico`,
      `Projeto: ${buildName}`,
      `Missão: ${MISSION_LABELS[missionType] || missionType}`,
      ``,
      `Componentes:`,
      `  Estrutura: ${parts.frame?.name || '—'} ($${parts.frame?.price || 0})`,
      `  Motores: ${parts.motor?.name || '—'} ($${parts.motor?.price || 0})`,
      `  Bateria: ${parts.battery?.name || '—'} ($${parts.battery?.price || 0})`,
      `  Câmera: ${parts.camera?.name || '—'} ($${parts.camera?.price || 0})`,
      `  Hélices: ${parts.props?.name || '—'} ($${parts.props?.price || 0})`,
      ``,
      `Peso Total: ${calcs.totalWeightKg} kg`,
      `Autonomia: ${calcs.flightTime} min`,
      `Custo Total: $${calcs.totalPrice}`,
      `Diária: $${calcs.dailyRate}/dia`,
    ]
    navigator.clipboard.writeText(lines.join('\n'))
  }

  const buildId = build?.id || build?._id

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 pt-4 pb-4">
      <div className="relative w-full max-w-5xl mx-4 bg-industrial-bg border border-industrial-border shadow-2xl animate-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-industrial-muted hover:text-industrial-fg cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="border-b border-industrial-border bg-zinc-950/30">
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={onClose} className="text-industrial-muted hover:text-industrial-fg transition-colors cursor-pointer">
                    <ChevronLeft size={16} />
                  </button>
                  <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight">Resumo Técnico</h1>
                </div>
                <p className="text-sm text-industrial-fg-secondary">
                  {buildName}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={handleCopySpecs}
                  className="font-mono text-[10px] uppercase">
                  <Copy size={12} /> Copiar Specs
                </Button>
                <Button size="sm" variant="secondary" onClick={handlePrint}
                  className="font-mono text-[10px] uppercase">
                  <Printer size={12} /> Exportar PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column */}
            <div>

              {/* Mission Badge */}
              <div className="mb-6">
                <Badge variant="accent" className="text-[10px]">
                  <Shield size={10} />
                  {MISSION_LABELS[missionType] || missionType}
                </Badge>
              </div>

              {/* Components Card */}
              <div className="border border-industrial-border p-5 mb-6 bg-industrial-surface/10">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-industrial-accent mb-4 flex items-center gap-1.5">
                  <Cpu size={12} /> Componentes Selecionados
                </h3>
                {[
                  { name: parts.frame?.name, detail: 'Estrutura · Chassis', price: parts.frame?.price, weight: parts.frame?.weight },
                  { name: parts.motor?.name, detail: 'Motores (×4) · Brushless', price: parts.motor?.price, weight: parts.motor?.weight },
                  { name: parts.battery?.name, detail: 'Bateria · LiPo', price: parts.battery?.price, weight: parts.battery?.weight },
                  { name: parts.camera?.name, detail: 'Payload · Câmera/Sensor', price: parts.camera?.price, weight: parts.camera?.weight },
                  { name: parts.props?.name, detail: 'Hélices · Policarbonato', price: parts.props?.price, weight: parts.props?.weight },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2.5 border-b border-industrial-border/50 last:border-b-0">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-tight text-industrial-fg">{item.name || '—'}</div>
                      <div className="text-[10px] font-mono text-industrial-muted mt-0.5">{item.detail} · {item.weight || 0}g</div>
                    </div>
                    <div className="font-mono text-xs text-industrial-fg-secondary">${item.price || 0}</div>
                  </div>
                ))}
              </div>

              {/* Specs Table */}
              <div className="border border-industrial-border p-5 mb-6 bg-industrial-surface/10">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-industrial-accent mb-4 flex items-center gap-1.5">
                  <Layers size={12} /> Especificações Técnicas
                </h3>
                <table className="w-full font-mono text-[11px]">
                  <tbody>
                    {[
                      { label: 'Peso total', value: `${calcs.totalWeightKg} kg` },
                      { label: 'Autonomia estimada', value: `${calcs.flightTime} min` },
                      { label: 'Carga máxima', value: '3.2 kg' },
                      { label: 'Alcance máximo', value: '22 km' },
                      { label: 'Configuração', value: 'Quadricóptero X' },
                      { label: 'Bateria', value: parts.battery?.name || '—' },
                      { label: 'Câmera', value: parts.camera?.name || '—' },
                      { label: 'Hélices', value: parts.props?.name || '—' },
                      ...dimensions.map(d => ({ label: d.label, value: d.value })),
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-industrial-border/30">
                        <td className="py-2 text-industrial-muted pr-4 w-1/2">{row.label}</td>
                        <td className="py-2 text-industrial-fg font-semibold">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Right Column */}
            <div>

              {/* 3D Preview */}
              <div className="border border-industrial-border bg-zinc-950/40 mb-6 overflow-hidden" style={{ aspectRatio: '16/10' }}>
                <DroneCanvas wireframe={false} rotate={true} />
              </div>

              {/* Color Info */}
              <div className="border border-industrial-border p-4 mb-6 bg-industrial-surface/10 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase text-industrial-muted">Frame:</span>
                  <span className="w-5 h-5 rounded-full border border-industrial-border inline-block" style={{ backgroundColor: COLOR_NAMES[colors.frame] || '#2a2a2a' }} />
                  <span className="font-mono text-[10px] uppercase text-industrial-fg-secondary">{colors.frame}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase text-industrial-muted">Acento:</span>
                  <span className="w-5 h-5 rounded-full border border-industrial-border inline-block" style={{ backgroundColor: COLOR_NAMES[colors.accent] || '#ff5500' }} />
                  <span className="font-mono text-[10px] uppercase text-industrial-fg-secondary">{colors.accent}</span>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="border border-industrial-border p-5 mb-6 bg-industrial-surface/10">
                <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-industrial-accent mb-4">
                  Desempenho Estimado
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {specs.map((spec, i) => (
                    <div key={i} className="border border-industrial-border/50 p-4 text-center bg-zinc-950/20">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-industrial-muted uppercase mb-2">
                        {spec.icon} {spec.label}
                      </div>
                      <div className="font-mono text-xl font-bold text-industrial-fg">{spec.value}</div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-industrial-border pt-4 text-right">
                  <div className="text-[10px] font-mono text-industrial-muted uppercase">Valor de Mercado</div>
                  <div className="font-mono text-3xl font-bold text-industrial-accent">${calcs.totalPrice}</div>
                  <div className="text-[10px] font-mono text-industrial-fg-secondary mt-1">
                    Diária: <strong className="text-industrial-accent">${calcs.dailyRate}</strong> · Peças + Integração
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Button
                    variant="secondary"
                    className="flex-1 font-mono text-[10px] uppercase justify-center"
                    onClick={() => {
                      onClose()
                      navigate(buildId ? `/configurator?load=${buildId}` : '/configurator')
                    }}
                  >
                    Editar Configuração
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryModal
