import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, User, Building, Mail, Key, ShieldAlert, CheckCircle, Info } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { register as apiRegister } from '../services/api'

export function Register() {
  const [name, setName] = useState('')
  const [org, setOrg] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState('')

  const [rules, setRules] = useState({
    len: false,
    num: false,
    upper: false
  })

  const [emailError, setEmailError] = useState('')
  const [pwError, setPwError] = useState('')
  const [secWarning, setSecWarning] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const session = localStorage.getItem('drone-auth-token')
    if (session) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handlePasswordChange = (e) => {
    const val = e.target.value
    setPassword(val)
    setRules({
      len: val.length >= 8,
      num: /\d/.test(val),
      upper: /[A-Z]/.test(val)
    })
  }

  const scanInput = (val, fieldName) => {
    const hasNoSql = /[$!{}]/.test(val) && (val.includes('$gt') || val.includes('$ne') || val.includes('$where') || val.includes('$eq') || val.includes('$regex'));
    const hasXss = /<script|javascript:|onclick|onerror|onload/i.test(val);
    if (hasNoSql) {
      setSecWarning(`[AppSec Warning] Tentativa de NoSQL Injection detectada no campo "${fieldName}". Sanitização impediu o carregamento.`);
      return false;
    }
    if (hasXss) {
      setSecWarning(`[AppSec Warning] Tentativa de Cross-Site Scripting (XSS) detectada no campo "${fieldName}". Operação bloqueada.`);
      return false;
    }
    return true;
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')
    setPwError('')
    setSecWarning('')
    setSuccessMsg('')

    if (
      !scanInput(name, 'Nome') || 
      !scanInput(org, 'Organização') || 
      !scanInput(email, 'Email') || 
      !scanInput(password, 'Senha') ||
      !scanInput(confirm, 'Confirmar Senha')
    ) {
      return
    }

    if (!email.includes('@')) {
      setEmailError('Email operacional inválido. Deve ser um domínio válido.')
      return
    }

    if (password !== confirm) {
      setPwError('As senhas de segurança não conferem.')
      return
    }

    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
      setPwError('A senha não cumpre os requisitos de segurança obrigatórios.')
      return
    }

    if (!role) {
      alert('Por favor, selecione sua função operacional.')
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await apiRegister({
        name: name.trim(),
        email: email.trim(),
        org: org.trim(),
        role,
        password
      })

      localStorage.setItem('drone-auth-token', data.token)
      localStorage.setItem('drone-auth-user', data.user.name)
      localStorage.setItem('drone-auth-email', data.user.email)
      localStorage.setItem('drone-session', JSON.stringify(data.user))

      setSuccessMsg(`Cadastro efetuado! Chaves geradas para ${data.user.name}. Redirecionando...`)

      setTimeout(() => {
        navigate('/dashboard')
      }, 1200)
    } catch (error) {
      const message = error.response?.data?.message || 'Falha no registro. Verifique o servidor.'
      if (error.response?.status === 409) {
        setEmailError(message)
      } else {
        setPwError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-layout min-h-[calc(100vh-3.5rem)] grid grid-cols-1 md:grid-cols-2 bg-industrial-bg">
      {/* Form Area */}
      <div className="flex flex-col justify-center items-center px-4 py-10 sm:px-6 lg:px-8 relative bg-blueprint">
        <div className="w-full max-w-lg space-y-6 bg-industrial-surface/90 border border-industrial-border p-8 rounded shadow-2xl relative z-10 backdrop-blur-sm">
          
          <div className="mb-4">
            <h1 className="text-xl font-bold font-display text-industrial-fg uppercase tracking-tight flex items-center gap-2">
              <Shield className="text-industrial-accent" size={20} /> Solicitar Credencial
            </h1>
            <p className="text-xs text-industrial-fg-secondary mt-1">
              Cadastre suas credenciais para gerenciar sua frota operacional e salvar seus designs 3D.
            </p>
          </div>

          {/* Warnings and Info Badges */}
          {secWarning && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 font-mono text-[11px] leading-relaxed flex gap-2">
              <ShieldAlert size={16} className="shrink-0 mt-0.5" />
              <span>{secWarning}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-mono text-[11px] leading-relaxed flex gap-2">
              <CheckCircle size={16} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Row: Name and Org */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="regName" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                  Nome Completo
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-industrial-muted" />
                  <input 
                    type="text" 
                    id="regName" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="regOrg" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                  Organização
                </label>
                <div className="relative">
                  <Building size={14} className="absolute left-3 top-3 text-industrial-muted" />
                  <input 
                    type="text" 
                    id="regOrg" 
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="Empresa / Órgão"
                    className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="regEmail" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                Email Operacional
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-industrial-muted" />
                <input 
                  type="text" 
                  id="regEmail" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@empresa.com"
                  className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                  required
                />
              </div>
              {emailError && <p className="text-[10px] text-rose-400 font-mono mt-1">{emailError}</p>}
            </div>

            {/* Row: Password & Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="regPassword" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-3 text-industrial-muted" />
                  <input 
                    type="password" 
                    id="regPassword" 
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                  Política de Senha
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${rules.len ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-industrial-border text-industrial-muted'}`}>
                    8+ Caracteres
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${rules.num ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-industrial-border text-industrial-muted'}`}>
                    Número (0-9)
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 border rounded ${rules.upper ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/5' : 'border-industrial-border text-industrial-muted'}`}>
                    Maiúscula (A-Z)
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Password & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="regConfirm" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-3 text-industrial-muted" />
                  <input 
                    type="password" 
                    id="regConfirm" 
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-9 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors placeholder:text-industrial-muted font-mono"
                    required
                  />
                </div>
                {pwError && <p className="text-[10px] text-rose-400 font-mono mt-1">{pwError}</p>}
              </div>

              <div>
                <label htmlFor="regRole" className="block text-[10px] font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                  Função Operacional
                </label>
                <select 
                  id="regRole" 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 text-xs text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent transition-colors font-mono"
                  required
                >
                  <option value="" className="bg-industrial-surface">Selecione...</option>
                  <option value="gov" className="bg-industrial-surface">Governo / Defesa</option>
                  <option value="agri" className="bg-industrial-surface">Agricultura de Precisão</option>
                  <option value="geo" className="bg-industrial-surface">Geoespacial / LiDAR</option>
                  <option value="security" className="bg-industrial-surface">Segurança / Vigilância</option>
                  <option value="ind" className="bg-industrial-surface">Engenharia / Indústria</option>
                  <option value="other" className="bg-industrial-surface">Outro</option>
                </select>
              </div>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full justify-center h-10 mt-4 font-mono uppercase text-xs tracking-wider"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Criar Conta Operacional'}
            </Button>
          </form>

          <p className="text-center font-mono text-xs text-industrial-fg-secondary pt-4 border-t border-industrial-border">
            Já possui acesso? <Link to="/login" className="text-industrial-accent hover:underline">Fazer Login</Link>
          </p>

        </div>
      </div>

      {/* Hero/Graphics Side */}
      <div className="hidden md:flex flex-col justify-center px-12 bg-industrial-surface border-l border-industrial-border relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-blueprint opacity-10"></div>
        
        {/* Glow Element */}
        <div className="absolute top-1/4 right-1/4 w-80 h-80 rounded-full bg-industrial-accent/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-neon-blue/10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-sm bg-zinc-950 px-2 py-1 font-mono text-[10px] text-neon-blue border border-neon-blue/20">
            <Info size={12} /> CONFIGURADOR DE GRAU MILITAR
          </div>
          
          <blockquote className="text-xl text-industrial-fg font-body font-light leading-relaxed">
            "Com a DRØNE, reduzimos nosso tempo de configuração de drone de 3 dias para 15 minutos. A gestão de frota integrada transformou nossas operações aéreas."
          </blockquote>
          
          <div>
            <p className="font-mono text-xs text-industrial-fg font-semibold uppercase tracking-wider">
              Coordenador de Voo
            </p>
            <p className="font-mono text-[10px] text-industrial-fg-secondary">
              Divisão de Mapeamento LiDAR e Agro
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
export default Register
