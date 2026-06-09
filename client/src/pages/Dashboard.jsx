import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDroneStore } from '../store/droneStore'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SummaryModal } from '../components/SummaryModal'
import {
  Plus, Calendar, Eye, Trash2, Copy, BarChart3, Shield,
  Wallet, Compass, FolderPlus, Folder, ChevronDown, ChevronRight,
  Pencil, Check, X, Package, FileText
} from 'lucide-react'

function FleetSection({ fleet, builds, onRename, onDelete, onShowSummary }) {
  const [collapsed, setCollapsed] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(fleet.name)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const handleRename = () => {
    if (name.trim() && name !== fleet.name) {
      onRename(fleet.id, name.trim())
    } else {
      setName(fleet.name)
    }
    setEditing(false)
  }

  return (
    <div className="mb-8 border border-industrial-border bg-industrial-surface/10">
      {/* Fleet Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-industrial-border bg-zinc-950/30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-industrial-muted hover:text-industrial-fg cursor-pointer shrink-0"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <Folder size={16} className="text-industrial-accent shrink-0" />
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                ref={inputRef}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRename()}
                className="bg-zinc-950 border border-industrial-border px-2 py-0.5 text-sm font-bold uppercase tracking-tight text-industrial-fg font-body focus:outline-none focus:border-industrial-accent w-48"
              />
              <button onClick={handleRename} className="text-industrial-accent hover:text-industrial-accent-hover cursor-pointer">
                <Check size={14} />
              </button>
              <button onClick={() => { setName(fleet.name); setEditing(false) }} className="text-industrial-muted hover:text-industrial-fg cursor-pointer">
                <X size={14} />
              </button>
            </div>
          ) : (
            <h3
              className="text-sm font-bold uppercase tracking-tight cursor-pointer hover:text-industrial-accent transition-colors"
              onClick={() => setEditing(true)}
              title="Clique para renomear"
            >
              {fleet.name}
            </h3>
          )}
          <span className="font-mono text-[10px] text-industrial-muted shrink-0">
            {builds.length} drone{builds.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing(true)}
            className="text-industrial-muted hover:text-industrial-fg cursor-pointer"
            title="Renomear frota"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(fleet.id, fleet.name)}
            className="text-industrial-muted hover:text-rose-400 cursor-pointer"
            title="Excluir frota"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Fleet Builds */}
      {!collapsed && (
        <div className="p-4">
          {builds.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-industrial-border">
              <div className="font-mono text-[10px] text-industrial-muted">
                Frota vazia — adicione drones do catálogo ou do configurador.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {builds.slice().reverse().map((build) => {
                const dateStr = new Date(build.date).toLocaleDateString('pt-BR')
                const partsList = Object.values(build.parts || {}).join(', ')

                return (
                  <FleetDroneCard key={build.id} build={build} dateStr={dateStr} partsList={partsList} onShowSummary={onShowSummary} />
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const MISSION_BADGE = {
  vigilancia: { label: 'Vigilância', variant: 'accent' },
  agricultura: { label: 'Agricultura', variant: 'success' },
  mapeamento: { label: 'Mapeamento', variant: 'warning' },
  seguranca: { label: 'Segurança', variant: 'accent' },
  industrial: { label: 'Industrial', variant: 'neutral' },
  outro: { label: 'Outro', variant: 'neutral' },
}

function FleetDroneCard({ build, dateStr, partsList, onShowSummary }) {
  const navigate = useNavigate()
  const { duplicateBuild, deleteBuild, fleets, addToFleet, removeFromFleet } = useDroneStore()

  const currentFleet = fleets.find(f => f.id === build.fleetId)
  const mission = MISSION_BADGE[build.missionType] || MISSION_BADGE.outro
  const dailyRate = build.dailyRate ?? Math.round((build.total || 0) * 0.08)

  const handleFleetChange = (e) => {
    const val = e.target.value
    if (val === '') {
      removeFromFleet(build.id)
    } else {
      addToFleet(build.id, Number(val))
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Excluir "${build.name}" permanentemente?`)) {
      deleteBuild(build.id)
    }
  }

  return (
    <div className="border border-industrial-border bg-industrial-bg p-4 flex flex-col justify-between hover:border-industrial-border-strong transition-all duration-300">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-xs font-bold uppercase tracking-tight text-industrial-fg max-w-[65%] truncate">
            {build.name || 'Projeto sem nome'}
          </h4>
          <Badge variant="neutral" className="flex items-center gap-1 shrink-0">
            <Calendar size={9} /> {dateStr}
          </Badge>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant={mission.variant} className="text-[9px] flex items-center gap-1">
            <Shield size={8} /> {mission.label}
          </Badge>
          {currentFleet && (
            <span className="font-mono text-[8px] text-industrial-muted flex items-center gap-1">
              <Folder size={8} /> {currentFleet.name}
            </span>
          )}
        </div>

        <div className="text-[9px] font-mono text-industrial-muted leading-relaxed mb-3 bg-zinc-950/20 p-2 rounded border border-industrial-border/30">
          {partsList || (build.catalogId ? 'Modelo do catálogo' : 'Sem componentes')}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 mb-1">
          <span className="font-mono text-[9px] text-industrial-muted uppercase tracking-wider shrink-0">
            Valor Total
          </span>
          <span className="font-mono text-sm font-bold text-industrial-accent">
            ${build.total?.toLocaleString() || '—'}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <span className="font-mono text-[9px] text-industrial-muted uppercase tracking-wider shrink-0">
            Diária
          </span>
          <span className="font-mono text-xs font-semibold text-industrial-fg-secondary">
            ${dailyRate.toLocaleString()}/dia
          </span>
        </div>

        {fleets.length > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <Folder size={10} className="text-industrial-muted shrink-0" />
            <select
              value={currentFleet ? String(currentFleet.id) : ''}
              onChange={handleFleetChange}
              className="w-full bg-zinc-950 border border-industrial-border text-[9px] font-mono text-industrial-fg px-1.5 py-1 focus:outline-none focus:border-industrial-accent cursor-pointer"
            >
              <option value="">Sem Frota</option>
              {fleets.map(f => (
                <option key={f.id} value={String(f.id)}>{f.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5">
          {build.catalogId ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/configurator')}
              className="py-1 text-[8px] uppercase font-mono flex items-center justify-center gap-1"
            >
              <Eye size={10} /> Customizar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/configurator?load=${build.id}`)}
              className="py-1 text-[8px] uppercase font-mono flex items-center justify-center gap-1"
            >
              <Eye size={10} /> Editar
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => duplicateBuild(build)}
            className="py-1 text-[8px] uppercase font-mono flex items-center justify-center gap-1"
          >
            <Copy size={10} /> Copiar
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onShowSummary?.(build)}
            className="py-1 text-[8px] uppercase font-mono flex items-center justify-center gap-1"
          >
            <FileText size={10} /> Resumo
          </Button>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          className="w-full mt-1.5 py-1 text-[8px] uppercase font-mono text-rose-400 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500/20 flex items-center justify-center gap-1"
        >
          <Trash2 size={10} /> Excluir
        </Button>
      </div>
    </div>
  )
}

export function Dashboard() {
  const {
    savedBuilds, fleets, fetchConfigs,
    createFleet, deleteFleet, renameFleet
  } = useDroneStore()
  const [newFleetName, setNewFleetName] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [summaryBuild, setSummaryBuild] = useState(null)

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  // Builds not assigned to any fleet
  const unassigned = savedBuilds.filter(b => !b.fleetId)

  // Fleet stats
  const fleetCount = fleets.length
  const totalValue = savedBuilds.reduce((sum, b) => sum + (b.total || 0), 0)
  const averageValue = savedBuilds.length > 0 ? Math.round(totalValue / savedBuilds.length) : 0
  const totalComponents = savedBuilds.reduce((sum, b) => sum + Object.keys(b.parts || {}).length, 0)

  const handleCreateFleet = () => {
    const name = newFleetName.trim()
    if (!name) return
    createFleet(name)
    setNewFleetName('')
    setShowCreate(false)
  }

  const handleDeleteFleet = (id, name) => {
    if (window.confirm(`Excluir a frota "${name}"? Os drones serão movidos para "Sem Frota".`)) {
      deleteFleet(id)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-56px)] bg-industrial-bg text-industrial-fg px-4 sm:px-6 lg:px-8 py-8 animate-in">

      {/* Dashboard Header */}
      <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight">
            Minha Frota
          </h1>
          <p className="text-sm text-industrial-fg-secondary">
            Gerencie suas frotas e configure drones operacionais.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex items-center gap-2 uppercase font-mono text-xs tracking-wider"
            onClick={() => setShowCreate(true)}
          >
            <FolderPlus size={14} /> Nova Frota
          </Button>
          <Link to="/configurator">
            <Button variant="primary" className="flex items-center gap-2 uppercase font-mono text-xs tracking-wider">
              <Plus size={14} /> Novo Drone
            </Button>
          </Link>
        </div>
      </div>

      {/* Create Fleet Inline */}
      {showCreate && (
        <div className="max-w-7xl mx-auto w-full mb-6 p-4 border border-industrial-border bg-zinc-950/30 flex items-center gap-3">
          <FolderPlus size={18} className="text-industrial-accent shrink-0" />
          <input
            type="text"
            value={newFleetName}
            onChange={e => setNewFleetName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreateFleet()}
            placeholder="Nome da nova frota"
            className="flex-1 bg-zinc-950 border border-industrial-border px-3 py-1.5 text-sm text-industrial-fg font-body focus:outline-none focus:border-industrial-accent"
            autoFocus
          />
          <Button size="sm" variant="primary" onClick={handleCreateFleet} className="text-[10px] font-mono">
            <Check size={14} /> Criar
          </Button>
          <button onClick={() => { setShowCreate(false); setNewFleetName('') }} className="text-industrial-muted hover:text-industrial-fg cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-2 lg:grid-cols-4 gap-px bg-industrial-border border border-industrial-border rounded-sm overflow-hidden mb-10 shadow-md">
        <div className="bg-industrial-surface p-6 text-center">
          <div className="font-mono text-3xl font-extrabold text-industrial-accent">{fleetCount}</div>
          <div className="font-mono text-[9px] uppercase text-industrial-muted mt-2 tracking-wider flex items-center justify-center gap-1">
            <Folder size={10} /> Frotas Ativas
          </div>
        </div>
        <div className="bg-industrial-surface p-6 text-center">
          <div className="font-mono text-3xl font-extrabold text-industrial-accent">
            ${totalValue.toLocaleString()}
          </div>
          <div className="font-mono text-[9px] uppercase text-industrial-muted mt-2 tracking-wider flex items-center justify-center gap-1">
            <Wallet size={10} /> Valor da Frota
          </div>
        </div>
        <div className="bg-industrial-surface p-6 text-center">
          <div className="font-mono text-3xl font-extrabold text-industrial-accent">
            ${averageValue.toLocaleString()}
          </div>
          <div className="font-mono text-[9px] uppercase text-industrial-muted mt-2 tracking-wider flex items-center justify-center gap-1">
            <BarChart3 size={10} /> Custo Médio
          </div>
        </div>
        <div className="bg-industrial-surface p-6 text-center">
          <div className="font-mono text-3xl font-extrabold text-industrial-accent">{totalComponents}</div>
          <div className="font-mono text-[9px] uppercase text-industrial-muted mt-2 tracking-wider flex items-center justify-center gap-1">
            <Compass size={10} /> Componentes
          </div>
        </div>
      </div>

      {/* Fleet Sections */}
      <div className="max-w-7xl mx-auto w-full">
        {fleets.length === 0 && unassigned.length === 0 ? (
          <div className="border border-dashed border-industrial-border py-16 px-4 text-center rounded-sm max-w-xl mx-auto mt-8">
            <div className="text-3xl font-light text-industrial-muted opacity-30 mb-4">◈</div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-industrial-fg mb-2">
              Nenhuma Frota
            </h3>
            <p className="text-xs text-industrial-fg-secondary mb-6 max-w-xs mx-auto">
              Crie sua primeira frota para organizar os drones operacionais. Você pode adicionar modelos do catálogo ou criar configurações personalizadas.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="primary" size="sm" onClick={() => setShowCreate(true)}>
                <FolderPlus size={14} /> Criar Frota
              </Button>
              <Link to="/catalog">
                <Button variant="secondary" size="sm">
                  Ver Catálogo
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Fleets with builds */}
            {fleets.map(fleet => (
              <FleetSection
                key={fleet.id}
                fleet={fleet}
                builds={savedBuilds.filter(b => b.fleetId === fleet.id)}
                onRename={renameFleet}
                onDelete={handleDeleteFleet}
                onShowSummary={setSummaryBuild}
              />
            ))}

            {/* Unassigned builds */}
            {unassigned.length > 0 && (
              <div className="mb-8 border border-dashed border-industrial-border bg-industrial-surface/5">
                <div className="flex items-center justify-between px-4 py-3 border-b border-industrial-border bg-zinc-950/20">
                  <div className="flex items-center gap-3">
                    <Package size={16} className="text-industrial-muted" />
                    <h3 className="text-sm font-bold uppercase tracking-tight text-industrial-muted">
                      Sem Frota
                    </h3>
                    <span className="font-mono text-[10px] text-industrial-muted">
                      {unassigned.length} drone{unassigned.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {unassigned.slice().reverse().map((build) => {
                      const dateStr = new Date(build.date).toLocaleDateString('pt-BR')
                      const partsList = Object.values(build.parts || {}).join(', ')
                      return (
                  <FleetDroneCard key={build.id} build={build} dateStr={dateStr} partsList={partsList} onShowSummary={setSummaryBuild} />
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Modal */}
      {summaryBuild && (
        <SummaryModal build={summaryBuild} onClose={() => setSummaryBuild(null)} />
      )}
    </div>
  )
}

export default Dashboard
