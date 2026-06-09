import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Building, Mail, Key, ShieldAlert, CheckCircle, Info, Calendar, Layers, Pen, Eye, EyeOff } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { getMe, updateProfile as apiUpdateProfile, updatePassword as apiUpdatePassword } from '../services/api'
import { useDroneStore } from '../store/droneStore'

const ROLE_LABELS = {
  gov: 'Governo / Defesa',
  agri: 'Agricultura de Precisão',
  geo: 'Geoespacial / LiDAR',
  security: 'Segurança / Vigilância',
  ind: 'Engenharia / Indústria',
  other: 'Outro',
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
  })
}

export function Profile() {
  const navigate = useNavigate()
  const { savedBuilds, fleets } = useDroneStore()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [role, setRole] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [pwRules, setPwRules] = useState({ len: false, num: false, upper: false })

  const [profileMsg, setProfileMsg] = useState('')
  const [profileError, setProfileError] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwError, setPwError] = useState('')
  const [secWarning, setSecWarning] = useState('')
  const [submittingProfile, setSubmittingProfile] = useState(false)
  const [submittingPw, setSubmittingPw] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('drone-auth-token')) {
      navigate('/login')
      return
    }
    getMe()
      .then(({ data }) => {
        setUser(data)
        setName(data.name || '')
        setOrg(data.org || '')
        setRole(data.role || '')
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handlePwChange = (e) => {
    const val = e.target.value
    setNewPassword(val)
    setPwRules({
      len: val.length >= 8,
      num: /\d/.test(val),
      upper: /[A-Z]/.test(val),
    })
  }

  const scanInput = (val, fieldName) => {
    const hasNoSql = /[$!{}]/.test(val) && (val.includes('$gt') || val.includes('$ne') || val.includes('$where') || val.includes('$eq') || val.includes('$regex'))
    const hasXss = /<script|javascript:|onclick|onerror|onload/i.test(val)
    if (hasNoSql) {
      setSecWarning(`[AppSec Warning] Tentativa de NoSQL Injection detectada no campo "${fieldName}".`)
      return false
    }
    if (hasXss) {
      setSecWarning(`[AppSec Warning] Tentativa de Cross-Site Scripting (XSS) detectada no campo "${fieldName}".`)
      return false
    }
    return true
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    setProfileError('')
    setSecWarning('')
    if (!scanInput(name, 'Nome') || !scanInput(org, 'Organização')) return
    setSubmittingProfile(true)
    try {
      const { data } = await apiUpdateProfile({ name: name.trim(), org: org.trim(), role })
      localStorage.setItem('drone-auth-user', data.user.name)
      setUser((prev) => ({ ...prev, name: data.user.name, org: data.user.org, role: data.user.role }))
      setProfileMsg('Perfil atualizado com sucesso.')
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Falha ao atualizar perfil.')
    } finally {
      setSubmittingProfile(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwMsg('')
    setPwError('')
    setSecWarning('')
    if (newPassword !== confirmPassword) {
      setPwError('As senhas não conferem.')
      return
    }
    if (newPassword.length < 8 || !/\d/.test(newPassword) || !/[A-Z]/.test(newPassword)) {
      setPwError('A senha não cumpre os requisitos de segurança.')
      return
    }
    setSubmittingPw(true)
    try {
      await apiUpdatePassword({ currentPassword, newPassword })
      setPwMsg('Senha alterada com sucesso.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err.response?.data?.message || 'Falha ao alterar senha.')
    } finally {
      setSubmittingPw(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-industrial-bg">
        <div className="font-mono text-xs text-industrial-muted animate-pulse">CARREGANDO PERFIL...</div>
      </div>
    )
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?'

  const stats = [
    { icon: Layers, label: 'Drones Configurados', value: savedBuilds.length },
    { icon: Layers, label: 'Frotas', value: fleets.length },
    { icon: Calendar, label: 'Membro desde', value: formatDate(user?.createdAt) },
  ]

  return (
    <div className="min-h-[calc(100vh-3.5rem)] grid grid-cols-1 md:grid-cols-2 bg-industrial-bg">
      {/* Form Area */}
      <div className="flex flex-col justify-start items-center px-4 py-10 sm:px-6 lg:px-8 relative bg-blueprint">
        <div className="w-full max-w-lg space-y-6 bg-industrial-surface/90 border border-industrial-border p-8 rounded shadow-2xl relative z-10 backdrop-blur-sm">

          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-industrial-accent/20 border border-industrial-accent/40 text-industrial-accent font-display text-xl font-bold">
              {initial}
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-industrial-fg uppercase tracking-tight">
                {user?.name}
              </h1>
              <p className="text-[11px] font-mono text-industrial-fg-secondary flex items-center gap-1">
                <Mail size={11} /> {user?.email}
              </p>
              <p className="text-[10px] font-mono text-industrial-muted mt-0.5">
                {ROLE_LABELS[user?.role] || user?.role}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-industrial-bg/50 border border-industrial-border rounded p-3 text-center">
                <s.icon size={14} className="mx-auto text-industrial-accent mb-1" />
                <p className="text-lg font-bold font-display text-industrial-fg">{s.value}</p>
                <p className="text-[9px] font-mono text-industrial-muted uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Security warnings */}
          {secWarning && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 font-mono text-[11px] leading-relaxed flex gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{secWarning}</span>
            </div>
          )}

          {profileMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-mono text-[11px] leading-relaxed flex gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>{profileMsg}</span>
            </div>
          )}

          {/* Edit Profile Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <h2 className="text-xs font-bold font-display text-industrial-fg uppercase tracking-wider flex items-center gap-2 border-b border-industrial-border pb-2">
              <Pen size={12} className="text-industrial-accent" /> Dados do Operador
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="profName" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-industrial-muted" />
                  <input
                    type="text"
                    id="profName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="profOrg" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                  Organização
                </label>
                <div className="relative">
                  <Building size={14} className="absolute left-3 top-3 text-industrial-muted" />
                  <input
                    type="text"
                    id="profOrg"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="Empresa / Órgão"
                    className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="profRole" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                Função Operacional
              </label>
              <select
                id="profRole"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors font-mono"
              >
                <option value="gov" className="bg-industrial-surface">Governo / Defesa</option>
                <option value="agri" className="bg-industrial-surface">Agricultura de Precisão</option>
                <option value="geo" className="bg-industrial-surface">Geoespacial / LiDAR</option>
                <option value="security" className="bg-industrial-surface">Segurança / Vigilância</option>
                <option value="ind" className="bg-industrial-surface">Engenharia / Indústria</option>
                <option value="other" className="bg-industrial-surface">Outro</option>
              </select>
            </div>

            {profileError && <p className="text-[10px] text-rose-400 font-mono">{profileError}</p>}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center h-9 font-mono uppercase text-xs tracking-wider"
              disabled={submittingProfile}
            >
              {submittingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>

          {/* Password Change */}
          <div className="border-t border-industrial-border pt-4">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-2 text-xs font-mono text-industrial-fg-secondary hover:text-industrial-accent transition-colors w-full text-left"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPassword ? 'Ocultar Alteração de Senha' : 'Alterar Senha de Acesso'}
            </button>

            {showPassword && (
              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                {pwMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-mono text-[11px] leading-relaxed flex gap-2">
                    <CheckCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{pwMsg}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="currentPw" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-3 text-industrial-muted" />
                    <input
                      type="password"
                      id="currentPw"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPw" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                      Nova Senha
                    </label>
                    <div className="relative">
                      <Key size={14} className="absolute left-3 top-3 text-industrial-muted" />
                      <input
                        type="password"
                        id="newPw"
                        value={newPassword}
                        onChange={handlePwChange}
                        placeholder="Mínimo 8 caracteres"
                        className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                      Requisitos
                    </label>
                    <div className="flex gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${pwRules.len ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-industrial-border text-industrial-muted'}`}>
                        8+ Caracteres
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${pwRules.num ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-industrial-border text-industrial-muted'}`}>
                        Número (0-9)
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${pwRules.upper ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-industrial-border text-industrial-muted'}`}>
                        Maiúscula (A-Z)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPw" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <Key size={14} className="absolute left-3 top-3 text-industrial-muted" />
                    <input
                      type="password"
                      id="confirmPw"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                      required
                    />
                  </div>
                </div>

                {pwError && <p className="text-[10px] text-rose-400 font-mono">{pwError}</p>}

                <Button
                  type="submit"
                  variant="secondary"
                  className="w-full justify-center h-9 font-mono uppercase text-xs tracking-wider"
                  disabled={submittingPw}
                >
                  {submittingPw ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Hero / Info Side */}
      <div className="hidden md:flex flex-col justify-center px-12 bg-industrial-surface border-l border-industrial-border relative overflow-hidden">
        <div className="absolute inset-0 bg-blueprint opacity-10"></div>

        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-industrial-accent/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-neon-blue/10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-sm bg-zinc-950 px-2 py-1 font-mono text-[10px] text-neon-blue border border-neon-blue/20">
            <Info size={12} /> PERFIL DO OPERADOR
          </div>

          <blockquote className="text-xl text-industrial-fg font-body font-light leading-relaxed">
            "A DRØNE oferece controle total sobre sua frota de drones. Seu perfil centraliza as credenciais e o histórico operacional em um só lugar."
          </blockquote>

          <div>
            <p className="font-mono text-xs text-industrial-fg font-semibold uppercase tracking-wider">
              {user?.name}
            </p>
            <p className="font-mono text-[10px] text-industrial-fg-secondary">
              {ROLE_LABELS[user?.role] || user?.role} &middot; {user?.org || 'Sem organização'}
            </p>
          </div>

          <div className="pt-8 border-t border-industrial-border grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="font-mono text-xs text-industrial-muted uppercase">Nível AppSec</p>
              <p className="font-mono text-xs text-industrial-fg font-bold mt-1">Conformidade OWASP</p>
            </div>
            <div>
              <p className="font-mono text-xs text-industrial-muted uppercase">Arquitetura</p>
              <p className="font-mono text-xs text-industrial-fg font-bold mt-1">Monorepo Separado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
