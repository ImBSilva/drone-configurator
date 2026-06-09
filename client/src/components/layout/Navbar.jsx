import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '../ui/Button'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  // AppSec Demo Check: Simulated token storage check
  const token = localStorage.getItem('drone-auth-token')
  const username = localStorage.getItem('drone-auth-user') || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('drone-auth-token')
    localStorage.removeItem('drone-auth-user')
    navigate('/login')
  }

  const activeStyle = ({ isActive }) => 
    `text-sm font-medium tracking-wide transition-colors ${
      isActive ? 'text-industrial-accent font-semibold' : 'text-industrial-fg-secondary hover:text-industrial-fg'
    }`

  return (
    <header className="sticky top-0 z-50 w-full border-b border-industrial-border bg-industrial-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-2 font-display text-lg font-extrabold uppercase tracking-tighter text-industrial-fg no-underline">
          <span className="transition-colors duration-150 group-hover:text-industrial-accent">
            DRØ<span className="text-industrial-accent">NE</span>
          </span>
          <span className="hidden rounded-sm bg-industrial-border px-1 py-0.5 font-mono text-[8px] tracking-wider text-industrial-muted sm:inline-block border border-industrial-border-strong/30">
            Beta 0.5
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={activeStyle}>Início</NavLink>
          <NavLink to="/catalog" className={activeStyle}>Catálogo</NavLink>
          <NavLink to="/configurator" className={activeStyle}>Configurador 3D</NavLink>
          <NavLink to="/dashboard" className={activeStyle}>Minha Frota</NavLink>
        </nav>

        {/* Security and User Action Panel */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-1.5 rounded-sm bg-zinc-950 px-2 py-1 font-mono text-[9px] text-emerald-400 border border-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            APPSEC SECURE
          </div>

          {token ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="font-mono text-xs text-industrial-fg-secondary flex items-center gap-1 hover:text-industrial-accent transition-colors no-underline">
                <User size={12} className="text-industrial-accent" />
                {username}
              </Link>
              <Button size="sm" variant="ghost" onClick={handleLogout} className="h-8 py-0">
                <LogOut size={12} className="mr-1" /> Sair
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="ghost" className="h-8">
                Entrar
              </Button>
            </Link>
          )}

          <Link to="/configurator">
            <Button size="sm" variant="primary" className="h-8">
              Iniciar Build
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded p-1 text-industrial-fg-secondary hover:text-industrial-fg md:hidden"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-industrial-border bg-industrial-bg px-4 py-4 md:hidden animate-in">
          <nav className="flex flex-col gap-4">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className={activeStyle}>Início</NavLink>
            <NavLink to="/catalog" onClick={() => setMobileMenuOpen(false)} className={activeStyle}>Catálogo</NavLink>
            <NavLink to="/configurator" onClick={() => setMobileMenuOpen(false)} className={activeStyle}>Configurador 3D</NavLink>
            <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={activeStyle}>Minha Frota</NavLink>
            
            <hr className="border-industrial-border" />
            
            <div className="flex flex-col gap-3">
              {token ? (
                <>
                  <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="font-mono text-xs text-industrial-fg-secondary flex items-center gap-1 hover:text-industrial-accent transition-colors no-underline">
                    <User size={14} className="text-industrial-accent" />
                    Autenticado como: <strong>{username}</strong>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                    Sair da Conta
                  </Button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="secondary" className="w-full">
                    Entrar na Conta
                  </Button>
                </Link>
              )}
              
              <Link to="/configurator" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="primary" className="w-full">
                  Iniciar Build
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
export default Navbar
