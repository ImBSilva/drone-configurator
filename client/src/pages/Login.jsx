import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Lock, Mail, Key, ShieldAlert, CheckCircle } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { login as apiLogin } from '../services/api'

export function Login() {
  const [activeTab, setActiveTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
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

  const scanInput = (val, fieldName) => {
    const hasNoSql = /[$!{}]/.test(val) && (val.includes('$gt') || val.includes('$ne') || val.includes('$where') || val.includes('$eq') || val.includes('$regex'));
    const hasXss = /<script|javascript:|onclick|onerror|onload/i.test(val);
    if (hasNoSql) {
      setSecWarning(`[AppSec Warning] Tentativa de NoSQL Injection detectada no campo "${fieldName}". Sanitização bloqueou o caractere especial.`);
      return false;
    }
    if (hasXss) {
      setSecWarning(`[AppSec Warning] Tentativa de Cross-Site Scripting (XSS) detectada no campo "${fieldName}". Carregamento bloqueado.`);
      return false;
    }
    return true;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setEmailError('')
    setPwError('')
    setSecWarning('')
    setSuccessMsg('')

    if (!scanInput(email, 'Email') || !scanInput(password, 'Senha')) {
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await apiLogin(email.trim(), password)

      localStorage.setItem('drone-auth-token', data.token)
      localStorage.setItem('drone-auth-user', data.user.name)
      localStorage.setItem('drone-auth-email', data.user.email)
      localStorage.setItem('drone-session', JSON.stringify(data.user))

      setSuccessMsg(`Bem-vindo, ${data.user.name}! Autenticação bem-sucedida.`)

      setTimeout(() => {
        navigate('/dashboard')
      }, 1200)
    } catch (error) {
      const message = error.response?.data?.message || 'Falha na autenticação. Verifique o servidor.'
      if (error.response?.status === 401) {
        setPwError(message)
      } else {
        setEmailError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    setSecWarning('')
    setEmailError('')
    setSuccessMsg('')

    if (!scanInput(forgotEmail, 'Email Recuperação')) {
      return
    }

    setSuccessMsg('Simulação: em produção, um token de redefinição seria enviado ao email corporativo.')
    setTimeout(() => setActiveTab('login'), 2000)
  }

  return (
    <div className="auth-layout min-h-[calc(100vh-3.5rem)] grid grid-cols-1 md:grid-cols-2 bg-industrial-bg">
      {/* Form Area */}
      <div className="flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 relative bg-blueprint">
        <div className="w-full max-w-md space-y-8 bg-industrial-surface/90 border border-industrial-border p-8 rounded shadow-2xl relative z-10 backdrop-blur-sm">
          
          {/* Custom Tabs */}
          <div className="flex border-b border-industrial-border pb-3 mb-6">
            <button 
              onClick={() => { setActiveTab('login'); setSecWarning(''); setEmailError(''); setPwError(''); }}
              className={`flex-1 text-center font-mono text-xs uppercase tracking-wider pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'login' 
                  ? 'border-industrial-accent text-industrial-fg font-semibold' 
                  : 'border-transparent text-industrial-fg-secondary hover:text-industrial-fg'
              }`}
            >
              Autenticação
            </button>
            <button 
              onClick={() => { setActiveTab('forgot'); setSecWarning(''); setEmailError(''); setPwError(''); }}
              className={`flex-1 text-center font-mono text-xs uppercase tracking-wider pb-2 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'forgot' 
                  ? 'border-industrial-accent text-industrial-fg font-semibold' 
                  : 'border-transparent text-industrial-fg-secondary hover:text-industrial-fg'
              }`}
            >
              Recuperar Acesso
            </button>
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

          {/* Login tab content */}
          {activeTab === 'login' ? (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h1 className="text-xl font-bold font-display text-industrial-fg uppercase tracking-tight flex items-center gap-2">
                  <Shield className="text-industrial-accent" size={20} /> Acesso Restrito
                </h1>
                <p className="text-xs text-industrial-fg-secondary mt-1">
                  Acesse sua conta corporativa para gerenciar frotas e builds de drones industriais.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                    Email de Operador
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-industrial-muted" />
                    <input 
                      type="text" 
                      id="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operador@empresa.com"
                      className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-10 text-sm text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent font-mono transition-colors placeholder:text-industrial-muted"
                      required
                    />
                  </div>
                  {emailError && <p className="text-[10px] text-rose-400 font-mono mt-1">{emailError}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="pw" className="block text-xs font-mono uppercase tracking-wider text-industrial-fg-secondary">
                      Senha de Segurança
                    </label>
                  </div>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-3 text-industrial-muted" />
                    <input 
                      type="password" 
                      id="pw" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-10 text-sm text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent font-mono transition-colors placeholder:text-industrial-muted"
                      required
                    />
                  </div>
                  {pwError && <p className="text-[10px] text-rose-400 font-mono mt-1">{pwError}</p>}
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full justify-center h-10 mt-2 font-mono uppercase text-xs tracking-wider"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Autenticando...' : 'Confirmar Autenticação'}
                </Button>
              </form>

              <div className="relative my-6 text-center">
                <span className="bg-industrial-surface px-2 text-[10px] font-mono text-industrial-muted relative z-10 uppercase tracking-widest">
                  Ou Continuar com
                </span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-industrial-border"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  type="button" 
                  size="sm"
                  variant="secondary"
                  className="justify-center text-[10px] font-mono uppercase tracking-wider py-2"
                  onClick={() => alert('Simulação de Single Sign-On Corporativo via Active Directory')}
                >
                  AD Directory
                </Button>
                <Button 
                  type="button" 
                  size="sm"
                  variant="secondary"
                  className="justify-center text-[10px] font-mono uppercase tracking-wider py-2"
                  onClick={() => alert('Simulação de Chave Física Yubikey (MFA)')}
                >
                  Yubikey MFA
                </Button>
              </div>

              <p className="text-center font-mono text-xs text-industrial-fg-secondary mt-8">
                Novo operador? <Link to="/register" className="text-industrial-accent hover:underline">Solicitar Registro</Link>
              </p>
              

            </div>
          ) : (
            // Forgot Password tab
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h1 className="text-xl font-bold font-display text-industrial-fg uppercase tracking-tight flex items-center gap-2">
                  <Lock className="text-industrial-accent" size={20} /> Recuperar Acesso
                </h1>
                <p className="text-xs text-industrial-fg-secondary mt-1">
                  Digite seu email corporativo registrado para enviar um código temporário de redefinição de chave.
                </p>
              </div>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-xs font-mono uppercase tracking-wider text-industrial-fg-secondary mb-1">
                    Email Corporativo
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3 text-industrial-muted" />
                    <input 
                      type="text" 
                      id="forgot-email" 
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="operador@empresa.com"
                      className="w-full bg-industrial-bg border border-industrial-border rounded px-3 py-2 pl-10 text-sm text-industrial-fg focus:outline-none focus:border-industrial-accent focus:ring-1 focus:ring-industrial-accent font-mono transition-colors placeholder:text-industrial-muted"
                      required
                    />
                  </div>
                  {emailError && <p className="text-[10px] text-rose-400 font-mono mt-1">{emailError}</p>}
                  <p className="text-[9px] text-industrial-muted font-mono mt-1">
                    * Enviaremos um token de autenticação de 6 dígitos.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full justify-center h-10 mt-2 font-mono uppercase text-xs tracking-wider"
                >
                  Gerar Token de Segurança
                </Button>
              </form>

              <p className="text-center font-mono text-xs text-industrial-fg-secondary mt-6">
                <button 
                  onClick={() => { setActiveTab('login'); setSecWarning(''); setEmailError(''); }}
                  className="text-industrial-accent hover:underline bg-transparent border-0 cursor-pointer"
                >
                  Voltar para Autenticação
                </button>
              </p>
            </div>
          )}

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
          <div className="inline-flex items-center gap-1.5 rounded-sm bg-zinc-950 px-2 py-1 font-mono text-[10px] text-industrial-accent border border-industrial-accent/20">
            <Shield size={12} /> SISTEMA CRIPTOGRÁFICO ATIVO
          </div>
          
          <blockquote className="text-xl text-industrial-fg font-body font-light leading-relaxed">
            "A capacidade de configurar, simular e comprar em um só fluxo reduziu nosso ciclo de aquisição de drones em 60%, mantendo a conformidade com as diretivas de AppSec."
          </blockquote>
          
          <div>
            <p className="font-mono text-xs text-industrial-fg font-semibold uppercase tracking-wider">
              Diretoria de Operações
            </p>
            <p className="font-mono text-[10px] text-industrial-fg-secondary">
              Divisão de Segurança Patrimonial e Aérea
            </p>
          </div>

          <div className="pt-8 border-t border-industrial-border grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="font-mono text-xs text-industrial-muted uppercase">Conformidade</p>
              <p className="font-mono text-xs text-industrial-fg font-bold mt-1">OWASP Top 10 Core</p>
            </div>
            <div>
              <p className="font-mono text-xs text-industrial-muted uppercase">Autenticação</p>
              <p className="font-mono text-xs text-industrial-fg font-bold mt-1">Stateful Session JWT</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Login
